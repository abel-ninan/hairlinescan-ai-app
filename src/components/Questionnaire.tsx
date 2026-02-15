import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface QuestionnaireData {
  ageRange: string;
  styleTime: string;
  familyStyle: string;
  stylingFreq: string;
  careRoutine: string;
}

interface QuestionnaireProps {
  data: QuestionnaireData;
  onChange: (data: QuestionnaireData) => void;
}

export const Questionnaire = ({ data, onChange }: QuestionnaireProps) => {
  const handleChange = (field: keyof QuestionnaireData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Tell Us About You</h3>

      <div className="space-y-3">
        {/* Age Range */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Your Age</Label>
          <Select value={data.ageRange} onValueChange={(v) => handleChange("ageRange", v)}>
            <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-25">18-25</SelectItem>
              <SelectItem value="26-35">26-35</SelectItem>
              <SelectItem value="36-45">36-45</SelectItem>
              <SelectItem value="46-55">46-55</SelectItem>
              <SelectItem value="56+">56+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style Duration */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">How long have you had this hairstyle?</Label>
          <Select value={data.styleTime} onValueChange={(v) => handleChange("styleTime", v)}>
            <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weeks">A few weeks</SelectItem>
              <SelectItem value="months">Several months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Family Style */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Hair style in your family</Label>
          <Select value={data.familyStyle} onValueChange={(v) => handleChange("familyStyle", v)}>
            <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="similar">Similar to mine</SelectItem>
              <SelectItem value="different">Different from mine</SelectItem>
              <SelectItem value="varied">Varies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Styling Frequency */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">How often do you style your hair?</Label>
          <Select value={data.stylingFreq} onValueChange={(v) => handleChange("stylingFreq", v)}>
            <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="sometimes">Sometimes</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Care Routine */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Your hair care routine</Label>
          <Select value={data.careRoutine} onValueChange={(v) => handleChange("careRoutine", v)}>
            <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select routine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic (shampoo only)</SelectItem>
              <SelectItem value="moderate">Moderate (shampoo + conditioner)</SelectItem>
              <SelectItem value="extensive">Extensive (multiple products)</SelectItem>
              <SelectItem value="professional">Professional treatments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
