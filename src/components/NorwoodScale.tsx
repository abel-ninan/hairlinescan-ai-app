import { cn } from "@/lib/utils";

interface NorwoodScaleProps {
  level: number; // 1-7
  description: string;
}

const norwoodLabels: Record<number, string> = {
  1: "No recession",
  2: "Slight recession",
  3: "Deeper recession",
  4: "Further recession",
  5: "Significant loss",
  6: "Bridge thinning",
  7: "Advanced loss",
};

function getBarColor(n: number, active: boolean): string {
  if (!active) return "bg-white/[0.06]";
  if (n <= 2) return "bg-green-500";
  if (n <= 4) return "bg-amber-500";
  return "bg-red-500";
}

export const NorwoodScale = ({ level, description }: NorwoodScaleProps) => {
  const clampedLevel = Math.max(1, Math.min(7, Math.round(level)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          Norwood Scale
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md">
          Stage {clampedLevel} of 7
        </span>
      </div>

      {/* Scale bars */}
      <div className="flex items-end gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const isActive = n <= clampedLevel;
          const isCurrent = n === clampedLevel;
          const height = 8 + n * 3; // Progressively taller bars
          return (
            <div key={n} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-full rounded-sm transition-all duration-300",
                  getBarColor(n, isActive),
                  isCurrent && "ring-1 ring-white/20"
                )}
                style={{ height: `${height}px` }}
              />
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  isCurrent ? "text-foreground font-bold" : "text-muted-foreground/40"
                )}
              >
                {n}
              </span>
            </div>
          );
        })}
      </div>

      {/* Label + description */}
      <div className="text-center pt-1">
        <p className="text-sm font-semibold text-foreground">
          {norwoodLabels[clampedLevel]}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">Entertainment estimate only</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
