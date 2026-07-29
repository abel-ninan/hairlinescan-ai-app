import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Shield,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Camera,
  BarChart3,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <Sparkles className="w-14 h-14" />,
    title: 'Welcome to HairMaxx',
    description: 'Your AI-powered companion for tracking and understanding your hairline appearance over time.',
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    icon: <Camera className="w-14 h-14" />,
    title: 'Easy Photo Capture',
    description: 'Take photos from multiple angles for the most accurate analysis. Our AI analyzes your hairline in seconds.',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    icon: <BarChart3 className="w-14 h-14" />,
    title: 'Track Your Progress',
    description: 'Save your scans and watch your progress over time with detailed charts and insights.',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: <Lock className="w-14 h-14" />,
    title: 'Private & Secure',
    description: 'Your photos are sent securely for AI analysis but are never permanently stored on servers. Results are saved locally on your device only.',
    gradient: 'from-violet-500/20 to-indigo-500/20',
  },
  {
    icon: <TrendingUp className="w-14 h-14" />,
    title: 'Expert Coaching',
    description: 'Access in-depth guides on hair care, grooming, nutrition, and lifestyle tips to look your best.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: <Shield className="w-14 h-14" />,
    title: 'Entertainment Only',
    description: 'HairMaxx is for entertainment purposes only and does not provide medical advice, diagnosis, or treatment. Always consult a qualified doctor for health concerns.',
    gradient: 'from-red-500/20 to-pink-500/20',
  }
];

export const OnboardingScreen = ({ onComplete, onSkip }: OnboardingScreenProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwipeRef = useRef<boolean | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(slides.length - 1, index)));
    setDragOffset(0);
    setIsDragging(false);
  }, []);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goTo(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      goTo(currentSlide - 1);
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipeRef.current = null;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (isSwipeRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isSwipeRef.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isSwipeRef.current) return;

    // Prevent vertical scroll while swiping horizontally
    e.preventDefault();

    // Apply resistance at edges
    let offset = dx;
    if ((currentSlide === 0 && dx > 0) || (currentSlide === slides.length - 1 && dx < 0)) {
      offset = dx * 0.2;
    }

    setDragOffset(offset);
  }, [currentSlide]);

  const handleTouchEnd = useCallback(() => {
    const dx = dragOffset;
    touchStartX.current = null;
    touchStartY.current = null;
    isSwipeRef.current = null;
    setDragOffset(0);
    setIsDragging(false);

    // Threshold: 25% of screen width or 80px, whichever is smaller
    const threshold = Math.min(window.innerWidth * 0.25, 80);

    if (dx < -threshold && currentSlide < slides.length - 1) {
      goTo(currentSlide + 1);
    } else if (dx > threshold && currentSlide > 0) {
      goTo(currentSlide - 1);
    }
  }, [dragOffset, currentSlide, goTo]);

  const isLastSlide = currentSlide === slides.length - 1;

  // Calculate the transform for the slide track
  const trackTransform = `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`;

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="safe-area-top flex-shrink-0" />

      {/* Skip button */}
      <div className="px-5 pt-4 flex justify-end flex-shrink-0">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground/60 active:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          Skip
        </button>
      </div>

      {/* Slide carousel */}
      <div
        className="flex-1 overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full"
          style={{
            transform: trackTransform,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            willChange: 'transform',
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 flex flex-col items-center justify-center px-8 text-center"
            >
              {/* Icon with gradient background */}
              <div
                className={cn(
                  "w-28 h-28 rounded-3xl flex items-center justify-center mb-8 text-primary bg-gradient-to-br",
                  slide.gradient
                )}
              >
                {slide.icon}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-3">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-[15px] leading-relaxed max-w-xs">
                {slide.description}
              </p>

            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-8 pt-6 pb-4 flex-shrink-0">
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-8" role="tablist" aria-label="Onboarding slides">
          {slides.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              onClick={() => goTo(index)}
              className="min-h-[44px] min-w-[24px] flex items-center justify-center"
            >
              <span className={cn(
                "block h-1.5 rounded-full transition-all duration-300",
                index === currentSlide
                  ? 'w-7 bg-primary'
                  : index < currentSlide
                  ? 'w-1.5 bg-primary/40'
                  : 'w-1.5 bg-white/10'
              )} />
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              onClick={prevSlide}
              className="flex-1 h-12 rounded-xl border-border/50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            onClick={nextSlide}
            size="lg"
            className={cn(
              "flex-1 rounded-xl h-12 text-base font-semibold",
              currentSlide === 0 && "w-full"
            )}
          >
            {isLastSlide ? 'Get Started' : 'Continue'}
            {!isLastSlide && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
      <div className="safe-area-bottom flex-shrink-0" />
    </div>
  );
};
