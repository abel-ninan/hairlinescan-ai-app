import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Sun,
  Lightbulb,
  Eye,
  X,
  Check,
  AlertTriangle,
  ChevronRight,
  Smartphone,
  User,
  CircleDot
} from 'lucide-react';

interface PhotoTip {
  title: string;
  description: string;
  doText: string;
  dontText: string;
  icon: React.ReactNode;
}

const photoTips: PhotoTip[] = [
  {
    title: "Lighting",
    description: "Good lighting is crucial for accurate analysis",
    doText: "Use natural daylight or bright, even indoor lighting. Face a window or light source.",
    dontText: "Avoid harsh shadows, backlighting, or very dim conditions.",
    icon: <Sun className="w-5 h-5" />
  },
  {
    title: "Camera Position",
    description: "Position affects how your hairline appears",
    doText: "Hold camera at eye level, about arm's length away. Keep it straight, not angled.",
    dontText: "Avoid tilting the camera up or down, or holding it too close.",
    icon: <Smartphone className="w-5 h-5" />
  },
  {
    title: "Hairline Visibility",
    description: "Your hairline must be clearly visible",
    doText: "Pull hair back from forehead or style so hairline edge is clearly visible.",
    dontText: "Don't cover hairline with bangs, hats, or hands during the photo.",
    icon: <Eye className="w-5 h-5" />
  },
  {
    title: "Face Position",
    description: "Face the camera directly for best results",
    doText: "Look straight at the camera with a neutral expression. Keep face relaxed.",
    dontText: "Avoid looking away, raising eyebrows, or having hair fall over your face.",
    icon: <User className="w-5 h-5" />
  },
  {
    title: "Focus",
    description: "A clear, focused photo gives better analysis",
    doText: "Tap to focus on your hairline. Keep phone steady. Use rear camera for better quality.",
    dontText: "Avoid blurry, out-of-focus, or pixelated images.",
    icon: <CircleDot className="w-5 h-5" />
  }
];

interface PhotoGuideProps {
  variant?: 'full' | 'compact' | 'modal';
  onClose?: () => void;
}

export const PhotoGuide = ({ variant = 'full', onClose }: PhotoGuideProps) => {
  const [currentTip, setCurrentTip] = useState(0);

  if (variant === 'compact') {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-5 h-5 text-primary" />
          <h4 className="font-medium">Quick Photo Tips</h4>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Use good, even lighting</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Show hairline clearly</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Face camera directly</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Keep photo in focus</span>
          </li>
        </ul>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="glass-panel w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Photo Guide</h3>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Carousel */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                {photoTips[currentTip].icon}
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {photoTips[currentTip].title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {photoTips[currentTip].description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{photoTips[currentTip].doText}</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{photoTips[currentTip].dontText}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-border">
            <div className="flex justify-center gap-2 mb-4">
              {photoTips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTip(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTip
                      ? 'w-6 bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {currentTip > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentTip(currentTip - 1)}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              {currentTip < photoTips.length - 1 ? (
                <Button
                  onClick={() => setCurrentTip(currentTip + 1)}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : onClose ? (
                <Button onClick={onClose} className="flex-1">
                  Got it!
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Camera className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold">Photo Guide</h3>
          <p className="text-sm text-muted-foreground">
            Get the best results with these tips
          </p>
        </div>
      </div>

      {photoTips.map((tip, index) => (
        <div key={index} className="glass-panel p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {tip.icon}
            </div>
            <div>
              <h4 className="font-medium">{tip.title}</h4>
              <p className="text-xs text-muted-foreground">{tip.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{tip.doText}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
              <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{tip.dontText}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="glass-panel p-4 bg-amber-500/10 border-amber-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              Important Note
            </h4>
            <p className="text-sm text-muted-foreground">
              Photo quality significantly affects analysis accuracy. If you get
              unexpected results, try taking a new photo following these guidelines.
              Multiple angles (front, left, right) provide the most complete picture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
