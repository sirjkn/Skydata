/**
 * Cloudinary Configuration
 * Handles image uploads with automatic WebP conversion and 50KB compression
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'dc5d5zfos',
  apiKey: '382325619466152',
  apiSecret: '-TZoR9QSDk1lMfEOdQc-Tv59f9A',
  uploadPreset: 'skyway_suites', // We'll create this in Cloudinary dashboard
};

/**
 * Generate Cloudinary upload URL
 */
export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
}

/**
 * Upload image to Cloudinary (frontend)
 * Automatically converts to WebP and compresses to ~50KB
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // Using default preset
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
  
  // Cloudinary transformations for WebP and compression
  formData.append('transformation', JSON.stringify({
    quality: 'auto:low',
    fetch_format: 'webp',
    flags: 'lossy',
  }));

  try {
    const response = await fetch(getCloudinaryUploadUrl(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url; // Return the HTTPS URL
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file));
  return Promise.all(uploadPromises);
}

/**
 * Get optimized image URL from Cloudinary
 * Applies WebP conversion and compression transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto:low' | 'auto:good' | 'auto:best';
  }
): string {
  const { width = 800, height, quality = 'auto:low' } = options || {};
  
  let transformations = `q_${quality},f_webp`;
  
  if (width) {
    transformations += `,w_${width}`;
  }
  
  if (height) {
    transformations += `,h_${height}`;
  }
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : null;
}

/**
 * Delete image from Cloudinary (requires backend API call)
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  // This should be called from the backend with API credentials
  console.warn('Image deletion should be done from backend');
  return false;
}
