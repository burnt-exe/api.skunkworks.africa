'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useFirebase } from '@/firebase/provider';
import { useUser } from '@/firebase/provider';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, File, X, CheckCircle, LoaderCircle, Sparkles } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';

/**
 * A component for uploading files directly to Firebase Storage and tracking the progress.
 * This approach avoids Server Action payload limits.
 */
export default function StorageUploader() {
  const { storage, firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Only PDF documents are accepted for this journey.',
        });
        return;
      }
      setFile(selectedFile);
      setIsComplete(false);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'Please select a document and ensure you are logged in to begin.',
      });
      return;
    }

    setIsUploading(true);
    setIsComplete(false);

    try {
      // 1. Create a document in Firestore to track the upload status.
      const uploadsCollection = collection(firestore, 'companies', user.uid, 'uploads');
      const uploadDocRef = await addDoc(uploadsCollection, {
        fileName: file.name,
        createdAt: new Date().toISOString(),
        status: 'uploading',
        userId: user.uid,
      });

      toast({
        title: 'Initiating Canvas...',
        description: `Your document "${file.name}" is being prepared.`,
      });
      
      // 2. Define the multi-tenant storage path.
      const storagePath = `uploads/${user.uid}/${uploadDocRef.id}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);
      
      setUploadTask(task);

      // 3. Listen to upload state changes.
      task.on(
        'state_changed',
        (snapshot) => {
          const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(currentProgress);
        },
        (error) => {
          setIsUploading(false);
          setUploadTask(null);
          toast({
            variant: 'destructive',
            title: 'A Moment of Turbulence',
            description: `The upload was interrupted: ${error.message}`,
          });
        },
        () => {
          // 4. On successful upload, finalize the state.
          setIsUploading(false);
          setIsComplete(true);
          setUploadTask(null);
          getDownloadURL(task.snapshot.ref).then((downloadURL) => {
            toast({
              title: 'Canvas Ready',
              description: `"${file.name}" has arrived. The backend will now process it.`,
            });
            // The Firebase Function will now take over automatically.
          });
        }
      );

    } catch (error) {
       setIsUploading(false);
       toast({
         variant: 'destructive',
         title: 'Firestore Error',
         description: error instanceof Error ? error.message : 'Could not create upload record in Firestore.',
       });
    }
  };

  const handleCancel = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setIsUploading(false);
      setUploadTask(null);
      setProgress(0);
      toast({ title: 'Process Paused' });
    }
  };

  const resetState = () => {
    setFile(null);
    setProgress(0);
    setIsComplete(false);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unlock Your Document's Visuals</CardTitle>
        <CardDescription>
          From static pages to a dynamic canvas. Liberate every image, graphic, and idea locked within your PDFs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="sr-only">
            File Upload
          </Label>
          <div
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {file ? file.name : 'Place your document here to begin the transformation.'}
            </p>
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {file && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <File className="h-4 w-4" />
                    <span>{file.name}</span>
                </div>
                {!isUploading && (
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetState}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Progress value={progress} />
             <p className="text-xs text-muted-foreground text-center">
                {isUploading ? `Analyzing... ${Math.round(progress)}%` : isComplete ? 'Extraction Complete' : 'Awaiting Command'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={!file || isUploading || isComplete || !user} className="flex-1">
            {isUploading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : isComplete ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isUploading ? 'Revealing...' : isComplete ? 'Revealed' : 'Begin Extraction'}
          </Button>
          {isUploading && (
            <Button variant="destructive" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
