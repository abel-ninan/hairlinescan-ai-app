import {
  Sparkles,
  Brain,
  Shield,
  Camera,
  BarChart3,
  Heart,
  AlertTriangle,
  ExternalLink,
  Mail,
  ChevronRight,
  Info,
  Zap,
  Lock
} from 'lucide-react';

interface AboutScreenProps {
  onBack?: () => void;
}

export const AboutScreen = ({ onBack }: AboutScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">HairlineScan</h1>
            <p className="text-sm text-muted-foreground">Version 1.2.0</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* App Description */}
        <div className="glass-panel p-5">
          <p className="text-muted-foreground leading-relaxed">
            HairlineScan uses advanced AI technology to analyze your hairline appearance
            for entertainment and informational purposes. Take a photo and get instant
            insights about your hairline characteristics.
          </p>
        </div>

        {/* How It Works */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            How It Works
          </h3>
          <div className="space-y-3">
            <div className="glass-panel p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">1. Take a Photo</h4>
                <p className="text-sm text-muted-foreground">
                  Use your camera to capture a clear photo of your hairline from the front,
                  or multiple angles for more comprehensive analysis.
                </p>
              </div>
            </div>

            <div className="glass-panel p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">2. AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI examines the photo to identify hairline characteristics, patterns,
                  and features using advanced image recognition technology.
                </p>
              </div>
            </div>

            <div className="glass-panel p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">3. Get Results</h4>
                <p className="text-sm text-muted-foreground">
                  View your cosmetic appearance scores, hairline type classification,
                  and personalized styling tips based on the analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-500" />
            Privacy & Security
          </h3>
          <div className="glass-panel p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Photos Not Stored</h4>
                <p className="text-sm text-muted-foreground">
                  Your photos are analyzed in real-time and are never stored on our servers.
                  They remain private on your device.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Secure Processing</h4>
                <p className="text-sm text-muted-foreground">
                  All data transmission is encrypted. Analysis happens through secure
                  cloud processing with industry-standard protection.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Your Data, Your Control</h4>
                <p className="text-sm text-muted-foreground">
                  We respect your privacy. You can use the app without creating an account,
                  and can delete your data at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="glass-panel p-5 bg-amber-500/10 border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">
                Important Medical Disclaimer
              </h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>This app is for entertainment purposes only.</strong>
                </p>
                <p>
                  HairlineScan does NOT provide medical advice, diagnosis, or treatment.
                  The analysis is generated by AI and is not scientifically validated
                  for medical use.
                </p>
                <p>
                  Results are cosmetic appearance assessments and should not be used to
                  make health decisions. The scores and classifications are entertainment
                  features and do not represent medical evaluations.
                </p>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  If you have concerns about hair loss or scalp health, please consult
                  a qualified dermatologist or trichologist.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Technology */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Technology
          </h3>
          <div className="glass-panel p-4">
            <p className="text-sm text-muted-foreground mb-3">
              HairlineScan is powered by Google's Gemini AI, a state-of-the-art
              multimodal AI model capable of understanding and analyzing images.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                Advanced image recognition technology
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                Natural language processing for detailed descriptions
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                Personalized recommendations based on analysis
              </li>
            </ul>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Legal & Support
          </h3>
          <div className="space-y-2">
            <a
              href="/privacy-policy.html"
              target="_blank"
              className="glass-panel p-4 flex items-center justify-between"
            >
              <span className="font-medium">Privacy Policy</span>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>
            <a
              href="/terms.html"
              target="_blank"
              className="glass-panel p-4 flex items-center justify-between"
            >
              <span className="font-medium">Terms of Service</span>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>
            <a
              href="/support.html"
              target="_blank"
              className="glass-panel p-4 flex items-center justify-between"
            >
              <span className="font-medium">Help & Support</span>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>
            <a
              href="mailto:support@hairlinescan.app"
              className="glass-panel p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Contact Us</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Made with care for your hair
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2024 HairlineScan. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
