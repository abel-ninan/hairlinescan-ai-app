import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ScanLine,
  TrendingUp,
  Shield,
  Bell,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Camera,
  BarChart3,
  Lock
} from 'lucide-react';

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
    icon: <Sparkles className="w-16 h-16" />,
    title: 'Welcome to HairlineScan',
    description: 'Your AI-powered companion for tracking and understanding your hairline appearance over time.',
    gradient: 'from-primary to-blue-400'
  },
  {
    icon: <Camera className="w-16 h-16" />,
    title: 'Easy Photo Capture',
    description: 'Take photos from multiple angles for the most accurate analysis. Our AI analyzes your hairline in seconds.',
    gradient: 'from-green-500 to-emerald-400'
  },
  {
    icon: <BarChart3 className="w-16 h-16" />,
    title: 'Track Your Progress',
    description: 'Save your scans and watch your progress over time with detailed charts and insights.',
    gradient: 'from-purple-500 to-pink-400'
  },
  {
    icon: <Lock className="w-16 h-16" />,
    title: 'Private & Secure',
    description: 'Your photos are never stored on our servers. All analysis happens securely and privately.',
    gradient: 'from-orange-500 to-yellow-400'
  },
  {
    icon: <Bell className="w-16 h-16" />,
    title: 'Stay on Track',
    description: 'Get reminders to scan regularly and receive personalized tips for your hair care routine.',
    gradient: 'from-cyan-500 to-blue-400'
  }
];

export const OnboardingScreen = ({ onComplete, onSkip }: OnboardingScreenProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      {/* Skip button */}
      <div className="p-6 flex justify-end">
        <button
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Animated icon */}
        <div
          className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 text-white animate-fade-up`}
          key={currentSlide}
        >
          {slide.icon}
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-bold mb-4 animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          {slide.title}
        </h1>

        {/* Description */}
        <p
          className="text-muted-foreground text-lg max-w-sm animate-fade-up"
          style={{ animationDelay: '200ms' }}
        >
          {slide.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-8">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              onClick={prevSlide}
              className="flex-1"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          <Button
            onClick={nextSlide}
            className={`flex-1 ${currentSlide === 0 ? 'w-full' : ''}`}
          >
            {isLastSlide ? 'Get Started' : 'Next'}
            {!isLastSlide && <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
