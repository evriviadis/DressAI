'use client';

import { useState } from 'react';

interface StarRatingProps {
    onRate: (rating: number) => void;
}

export default function StarRating({ onRate }: StarRatingProps) {
    const [hoveredStar, setHoveredStar] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleClick = (star: number) => {
        if (isLocked) return;
        setSelectedRating(star);
        setIsLocked(true);
        onRate(star);

        // Show toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    return (
        <div className="relative">
            <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm text-muted">
                    {isLocked ? 'Thanks for your feedback!' : 'Rate this outfit'}
                </p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (isLocked ? selectedRating : (hoveredStar || selectedRating));
                        return (
                            <button
                                key={star}
                                onClick={() => handleClick(star)}
                                onMouseEnter={() => !isLocked && setHoveredStar(star)}
                                onMouseLeave={() => !isLocked && setHoveredStar(0)}
                                disabled={isLocked}
                                className={`star-rating-btn p-1 transition-all duration-200 ${isLocked ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                                    } ${isFilled ? 'star-active' : ''}`}
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                                <svg
                                    className={`w-8 h-8 transition-all duration-200 ${isFilled
                                            ? 'text-accent drop-shadow-[0_0_8px_rgba(255,215,64,0.6)]'
                                            : 'text-muted-light'
                                        }`}
                                    fill={isFilled ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                </svg>
                            </button>
                        );
                    })}
                </div>
                {isLocked && (
                    <div className="flex items-center gap-1.5 text-xs text-success animate-fade-in">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Preference saved
                    </div>
                )}
            </div>

            {/* Toast notification */}
            {showToast && (
                <div className="toast-notification animate-toast-enter">
                    <div className="flex items-center gap-2">
                        <span>✨</span>
                        <span>Preference saved!</span>
                    </div>
                </div>
            )}
        </div>
    );
}
