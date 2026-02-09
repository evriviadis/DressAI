'use client';

import { useState, useRef, ChangeEvent } from 'react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface ImageUploaderProps {
    onImagesChange: (files: File[]) => void;
    maxImages?: number;
}

export default function ImageUploader({ onImagesChange, maxImages = 4 }: ImageUploaderProps) {
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsCompressing(true);

        const newImages: { file: File; preview: string }[] = [];

        for (const file of Array.from(files)) {
            if (images.length + newImages.length >= maxImages) break;

            if (!file.type.startsWith('image/')) continue;

            try {
                // Compress image to < 1MB
                const compressedFile = await imageCompression(file, {
                    maxSizeMB: 0.95,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });

                const preview = URL.createObjectURL(compressedFile);
                newImages.push({ file: compressedFile, preview });
            } catch (error) {
                console.error('Error compressing image:', error);
            }
        }

        const updatedImages = [...images, ...newImages].slice(0, maxImages);
        setImages(updatedImages);
        onImagesChange(updatedImages.map(img => img.file));
        setIsCompressing(false);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        URL.revokeObjectURL(images[index].preview);
        setImages(updatedImages);
        onImagesChange(updatedImages.map(img => img.file));
    };

    const imageLabels = ['Front', 'Back', 'Label', 'Detail'];

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-3">
                {Array(maxImages).fill(null).map((_, index) => {
                    const image = images[index];
                    return (
                        <div
                            key={index}
                            className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-border-light overflow-hidden group"
                        >
                            {image ? (
                                <>
                                    <Image
                                        src={image.preview}
                                        alt={`Upload ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <span className="text-white text-xs font-medium">{imageLabels[index]}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs">{imageLabels[index]}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Upload Button */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isCompressing}
                disabled={images.length >= maxImages}
            >
                {isCompressing ? 'Compressing...' : images.length >= maxImages ? 'Maximum images reached' : 'Add Photos'}
            </Button>

            <p className="text-xs text-muted text-center">
                Upload 1-4 photos of your item (front, back, label, detail). Images are automatically compressed.
            </p>
        </div>
    );
}
