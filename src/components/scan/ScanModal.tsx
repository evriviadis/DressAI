'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ImageUploader from './ImageUploader';
import { compressImages } from '@/lib/imageCompression';

interface ScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = [
    { value: 'top', label: 'Top', icon: '👕' },
    { value: 'bottom', label: 'Bottom', icon: '👖' },
    { value: 'dress', label: 'Dress', icon: '👗' },
    { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { value: 'shoes', label: 'Shoes', icon: '👟' },
    { value: 'accessory', label: 'Accessory', icon: '👜' },
];

export default function ScanModal({ isOpen, onClose, onSuccess }: ScanModalProps) {
    const [images, setImages] = useState<File[]>([]);
    const [category, setCategory] = useState('top');
    const [customName, setCustomName] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<unknown>(null);

    const handleScan = async () => {
        if (images.length === 0) {
            setError('Please upload at least one image');
            return;
        }

        setIsScanning(true);
        setError(null);

        try {
            // Compress images client-side before upload
            const compressed = await compressImages(images);

            const formData = new FormData();
            compressed.forEach(img => formData.append('images', img));
            formData.append('category', category);
            if (customName.trim()) {
                formData.append('customName', customName.trim());
            }

            const response = await fetch('/api/scan', {
                method: 'POST',
                body: formData,
            });

            // Handle non-JSON error responses (e.g. Vercel's plain-text 413)
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(text || `Server error (${response.status})`);
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to scan item');
            }

            setScanResult(data.item);
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        setImages([]);
        setCategory('top');
        setCustomName('');
        setError(null);
        setScanResult(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Item" size="lg">
            <div className="p-6 space-y-6">
                {/* Success State */}
                {scanResult ? (
                    <div className="text-center py-8 animate-fade-in">
                        <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Item Added!</h3>
                        <p className="text-muted mt-1">Your item has been scanned and added to your closet.</p>
                    </div>
                ) : (
                    <>
                        {/* Item Name (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Item Name <span className="text-muted font-normal">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="e.g., My Favorite Blue Jacket"
                                maxLength={50}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted"
                            />
                            <p className="text-xs text-muted mt-1">
                                Leave empty and AI will suggest a name for you
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                Photos
                            </label>
                            <ImageUploader onImagesChange={setImages} />
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                Category
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setCategory(cat.value)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${category === cat.value
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border text-muted hover:border-muted'
                                            }`}
                                    >
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="text-sm font-medium">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

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
                                {isScanning ? 'Scanning with AI...' : 'Scan Item'}
                            </Button>
                        </div>

                        {/* AI Info */}
                        <p className="text-xs text-muted text-center">
                            Our AI will analyze your item and create a detailed digital description including colors, materials, and style recommendations.
                        </p>
                    </>
                )}
            </div>
        </Modal>
    );
}
