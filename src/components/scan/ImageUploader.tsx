'use client';

import { useState, useRef, ChangeEvent } from 'react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';

interface ImageUploaderProps {
    onImagesChange: (files: File[]) => void;
    maxImages?: number;
}

export default function ImageUploader({ onImagesChange, maxImages = 4 }: ImageUploaderProps) {
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const processFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsCompressing(true);
        setUploadError(null);

        const newImages: { file: File; preview: string }[] = [];

        for (const file of Array.from(files)) {
            if (images.length + newImages.length >= maxImages) break;

            // iOS camera can return HEIC with empty type string — accept any non-empty file
            // that either has an image/* type OR came with no type (camera file)
            const isImage = file.type.startsWith('image/') || file.type === '';
            if (!isImage || file.size === 0) continue;

            let fileToUse = file;
            try {
                // Try to compress — if compression fails (e.g. HEIC unsupported), use original
                fileToUse = await imageCompression(file, {
                    maxSizeMB: 0.95,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });
            } catch {
                // Compression failed (common with HEIC on some browsers) — use original file
                fileToUse = file;
            }

            try {
                const preview = URL.createObjectURL(fileToUse);
                newImages.push({ file: fileToUse, preview });
            } catch (previewErr) {
                console.error('Preview failed:', previewErr);
                setUploadError('Could not load image preview. Please try a different photo.');
            }
        }

        if (newImages.length === 0 && !uploadError) {
            setUploadError('Could not process the photo. Please try again or choose from gallery.');
        }

        const updatedImages = [...images, ...newImages].slice(0, maxImages);
        setImages(updatedImages);
        onImagesChange(updatedImages.map(img => img.file));
        setIsCompressing(false);

        // Reset inputs
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => processFiles(e.target.files);

    const removeImage = (index: number) => {
        URL.revokeObjectURL(images[index].preview);
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onImagesChange(updatedImages.map(img => img.file));
    };

    const imageLabels = ['Front', 'Back', 'Label', 'Detail'];
    const canAddMore = images.length < maxImages;

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-2">
                {Array(maxImages).fill(null).map((_, index) => {
                    const image = images[index];
                    return (
                        <div
                            key={index}
                            className="relative aspect-square border border-dashed border-white/10 bg-neutral-950 overflow-hidden group"
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
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                                        <span className="text-white text-[10px] uppercase tracking-[0.06em]">{imageLabels[index]}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-800">
                                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="text-[10px] uppercase tracking-wide">{imageLabels[index]}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Hidden inputs */}
            {/* Gallery picker */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />
            {/* Camera capture — mobile only */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Action buttons */}
            {isCompressing ? (
                <div className="flex items-center justify-center gap-2 py-3 text-neutral-500 text-sm">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Compressing…
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {/* Camera — primary action on mobile */}
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={!canAddMore}
                        className="flex items-center justify-center gap-2 py-3 border border-white/15 text-white text-sm hover:border-white/40 hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Camera
                    </button>

                    {/* Gallery picker */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!canAddMore}
                        className="flex items-center justify-center gap-2 py-3 border border-white/8 text-neutral-500 text-sm hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Gallery
                    </button>
                </div>
            )}

            {/* Error feedback */}
            {uploadError && (
                <p className="text-xs text-red-400 text-center">{uploadError}</p>
            )}

            <p className="text-[10px] text-neutral-800 text-center tracking-wide uppercase">
                {images.length} / {maxImages} photos · tap camera to shoot or gallery to pick
            </p>
        </div>
    );
}
