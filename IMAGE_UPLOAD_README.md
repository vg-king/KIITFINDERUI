# Image Upload API Integration

## Overview
The KIIT Finder application now supports image uploads through the backend API at `http://localhost:8080/api/upload/image`.

## Features Implemented

### 1. Image Upload Service (`src/services/imageService.ts`)
- **Upload images** to the backend API
- **Validate files** (type, size, format)
- **Handle errors** with user-friendly messages
- **Delete images** from the server
- **Create preview URLs** for local display

### 2. Enhanced ImageUpload Component (`src/components/ImageUpload.tsx`)
- **Drag & drop** functionality
- **Real-time upload progress** with progress bar
- **Image preview** before and after upload
- **Error handling** with toast notifications
- **File validation** (5MB max, JPG/PNG/GIF/WebP)
- **Upload status indicators**

### 3. Updated Form Pages
- **Report Lost** (`src/pages/ReportLost.tsx`)
- **Report Found** (`src/pages/ReportFound.tsx`)
- Both pages now include image upload with API integration

### 4. Enhanced Item Cards (`src/components/ItemCardNew.tsx`)
- **Display uploaded images** in a responsive layout
- **Status badge positioning** adapts to image presence
- **Hover effects** with image scaling

## API Integration Details

### Upload Endpoint
```
POST http://localhost:8080/api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### Request Format
```javascript
const formData = new FormData();
formData.append('image', file);
```

### Response Format
```javascript
{
  url: "http://localhost:8080/uploads/images/filename.jpg",
  fileName: "filename.jpg",
  size: 1024000,
  contentType: "image/jpeg"
}
```

### Error Handling
- **413 Payload Too Large**: File too big
- **415 Unsupported Media Type**: Invalid file format
- **401 Unauthorized**: Missing or invalid token
- **500 Internal Server Error**: Server issues

## Usage Examples

### Basic Upload
```tsx
import { ImageUpload } from '@/components/ImageUpload';
import { imageService } from '@/services/imageService';

const [uploadResult, setUploadResult] = useState(null);
const [preview, setPreview] = useState('');

const handleImageUploaded = (result) => {
  setUploadResult(result);
  if (result) {
    setPreview(result.url);
    // Save result.url to your form data
  }
};

<ImageUpload
  onImageUploaded={handleImageUploaded}
  preview={preview}
  disabled={isSubmitting}
/>
```

### Manual Upload
```tsx
import { imageService } from '@/services/imageService';

const uploadImage = async (file) => {
  try {
    const result = await imageService.uploadImage(file);
    console.log('Uploaded:', result.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

## File Validation Rules

### Supported Formats
- **JPEG/JPG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

### Size Limits
- **Maximum**: 5MB per file
- **Recommended**: Under 2MB for better performance

### Validation Logic
```javascript
// Type validation
if (!file.type.startsWith('image/')) {
  throw new Error('Please select an image file');
}

// Size validation
if (file.size > 5 * 1024 * 1024) {
  throw new Error('Image size should be less than 5MB');
}

// Format validation
const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!supportedTypes.includes(file.type.toLowerCase())) {
  throw new Error('Supported formats: JPG, PNG, GIF, WebP');
}
```

## Component Props

### ImageUpload Component
```typescript
interface ImageUploadProps {
  onImageUploaded: (uploadResult: ImageUploadResponse | null) => void;
  onImageSelect?: (file: File | null) => void;
  preview?: string;
  className?: string;
  disabled?: boolean;
  maxSizeMB?: number; // Default: 5
}
```

## Backend Requirements

### Expected API Response
```json
{
  "url": "http://localhost:8080/uploads/images/uuid-filename.jpg",
  "fileName": "uuid-filename.jpg",
  "size": 1024000,
  "contentType": "image/jpeg"
}
```

### Headers Required
- `Authorization: Bearer <jwt-token>`
- `Content-Type: multipart/form-data` (automatically set)

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Error code",
  "statusCode": 400
}
```

## Security Considerations

### Client-Side
- File type validation
- File size validation
- Authentication token required

### Server-Side (Expected)
- File type verification
- File size limits
- Virus scanning
- Image optimization
- Secure file storage
- Proper file naming (UUID)

## Performance Optimizations

### Image Upload
- **Progress tracking** with visual feedback
- **Timeout handling** (60 seconds for uploads)
- **Error recovery** with retry suggestions

### Image Display
- **Lazy loading** for better performance
- **Responsive images** with proper aspect ratios
- **Hover effects** with smooth transitions

## Testing

### Test Upload Flow
1. Select an image file
2. Verify progress bar appears
3. Check success toast notification
4. Confirm image appears in preview
5. Submit form with image URL
6. Verify image displays in item card

### Test Error Cases
1. Upload file > 5MB (should show error)
2. Upload non-image file (should show error)
3. Upload without internet (should handle gracefully)
4. Upload with invalid token (should redirect to login)

## Troubleshooting

### Common Issues

1. **Upload fails silently**
   - Check network connectivity
   - Verify API endpoint is running
   - Check authentication token

2. **Images not displaying**
   - Verify URL format in response
   - Check CORS settings on server
   - Ensure proper image permissions

3. **Progress bar stuck**
   - Check upload timeout settings
   - Verify file isn't too large
   - Check server processing time

### Debug Steps
1. Open browser developer tools
2. Check Network tab for API calls
3. Look for error messages in Console
4. Verify upload request format
5. Check server response structure
