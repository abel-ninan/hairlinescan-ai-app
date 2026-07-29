import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, hsl(217 91% 55%), hsl(217 91% 65%))',
          }}
        >
          {progress > 5 && (
            <div className="absolute inset-0 rounded-full opacity-60"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              }}
            />
          )}
        </div>
      </div>
      <div className="mt-2 text-right">
        <span className="font-mono text-[11px] text-muted-foreground/70 tabular-nums">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
