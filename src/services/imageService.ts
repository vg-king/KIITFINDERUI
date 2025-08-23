import api from '@/api/axios';

export interface ImageUploadResponse {
  imageUrl: string;
  message: string;
}

export const imageService = {
  /**
   * Upload an image file to the server
   * @param file - The image file to upload
   * @returns Promise with the uploaded image details
   */
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    try {
      // Validate file before upload
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file); // Try 'file' instead of 'image'

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('FormData entries:', Array.from(formData.entries()));

      // Upload without explicitly setting Content-Type (let browser set it with boundary)
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': undefined, // Remove default JSON content type
        },
        timeout: 60000, // Increased timeout for file uploads
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Image upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error response:', JSON.stringify(error.response, null, 2));
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Bad request - please check the image format and size';
        throw new Error(errorMessage);
      } else if (error.response?.status === 413) {
        throw new Error('Image file is too large. Please choose a smaller image.');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported image format. Please use JPG, PNG, or GIF.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to upload image. Please try again.');
      }
    }
  },

  /**
   * Delete an uploaded image
   * @param imageUrl - The URL of the image to delete
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid image URL');
      }

      await api.delete(`/upload/image/${fileName}`);
    } catch (error: any) {
      console.error('Image delete error:', error);
      throw new Error('Failed to delete image');
    }
  },

  /**
   * Validate image file
   * @param file - The file to validate
   * @returns true if valid, throws error if invalid
   */
  validateImage(file: File): boolean {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size should be less than 5MB');
    }

    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Supported formats: JPG, PNG, GIF, WebP');
    }

    return true;
  },

  /**
   * Create a preview URL for an image file
   * @param file - The image file
   * @returns Promise with the preview URL
   */
  createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
};
