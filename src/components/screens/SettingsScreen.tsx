import { useState, useCallback } from 'react';
import { Scan } from '@/types/database';
import { useEdgeSwipeBack } from '@/hooks/useEdgeSwipeBack';
import {
  Shield,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  FileText,
  Sparkles,
  ArrowLeft,
  Mail,
  MessageCircle,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SettingsScreenProps {
  scans: Scan[];
  onClearData: () => Promise<void>;
}

type SettingsView = 'main' | 'privacy' | 'terms' | 'help';

export const SettingsScreen = ({ scans, onClearData }: SettingsScreenProps) => {
  const [view, setView] = useState<SettingsView>('main');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const goBackToMain = useCallback(() => setView('main'), []);
  useEdgeSwipeBack(goBackToMain, view !== 'main');

  const faqItems = [
    {
      q: 'How does HairMaxx work?',
      a: 'HairMaxx uses AI to analyze photos of your hairline and provide fun, entertaining style insights. Simply take photos and receive instant results.',
    },
    {
      q: 'Is this medical advice?',
      a: 'No. HairMaxx is for entertainment purposes only and does NOT provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for health concerns.',
    },
    {
      q: 'Are my photos stored?',
      a: 'Photos are processed temporarily for analysis and are not permanently stored on our servers. Scan results are saved locally on your device only.',
    },
    {
      q: 'Why did my analysis fail?',
      a: 'This can happen due to poor lighting, blurry photos, or temporary server issues. Try retaking photos in good lighting and ensure your hairline is clearly visible.',
    },
    {
      q: 'How do I get the best results?',
      a: 'Use good lighting (natural light works best), hold the camera steady, and make sure your hairline is clearly visible in the photo.',
    },
    {
      q: 'How much does a scan cost?',
      a: 'Each scan is a one-time $4.99 purchase. There is no subscription and nothing auto-renews. You only pay when you choose to scan.',
    },
    {
      q: 'Are scans refundable?',
      a: 'A scan credit is granted at purchase and consumed only when an analysis completes successfully. If a scan fails, the credit is kept and you can retry. For refund requests, contact Apple via Settings > Apple ID > Subscriptions > Purchase History.',
    },
    {
      q: 'I subscribed before — what happens?',
      a: 'If you previously subscribed to HairMaxx Pro, tap "Restore Purchases" on the scan screen and you will be granted a generous credit pool. Your existing subscription can be cancelled anytime in Settings > Apple ID > Subscriptions.',
    },
  ];

  // Sub-page: Privacy Policy
  if (view === 'privacy') {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="safe-area-top flex-shrink-0" />
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-primary active:opacity-60 transition-opacity min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[15px] font-medium">Settings</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: January 28, 2026</p>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <p className="text-sm font-semibold text-amber-400 mb-1">Medical Disclaimer</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              HairMaxx is for entertainment purposes only. This app does NOT provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
            </p>
          </div>

          <Section title="Introduction">
            HairMaxx is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information. HairMaxx is an entertainment app only and does not provide medical advice.
          </Section>

          <Section title="Information We Collect">
            <b>Photos:</b> We request camera access to capture photos for AI analysis. Photos are processed temporarily and not stored permanently on our servers.{'\n\n'}
            <b>Questionnaire Responses:</b> Optional responses are processed with your photos and not stored permanently.{'\n\n'}
            <b>Device Information:</b> We may collect anonymous usage analytics. We do not collect personally identifiable information.
          </Section>

          <Section title="How We Use Your Information">
            We use your information to provide AI-powered entertainment analysis, generate personalized tips, and improve our services. We do not use your information for advertising or sell your data to third parties.
          </Section>

          <Section title="Data Storage & Security">
            Photos and questionnaire data are processed in real-time and not permanently stored. All data transmission uses HTTPS encryption. Scan results are stored locally on your device only.
          </Section>

          <Section title="Third-Party Services">
            <b>Google Gemini AI:</b> Photos are transmitted securely for analysis. Google does not use your data for model training.{'\n\n'}
            <b>Supabase:</b> Secure serverless functions relay requests to the AI service. No user data is stored.
          </Section>

          <Section title="Your Rights">
            You can deny camera access, delete all local data by reinstalling the app, and contact us with privacy concerns. Photos are not stored on our servers.
          </Section>

          <Section title="Children's Privacy">
            HairMaxx is not intended for children under 13. We do not knowingly collect information from children under 13.
          </Section>

          <Section title="Contact">
            Questions? Email us at hairmaxxtool@gmail.com
          </Section>

          <div className="h-24 flex-shrink-0" />
        </div>
      </div>
    );
  }

  // Sub-page: Terms of Service
  if (view === 'terms') {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="safe-area-top flex-shrink-0" />
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-primary active:opacity-60 transition-opacity min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[15px] font-medium">Settings</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: January 28, 2026</p>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <p className="text-sm font-semibold text-amber-400 mb-1">Medical Disclaimer</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              HairMaxx is an entertainment app only. It does NOT provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
            </p>
          </div>

          <Section title="1. Acceptance of Terms">
            By downloading, installing, or using HairMaxx, you agree to be bound by these Terms of Service. If you do not agree, do not use the App.
          </Section>

          <Section title="2. Entertainment Purpose Only">
            HairMaxx is designed purely for entertainment. The App does NOT provide medical advice, diagnosis, or treatment. It does NOT replace professional medical consultation. Scores and results are for fun only. AI may produce inaccurate or inconsistent results. It should NOT be used to make health-related decisions.
          </Section>

          <Section title="3. No Medical Claims">
            The App makes no claims regarding accuracy of analysis, ability to detect or diagnose any condition, scientific validity of results, or effectiveness of tips provided.
          </Section>

          <Section title="4. User Responsibilities">
            You agree that you are at least 13 years of age, you will not rely on the App for medical decisions, you understand results are entertainment only, and you will seek professional advice for health concerns.
          </Section>

          <Section title="5. In-App Purchases">
            Each AI scan is a one-time $4.99 purchase through the App Store. There is no subscription and no auto-renewal. A scan credit is granted at purchase and is consumed when an analysis completes successfully. If an analysis fails, your credit is preserved and you can retry. Refunds are handled by Apple via Settings &gt; Apple ID &gt; Purchase History.
          </Section>

          <Section title="6. Privacy">
            Your use of the App is also governed by our Privacy Policy. Photos are processed temporarily and not permanently stored.
          </Section>

          <Section title="7. Disclaimer of Warranties">
            The App is provided "AS IS" without warranties. We do not warrant it will be error-free, accurate, or meet your expectations.
          </Section>

          <Section title="8. Limitation of Liability">
            HairMaxx shall not be liable for any indirect, incidental, special, or consequential damages from your use of the App.
          </Section>

          <Section title="9. Contact">
            Questions? Email us at hairmaxxtool@gmail.com
          </Section>

          <div className="h-24 flex-shrink-0" />
        </div>
      </div>
    );
  }

  // Sub-page: Help & FAQ
  if (view === 'help') {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="safe-area-top flex-shrink-0" />
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-primary active:opacity-60 transition-opacity min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[15px] font-medium">Settings</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Help & FAQ</h1>
          <p className="text-sm text-muted-foreground">Everything you need to know about HairMaxx</p>

          {/* Contact card */}
          <div className="rounded-2xl bg-card border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Need help?</p>
                <p className="text-xs text-muted-foreground">We typically respond within 24-48 hours</p>
              </div>
            </div>
            <a
              href="mailto:hairmaxxtool@gmail.com"
              className="block w-full text-center py-3 rounded-xl bg-primary/10 text-primary text-sm font-medium active:bg-primary/20 transition-colors"
            >
              Email Support
            </a>
          </div>

          {/* FAQ */}
          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Frequently Asked Questions
              </h3>
            </div>
            <div className="divide-y divide-border/30">
              {faqItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3.5 active:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-medium flex-1">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground/40 flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {expandedFaq === i && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.a}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              HairMaxx is for entertainment purposes only. Not medical advice. Always consult a qualified healthcare professional.
            </p>
          </div>

          <div className="h-24 flex-shrink-0" />
        </div>
      </div>
    );
  }

  // Main settings view
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="safe-area-top flex-shrink-0" />

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-5">
        {/* App Info Card */}
        <div className="rounded-2xl bg-card border border-border/50 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center ring-1 ring-primary/20">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg tracking-tight">HairMaxx</h3>
              <p className="text-sm text-muted-foreground">{scans.length} scan{scans.length !== 1 ? 's' : ''} on this device</p>
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Legal
            </h3>
          </div>

          <div className="divide-y divide-border/30">
            <button
              onClick={() => setView('privacy')}
              className="w-full flex items-center justify-between py-3.5 px-4 active:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-[18px] h-[18px] text-muted-foreground" />
                <span className="text-[15px]">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            </button>

            <button
              onClick={() => setView('terms')}
              className="w-full flex items-center justify-between py-3.5 px-4 active:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-[18px] h-[18px] text-muted-foreground" />
                <span className="text-[15px]">Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Support
            </h3>
          </div>

          <div className="divide-y divide-border/30">
            <button
              onClick={() => setView('help')}
              className="w-full flex items-center justify-between py-3.5 px-4 active:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-[18px] h-[18px] text-muted-foreground" />
                <span className="text-[15px]">Help & FAQ</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            </button>

            <a
              href="mailto:hairmaxxtool@gmail.com"
              className="w-full flex items-center justify-between py-3.5 px-4 active:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-[18px] h-[18px] text-muted-foreground" />
                <span className="text-[15px]">Contact Us</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            </a>
          </div>
        </div>

        {/* Data Section */}
        {scans.length > 0 && (
          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Data
              </h3>
            </div>
            <div className="divide-y divide-border/30">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center justify-between py-3.5 px-4 active:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-[18px] h-[18px] text-destructive/70" />
                      <span className="text-[15px] text-destructive/90">Clear All Data</span>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {scans.length} scan{scans.length !== 1 ? 's' : ''} from this device. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onClearData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground/60 font-medium">
            HairMaxx v1.3.1
          </p>
          <p className="text-xs text-muted-foreground/30 mt-1">
            Made with care for your hair
          </p>
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-24 flex-shrink-0" />
      </div>
    </div>
  );
};

// Simple section component for policy/terms pages
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}
