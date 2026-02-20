import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { LiquidButton } from '../components/ui/LiquidGlassButton';

const extractQrHash = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return null;

    const fromPath = (pathLike = '') => {
        const normalized = decodeURIComponent(String(pathLike || '').trim())
            .replace(/\/+$/, '');
        if (!normalized) return null;

        // Supports both /scan/:hash and /redeem/:hash URLs
        const match = normalized.match(/\/(?:scan|redeem)\/([^/?#]+)/i);
        if (match?.[1]) return match[1].trim();
        return null;
    };

    try {
        const url = new URL(raw);
        const pathHash = fromPath(url.pathname);
        if (pathHash) return pathHash;

        const queryHash =
            url.searchParams.get('hash') ||
            url.searchParams.get('qr') ||
            url.searchParams.get('code');
        if (queryHash) return String(queryHash).trim();
    } catch (_) {
        // Not a URL, try path-like or raw hash forms below.
    }

    const pathLikeHash = fromPath(raw);
    if (pathLikeHash) return pathLikeHash;

    // Raw hash directly inside the QR
    return raw.replace(/^#/, '').trim() || null;
};

const CameraScan = () => {
    const navigate = useNavigate();
    const [scanError, setScanError] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const scannerRef = useRef(null);
    const readerRef = useRef(null);

    useEffect(() => {
        // Initialize scanner
        const startScanner = async () => {
            try {
                // Check if element exists
                if (!scannerRef.current) return;

                // Create instance
                const html5QrCode = new Html5Qrcode("reader");
                readerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                const onDecode = (decodedText) => {
                    const hash = extractQrHash(decodedText);
                    if (!hash) return;
                    handleScan(hash);
                };

                const onDecodeError = () => {
                    // Ignore frame-level decode misses while scanning.
                };

                try {
                    await html5QrCode.start(
                        { facingMode: { exact: "environment" } },
                        config,
                        onDecode,
                        onDecodeError
                    );
                } catch (cameraModeError) {
                    // Fallback for browsers/devices that reject facingMode constraints.
                    const cameras = await Html5Qrcode.getCameras();
                    const preferredCamera =
                        cameras.find((camera) =>
                            /(back|rear|environment)/i.test(camera.label || "")
                        ) || cameras[0];

                    if (!preferredCamera?.id) {
                        throw cameraModeError;
                    }

                    await html5QrCode.start(
                        preferredCamera.id,
                        config,
                        onDecode,
                        onDecodeError
                    );
                }
            } catch (err) {
                console.error("Scanner error:", err);
                setScanError("Could not access camera. Please ensure you have granted camera permissions.");
                setIsScanning(false);
            }
        };

        if (isScanning && !readerRef.current) {
            startScanner();
        }

        // Cleanup
        return () => {
            if (readerRef.current) {
                readerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
                readerRef.current = null;
            }
        };
    }, [isScanning]);

    const handleScan = (hash) => {
        if (!readerRef.current) return;

        // Stop scanning
        readerRef.current.stop().then(() => {
            readerRef.current = null;
            setIsScanning(false);

            // Navigate to the scan processing page
            navigate(`/scan/${encodeURIComponent(hash)}`);
        }).catch(err => {
            console.error("Failed to stop scanner after success", err);
        });
    };

    const handleClose = () => {
        if (readerRef.current) {
            readerRef.current.stop().catch(err => console.error("Stop failed", err));
        }
        navigate('/');
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
                <button
                    onClick={handleClose}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-white font-medium text-lg">Scan QR Code</div>
                <div className="w-10"></div> {/* Spacer for center alignment */}
            </div>

            {/* Scanner Container */}
            <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden bg-black">
                {scanError ? (
                    <div className="p-6 text-center max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-white text-lg font-bold mb-2">Camera Error</h3>
                        <p className="text-gray-400 text-sm mb-6">{scanError}</p>
                        <LiquidButton onClick={() => window.location.reload()} className="w-full">
                            Retry Camera
                        </LiquidButton>
                    </div>
                ) : (
                    <>
                        {/* The ID 'reader' is required by html5-qrcode */}
                        <div id="reader" className="w-full h-full object-cover"></div>

                        {/* Overlay guide (visual only, library handles the actual scanning box) */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[250px] h-[250px] border-2 border-white/50 rounded-lg relative">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-lg"></div>

                                {/* Scanning bar animation */}
                                <div className="absolute bg-primary/50 h-0.5 w-full top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                            </div>
                        </div>

                        <div className="absolute bottom-20 text-white/80 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                            Align QR code within the frame
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                #reader video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default CameraScan;
