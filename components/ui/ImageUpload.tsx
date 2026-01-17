'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/formatters';

interface ImageUploadProps {
  bucket: string;
  folder: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  label?: string;
}

export function ImageUpload({
  bucket,
  folder,
  onUpload,
  currentUrl,
  className,
  aspectRatio = 'square',
  label,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();
      
      // Create unique filename
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setPreview(urlData.publicUrl);
      onUpload(urlData.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all overflow-hidden',
          aspectClasses[aspectRatio],
          preview ? 'border-transparent' : 'border-border hover:border-ets2/50',
          isUploading && 'opacity-50'
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full hover:bg-black transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-ets2 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-foreground-muted mb-2" />
                <span className="text-sm text-foreground-muted">
                  Click to upload
                </span>
                <span className="text-xs text-foreground-dim mt-1">
                  Max 5MB
                </span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
