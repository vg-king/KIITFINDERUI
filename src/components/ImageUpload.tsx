import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { imageService, ImageUploadResponse } from '@/services/imageService';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUploaded: (uploadResult: ImageUploadResponse | null) => void;
  onImageSelect?: (file: File | null) => void;
  preview?: string;
  className?: string;
  disabled?: boolean;
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageSelect,
  preview,
  className,
  disabled = false,
  maxSizeMB = 5
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    try {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return false;
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`Image size should be less than ${maxSizeMB}MB`);
        return false;
      }

      // Check supported formats
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedTypes.includes(file.type.toLowerCase())) {
        setError('Supported formats: JPG, PNG, GIF, WebP');
        return false;
      }

      setError('');
      return true;
    } catch (err) {
      setError('Failed to validate image file');
      return false;
    }
  };

  const uploadImage = async (file: File) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Call the parent's onImageSelect if provided (for preview)
      if (onImageSelect) {
        onImageSelect(file);
      }

      // Upload the image to the server
      const uploadResult = await imageService.uploadImage(file);
      
      setUploadProgress(100);
      
      toast({
        title: "Image uploaded successfully! 📸",
        description: "Your image has been uploaded and is ready to use.",
        variant: "default",
      });

      // Call the parent callback with the upload result
      onImageUploaded(uploadResult);

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload image');
      
      toast({
        title: "Upload failed",
        description: error.message || 'Failed to upload image. Please try again.',
        variant: "destructive",
      });

      // Reset selection on error
      if (onImageSelect) {
        onImageSelect(null);
      }
      onImageUploaded(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadImage(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    handleFiles(e.dataTransfer.files);
  }, [disabled, uploading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || uploading) return;
    handleFiles(e.target.files);
  };

  const removeImage = async () => {
    if (disabled || uploading) return;

    try {
      // If there's a preview URL from the server, try to delete it
      if (preview && preview.startsWith('http')) {
        await imageService.deleteImage(preview);
      }
    } catch (error) {
      console.warn('Failed to delete image from server:', error);
    }

    // Reset the component state
    if (onImageSelect) {
      onImageSelect(null);
    }
    onImageUploaded(null);
    setError('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {preview ? (
        <div className="relative group">
          <div className="relative rounded-xl overflow-hidden border-2 border-border/30 bg-card">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full h-8 w-8 p-0"
              onClick={removeImage}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {uploading ? 'Uploading...' : 'Image uploaded successfully'}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer",
            dragActive 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-border/50 hover:border-primary/50 hover:bg-primary/5",
            (disabled || uploading) && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && document.getElementById('image-upload')?.click()}
        >
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled || uploading}
          />
          
          <div className="space-y-4">
            <div className={cn(
              "w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300",
              dragActive ? "bg-primary/20 scale-110" : "bg-primary/10"
            )}>
              {uploading ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : dragActive ? (
                <Upload className="w-8 h-8 text-primary animate-bounce" />
              ) : (
                <ImageIcon className="w-8 h-8 text-primary" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                {uploading 
                  ? 'Uploading image...' 
                  : dragActive 
                    ? 'Drop your image here' 
                    : 'Upload an image'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {uploading 
                  ? 'Please wait while we process your image'
                  : 'Drag and drop an image here, or click to browse'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: JPG, PNG, GIF, WebP (max {maxSizeMB}MB)
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="w-full max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {uploadProgress}% uploaded
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive text-center animate-in slide-in-from-top-2 duration-300">
          {error}
        </p>
      )}
    </div>
  );
};
