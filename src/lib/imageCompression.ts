/**
 * Client-side image compression utility.
 * Mobile photos are often 5–15 MB each; Vercel limits request bodies to 4.5 MB.
 * This compresses images to a manageable size before upload.
 */

const MAX_DIMENSION = 1536; // max width or height in pixels
const QUALITY = 0.8;        // JPEG quality (0–1)
const MAX_FILE_SIZE = 800_000; // 800 KB target per image

/**
 * Compress a single image File, returning a new File with reduced size.
 * Falls back to the original file if compression isn't possible (e.g. WebP on old browsers).
 */
export async function compressImage(file: File): Promise<File> {
    // Skip non-image files
    if (!file.type.startsWith('image/')) return file;

    // Skip already-small files
    if (file.size <= MAX_FILE_SIZE) return file;

    return new Promise<File>((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate new dimensions keeping aspect ratio
            let { width, height } = img;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file); // fallback
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file); // fallback
                        return;
                    }

                    // Keep original extension info but output as JPEG
                    const baseName = file.name.replace(/\.[^.]+$/, '');
                    const compressed = new File([blob], `${baseName}.jpg`, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    console.log(
                        `[compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`
                    );
                    resolve(compressed);
                },
                'image/jpeg',
                QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file); // fallback to original
        };

        img.src = url;
    });
}

/**
 * Compress an array of image Files in parallel.
 */
export async function compressImages(files: File[]): Promise<File[]> {
    return Promise.all(files.map(compressImage));
}
