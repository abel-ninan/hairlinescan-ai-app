import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HairlineEducation } from '@/components/HairlineEducation';
import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  GraduationCap
} from 'lucide-react';

export const LearnScreen = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'tips' | 'faq'>('types');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <GraduationCap className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold">Learn</h1>
        </div>
        <p className="text-muted-foreground">
          Understand hairlines and hair care
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'types' | 'tips' | 'faq')}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="types" className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Types</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Tips</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="types">
            <HairlineEducation section="types" />
          </TabsContent>

          <TabsContent value="tips">
            <HairlineEducation section="tips" />
          </TabsContent>

          <TabsContent value="faq">
            <HairlineEducation section="faq" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
