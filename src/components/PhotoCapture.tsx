import { useRef, useCallback, useState } from "react";

interface PhotoCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  facingMode: "user" | "environment";
  onCapture: (dataUrl: string) => void;
  hasCamera: boolean;
}

export const PhotoCapture = ({
  videoRef,
  facingMode,
  onCapture,
  hasCamera,
}: PhotoCaptureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const performCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxWidth = 1024;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const width = video.videoWidth * scale;
    const height = video.videoHeight * scale;

    canvas.width = width;
    canvas.height = height;

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);
  }, [videoRef, facingMode, onCapture]);

  const capturePhoto = useCallback(() => {
    setIsScanning(true);

    setTimeout(() => {
      performCapture();
      setIsScanning(false);
    }, 800);
  }, [performCapture]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      {/* Large round capture button - iOS camera style */}
      <button
        onClick={capturePhoto}
        disabled={!hasCamera || isScanning}
        className="w-[72px] h-[72px] rounded-full border-[3px] border-white/90 flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 animate-capture-pulse"
        aria-label="Capture photo"
      >
        <div className={`w-[58px] h-[58px] rounded-full transition-all ${isScanning ? 'bg-red-500 scale-75 rounded-xl' : 'bg-white'}`} />
      </button>
    </>
  );
};
