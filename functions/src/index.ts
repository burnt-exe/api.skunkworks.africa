/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions/v2';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import * as logger from 'firebase-functions/logger';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { PDFDocument } from 'pdf-lib';

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  initializeApp();
}

// Set global options for all functions
setGlobalOptions({ maxInstances: 10, memory: '1GiB', timeoutSeconds: 300 });

const db = getFirestore();
const storage = getStorage();
const bucket = storage.bucket();

/**
 * Triggered when a new PDF is uploaded to the 'uploads/' path in Firebase Storage.
 * This function extracts images from the PDF and saves them back to Storage,
 * then creates corresponding metadata documents in Firestore.
 */
export const processPdfForImageExtraction = onObjectFinalized(
  { cpu: 1 },
  async (event) => {
    const fileBucket = event.bucket;
    const filePath = event.data.name;
    const contentType = event.data.contentType;

    // Exit if the file is not a PDF or is not in the 'uploads/' directory
    if (!contentType?.startsWith('application/pdf') || !filePath?.startsWith('uploads/')) {
      logger.log(`Skipping file: ${filePath} (not a PDF in the uploads folder).`);
      return;
    }

    logger.log(`Processing new PDF: ${filePath}`);

    // Extract user and document IDs from the file path
    const pathParts = filePath.split('/');
    if (pathParts.length < 4) {
      logger.error('Invalid file path structure:', filePath);
      return;
    }
    const userId = pathParts[1];
    const uploadId = pathParts[2];

    try {
      // Download the PDF file from Storage
      const pdfFile = bucket.file(filePath);
      const [pdfBuffer] = await pdfFile.download();

      // Load the PDF using pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const imageObjects = pdfDoc.getObjects().filter((obj) => obj.get('Subtype')?.toString() === '/Image');
      
      logger.log(`Found ${imageObjects.length} potential image objects in PDF.`);
      
      if(imageObjects.length === 0) {
          logger.log("No extractable images found in the PDF.");
          // Update upload status to 'processed_no_images'
           await db.doc(`companies/${userId}/uploads/${uploadId}`).set({ status: 'processed_no_images' }, { merge: true });
          return;
      }

      // Process each image
      const imageProcessingPromises = imageObjects.map(async (imageObj, index) => {
        const imageBytes = (imageObj as any).dict.get('DecodeParms') === undefined
          ? (imageObj as any).contents
          : (imageObj as any).dict.get('SMask') !== undefined
            ? (imageObj as any).contents
            : null; // More complex image types might need more handling

        if (!imageBytes || imageBytes.length === 0) {
            logger.warn(`Skipping image object at index ${index} due to empty or unsupported content.`);
            return null;
        }

        const imageName = `image_${index}.jpg`; // Assume JPEG, could be improved
        const imageStoragePath = `extracted/${userId}/${uploadId}/${imageName}`;
        const imageFile = bucket.file(imageStoragePath);
        
        // Save the extracted image back to Storage
        await imageFile.save(Buffer.from(imageBytes), {
          metadata: { contentType: 'image/jpeg' },
        });

        const imageDocRef = db.collection('images').doc();
        await imageDocRef.set({
          userId: userId,
          originalPdfPath: filePath,
          extractedImagePath: imageStoragePath,
          createdAt: new Date().toISOString(),
          tags: [], // Placeholder for future AI tagging
          thumbnailUrl: '', // Placeholder for thumbnail generation
        });

        logger.log(`Successfully extracted and saved: ${imageStoragePath}`);
        return imageDocRef.id;
      });

      const results = await Promise.all(imageProcessingPromises);
      const extractedImageIds = results.filter(id => id !== null);

      // Update the original upload document status
      await db.doc(`companies/${userId}/uploads/${uploadId}`).set({
        status: 'processed_complete',
        extractedImageCount: extractedImageIds.length,
        extractedImageIds: extractedImageIds,
      }, { merge: true });

      logger.log(`Finished processing PDF. Extracted ${extractedImageIds.length} images.`);

    } catch (error) {
      logger.error(`Failed to process PDF ${filePath}:`, error);
       await db.doc(`companies/${userId}/uploads/${uploadId}`).set({ status: 'processing_failed', error: (error as Error).message }, { merge: true });
    }
  }
);
