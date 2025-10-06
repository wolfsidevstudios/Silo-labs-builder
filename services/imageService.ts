import { SavedImage } from '../types';

const IMAGES_STORAGE_KEY = 'ai_app_builder_images';

export function getImages(): SavedImage[] {
  try {
    const imagesJson = localStorage.getItem(IMAGES_STORAGE_KEY);
    if (!imagesJson) return [];
    
    const images = JSON.parse(imagesJson) as SavedImage[];
    return images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse images from localStorage", error);
    localStorage.removeItem(IMAGES_STORAGE_KEY);
    return [];
  }
}

export function saveImage(imageData: { data: string; mimeType: string }): SavedImage {
  const images = getImages();
  
  // Simple check to prevent duplicate saves if the same image is uploaded back-to-back
  const existingImage = images.find(img => img.data === imageData.data);
  if (existingImage) {
    return existingImage;
  }
  
  const newImage: SavedImage = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    ...imageData,
    createdAt: new Date().toISOString(),
  };

  const updatedImages = [newImage, ...images];
  localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(updatedImages));
  
  return newImage;
}

export function removeImage(id: string): void {
  const images = getImages();
  const updatedImages = images.filter(img => img.id !== id);
  localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(updatedImages));
}