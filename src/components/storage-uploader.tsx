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
import { UploadCloud, File, X, CheckCircle, LoaderCircle } from 'lucide-react';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';

/**
 * A component for uploading files to Firebase Storage with progress indication.
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
          description: 'Please select a PDF file.',
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
        description: 'Please select a file and ensure you are logged in.',
      });
      return;
    }

    setIsUploading(true);
    setIsComplete(false);

    const uploadsCollection = collection(firestore, 'companies', user.uid, 'uploads');
    const uploadDocRef = await addDocumentNonBlocking(uploadsCollection, {
        fileName: file.name,
        createdAt: new Date().toISOString(),
        status: 'uploading',
        userId: user.uid,
    });
    
    if (!uploadDocRef) {
        setIsUploading(false);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create upload record in Firestore.' });
        return;
    }

    toast({
        title: 'Starting Upload...',
        description: `Your file "${file.name}" is being uploaded.`,
    });

    const storagePath = `uploads/${user.uid}/${uploadDocRef.id}/${file.name}`;
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);

    setUploadTask(task);

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
          title: 'Upload Failed',
          description: `An error occurred: ${error.message}`,
        });
      },
      () => {
        setIsUploading(false);
        setIsComplete(true);
        setUploadTask(null);
        getDownloadURL(task.snapshot.ref).then((downloadURL) => {
          toast({
            title: 'Upload Complete',
            description: `"${file.name}" is now being processed.`,
          });
        });
      }
    );
  };

  const handleCancel = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setIsUploading(false);
      setUploadTask(null);
      setProgress(0);
      toast({ title: 'Upload Cancelled' });
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
        <CardTitle>Upload Document for Processing</CardTitle>
        <CardDescription>
          Upload a PDF to automatically extract images and data. Max file size: 50MB.
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
              {file ? file.name : 'Click or drag a PDF file here'}
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
                {isUploading ? `${Math.round(progress)}%` : isComplete ? 'Complete' : 'Pending'}
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
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isUploading ? 'Uploading...' : isComplete ? 'Uploaded' : 'Upload & Process'}
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
