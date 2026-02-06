import { isConfigured, supabase } from './supabase';

export const storageService = {
  /**
   * Uploads a file to storage.
   * In Mock Mode: Creates a blob URL (session only).
   * In Prod Mode: Uploads to Supabase Storage.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!isConfigured) {
      // Mock Mode: Convert to Base64 for persistence
      console.log(`[MockStorage] Uploading ${file.name} to ${path}`);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Store in localStorage for persistence
          try {
             // Use a prefix to avoid collisions
             const key = `provider-image-${path}`;
             localStorage.setItem(key, base64);
          } catch (e) {
             console.warn('Failed to save mock image to localStorage (quota exceeded?)', e);
          }
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Prod Mode
    const { data, error } = await supabase.storage
      .from('provider-assets')
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Upload failed:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('provider-assets')
      .getPublicUrl(data?.path || path);
      
    return publicUrl;
  }
};
