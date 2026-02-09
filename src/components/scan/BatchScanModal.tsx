'use client';

import { useState, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface BatchScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BatchScanModal({ isOpen, onClose, onSuccess }: BatchScanModalProps) {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<{ count: number } | null>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 10);

        if (validFiles.length + images.length > 10) {
            setError('Maximum 10 images allowed');
            return;
        }

        const newImages = [...images, ...validFiles].slice(0, 10);
        setImages(newImages);

        // Generate previews
        const newPreviews = newImages.map(file => URL.createObjectURL(file));
        setPreviews(prev => {
            // Revoke old URLs to prevent memory leaks
            prev.forEach(url => URL.revokeObjectURL(url));
            return newPreviews;
        });

        setError(null);
    }, [images]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 10);

        if (validFiles.length + images.length > 10) {
            setError('Maximum 10 images allowed');
            return;
        }

        const newImages = [...images, ...validFiles].slice(0, 10);
        setImages(newImages);

        const newPreviews = newImages.map(file => URL.createObjectURL(file));
        setPreviews(prev => {
            prev.forEach(url => URL.revokeObjectURL(url));
            return newPreviews;
        });

        setError(null);
    }, [images]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);

        URL.revokeObjectURL(previews[index]);
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleScan = async () => {
        if (images.length === 0) {
            setError('Please add at least one image');
            return;
        }

        setIsScanning(true);
        setError(null);
        setProgress('Uploading images...');

        try {
            const formData = new FormData();
            images.forEach(img => formData.append('images', img));

            setProgress(`Analyzing ${images.length} item${images.length > 1 ? 's' : ''} with AI...`);

            const response = await fetch('/api/scan-batch', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to scan items');
            }

            setProgress('');
            setScanResult({ count: data.count });

            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setProgress('');
        } finally {
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        // Clean up previews
        previews.forEach(url => URL.revokeObjectURL(url));
        setImages([]);
        setPreviews([]);
        setError(null);
        setScanResult(null);
        setProgress('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Batch Upload" size="lg">
            <div className="p-6 space-y-6">
                {/* Success State */}
                {scanResult ? (
                    <div className="text-center py-8 animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            {scanResult.count} Item{scanResult.count > 1 ? 's' : ''} Added!
                        </h3>
                        <p className="text-muted mt-1">Your items have been scanned and added to your closet.</p>
                    </div>
                ) : (
                    <>
                        {/* Drop Zone */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${images.length > 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted'
                                }`}
                        >
                            <input
                                type="file"
                                id="batch-upload"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <label htmlFor="batch-upload" className="cursor-pointer">
                                <div className="w-16 h-16 mx-auto bg-border-light rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-foreground font-medium">
                                    Drop images here or click to select
                                </p>
                                <p className="text-muted text-sm mt-1">
                                    Up to 10 images • Each image = 1 item
                                </p>
                            </label>
                        </div>

                        {/* Image Previews Grid */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-5 gap-3">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Progress */}
                        {progress && (
                            <div className="flex items-center justify-center gap-3 py-4">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-muted">{progress}</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleScan}
                                isLoading={isScanning}
                                disabled={images.length === 0}
                            >
                                {isScanning ? 'Scanning...' : `Scan ${images.length} Item${images.length !== 1 ? 's' : ''}`}
                            </Button>
                        </div>

                        {/* Info */}
                        <p className="text-xs text-muted text-center">
                            All images are processed in a single AI call for efficiency.
                            Each image is analyzed as a separate clothing item.
                        </p>
                    </>
                )}
            </div>
        </Modal>
    );
}
