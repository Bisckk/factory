'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const TOTAL_FRAMES = 361;

export function SpecialtiesSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const framesRef = useRef<HTMLImageElement[]>([]);

    const [loaded, setLoaded] = useState(0);
    const [totalToLoad, setTotalToLoad] = useState(TOTAL_FRAMES);
    const [isMobile, setIsMobile] = useState(false);
    const [imagesReady, setImagesReady] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 767px)');
        const setFromMedia = () => setIsMobile(media.matches);
        setFromMedia();
        media.addEventListener?.('change', setFromMedia);

        // Optimization: on mobile, load fewer frames if specified, e.g. every 2
        const step = media.matches ? 2 : 1;
        const framesToPreload: number[] = [];

        for (let i = 1; i <= TOTAL_FRAMES; i += step) {
            framesToPreload.push(i);
        }
        setTotalToLoad(framesToPreload.length);

        let currentLoaded = 0;
        const loadedFrames: HTMLImageElement[] = [];

        framesToPreload.forEach((index) => {
            const img = new Image();
            // Pads the string with zeros. E.g "1" -> "0001"
            const indexStr = index.toString().padStart(4, '0');
            img.src = `/frames/frame_${indexStr}.webp`;

            const handleLoadComplete = () => {
                currentLoaded++;
                setLoaded(currentLoaded);
                if (currentLoaded === framesToPreload.length) {
                    framesRef.current = loadedFrames;
                    setImagesReady(true);
                    // Trigger initial draw
                    setTimeout(() => drawFrame(1), 50);
                }
            };

            img.onload = () => {
                loadedFrames[index] = img;
                handleLoadComplete();
            };

            img.onerror = () => {
                handleLoadComplete();
            };
        });

        return () => {
            media.removeEventListener?.('change', setFromMedia);
        };
    }, []);

    // Draw helper
    const drawFrame = (frameIndex: number) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        // In mobile, we might skip frames, map to nearest valid
        if (!framesRef.current[frameIndex] && isMobile) {
            frameIndex = frameIndex - 1; // Try the previous frame
            if (!framesRef.current[frameIndex]) frameIndex = 1; // Fallback
        }

        const img = framesRef.current[frameIndex];

        if (img && img.complete && img.naturalHeight !== 0 && img.naturalWidth !== 0) {
            // clear rect
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Cover behavior
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.width / imgRatio;
            let drawX = 0;
            let drawY = (canvas.height - drawHeight) / 2;

            if (imgRatio < canvasRatio) {
                drawHeight = canvas.height;
                drawWidth = canvas.height * imgRatio;
                drawX = (canvas.width - drawWidth) / 2;
                drawY = 0;
            }

            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }
    };

    // Scroll listener and smooth animation logic
    useEffect(() => {
        if (!imagesReady) return;

        let targetProgress = 0;
        let currentProgress = 0;
        let animationFrameId: number;

        const updateScroll = () => {
            if (!containerRef.current) return;

            // Current scroll offset relative to the container element
            const rect = containerRef.current.getBoundingClientRect();
            const scrollDistance = -rect.top;

            // Total track available for scrolling
            const trackHeight = containerRef.current.scrollHeight - window.innerHeight;

            const progress = scrollDistance / trackHeight;
            targetProgress = Math.max(0, Math.min(progress, 1)); // clamp 0..1
        };

        const onScroll = () => {
            updateScroll();
        };

        const renderLoop = () => {
            // Lerp (Linear Interpolation) for smooth transition
            // Decreased to 0.04 to make the animation slower and smoother
            currentProgress += (targetProgress - currentProgress) * 0.04;

            // Only redraw if there's a meaningful change to avoid unnecessary renders
            if (Math.abs(targetProgress - currentProgress) > 0.0001) {
                const frameIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(currentProgress * TOTAL_FRAMES)));
                drawFrame(frameIndex);

                if (progressRef.current) {
                    progressRef.current.style.width = `${currentProgress * 100}%`;
                }
            }

            animationFrameId = window.requestAnimationFrame(renderLoop);
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        // Initial setup
        updateScroll();
        renderLoop();

        // Handle window resize for canvas matching with High-DPI support
        const resizeCanvas = () => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                // Get display density (e.g. 2 for Retina, 3 for modern phones)
                const dpr = window.devicePixelRatio || 1;

                const cssScale = isMobile ? 1 : 1.33;

                // Final supersampling factor
                const scaleFactor = dpr * cssScale;

                canvasRef.current.width = canvasRef.current.parentElement.clientWidth * scaleFactor;
                canvasRef.current.height = canvasRef.current.parentElement.clientHeight * scaleFactor;

                const frameIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(currentProgress * TOTAL_FRAMES)));
                drawFrame(frameIndex); // Force redraw after scaling
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [imagesReady, isMobile]);

    const loadingProgress = totalToLoad ? Math.floor((loaded / totalToLoad) * 100) : 0;
    const containerHeight = `calc(100svh + ${TOTAL_FRAMES * (isMobile ? 6 : 9)}px)`;

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{ height: containerHeight }}
        >
            <section id="especialidades" className="sticky top-0 h-[100svh] md:h-screen w-full flex items-center bg-white text-black py-12 md:py-24 overflow-hidden">
                <div className="w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
                        {/* Text Content */}
                        <div className="space-y-6 z-20 flex flex-col justify-center">
                            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
                                Nuestra Sangre <br /> es la Mezcla.
                            </h2>
                            <p className="text-gray-500 max-w-lg leading-relaxed text-base sm:text-lg">
                                Mientras el mundo avanza hacia lo genérico, nosotros perfeccionamos lo clásico. Somos los cirujanos del motor 2 tiempos.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {[
                                    "Afinación milimétrica de carburadores",
                                    "Rectificado de cilindros de alta precisión",
                                    "Sistemas eléctricos y mejoras de encendido"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-xs sm:text-sm font-bold uppercase tracking-wide border-b border-gray-100 pb-4">
                                        <span className="text-red-500 font-mono">0{i + 1}</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            {!imagesReady && (
                                <div className="mt-8 flex items-center gap-4 opacity-50">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                    <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-600 transition-all duration-300"
                                            style={{ width: `${loadingProgress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                                        Cargando frames {loadingProgress}%
                                    </span>
                                </div>
                            )}

                            {imagesReady && (
                                <div className="mt-8 pt-4">
                                    <div className="h-1 w-32 bg-gray-100 rounded-full relative overflow-hidden">
                                        <div
                                            className="h-full bg-red-600/30 w-full animate-pulse blur-[2px]"
                                        />
                                        <div
                                            ref={progressRef}
                                            className="absolute top-0 left-0 h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                                            style={{ width: '0%' }}
                                        />
                                    </div>
                                    <span className="block mt-2 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                                        Desplázate para revelar
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Image/Canvas Container */}
                        <div className="relative w-full h-[340px] sm:h-[520px] md:h-[900px] lg:h-[1300px] md:scale-[1.33] md:translate-x-[10px] mix-blend-multiply pointer-events-none flex items-center justify-center z-10">
                            <>
                                {/* Fallback/Shimmer state without gray background */}
                                <div
                                    className={`absolute inset-0 bg-transparent transition-opacity duration-1000 z-0
                                        ${imagesReady ? 'opacity-0' : 'opacity-100'}
                                    `}
                                />
                                <canvas
                                    ref={canvasRef}
                                    className={`absolute inset-0 w-full h-full object-contain md:object-right z-10 transition-opacity duration-1000 ${imagesReady ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
