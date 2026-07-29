import { cn } from "@/lib/utils";

interface ScannerOverlayProps {
  className?: string;
  angleGuide?: "front" | "left" | "right";
}

const LABEL_MAP: Record<string, string> = {
  front: "FRONT",
  left: "LEFT",
  right: "RIGHT",
};

export const ScannerOverlay = ({ className, angleGuide }: ScannerOverlayProps) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '22px 22px',
        }}
      />

      {/* Animated scanning line */}
      <div
        className="absolute left-0 right-0 h-px animate-scan-sweep"
        style={{
          background: `linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.5) 20%, hsl(var(--primary) / 0.8) 50%, hsl(var(--primary) / 0.5) 80%, transparent 100%)`,
          boxShadow: `0 0 12px hsl(var(--primary) / 0.3), 0 0 24px hsl(var(--primary) / 0.12)`,
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-3 left-3 w-10 h-10 border-l-2 border-t-2 border-primary/40 rounded-tl" />
      <div className="absolute top-3 right-3 w-10 h-10 border-r-2 border-t-2 border-primary/40 rounded-tr" />
      <div className="absolute bottom-3 left-3 w-10 h-10 border-l-2 border-b-2 border-primary/40 rounded-bl" />
      <div className="absolute bottom-3 right-3 w-10 h-10 border-r-2 border-b-2 border-primary/40 rounded-br" />

      {/* Data readout — top right */}
      <div className="absolute top-4 right-4">
        <div className="text-[11px] font-mono text-primary/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
          {angleGuide ? LABEL_MAP[angleGuide] : "READY"}
        </div>
      </div>

      {/* Scanning indicator — top left */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 55%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
};
