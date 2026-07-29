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
  recentChanges: string;
  familyHistory: string;
  sheddingLevel: string;
  scalpIssues: string;
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
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground tracking-tight">About You</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Helps personalize your analysis</p>
      </div>

      <div className="space-y-4">
        {/* Age Range */}
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-foreground/90">Age Range</Label>
          <Select value={data.ageRange} onValueChange={(v) => handleChange("ageRange", v)}>
            <SelectTrigger className="h-12 bg-white/[0.04] border-white/[0.06] rounded-xl text-[15px]">
              <SelectValue placeholder="Select your age" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-25">18 - 25</SelectItem>
              <SelectItem value="26-35">26 - 35</SelectItem>
              <SelectItem value="36-45">36 - 45</SelectItem>
              <SelectItem value="46-55">46 - 55</SelectItem>
              <SelectItem value="56+">56+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recent Changes */}
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-foreground/90">Noticed any hair changes recently?</Label>
          <Select value={data.recentChanges} onValueChange={(v) => handleChange("recentChanges", v)}>
            <SelectTrigger className="h-12 bg-white/[0.04] border-white/[0.06] rounded-xl text-[15px]">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No changes</SelectItem>
              <SelectItem value="yes">Yes, some changes</SelectItem>
              <SelectItem value="unsure">Not sure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Family History */}
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-foreground/90">Family history of hair loss?</Label>
          <Select value={data.familyHistory} onValueChange={(v) => handleChange("familyHistory", v)}>
            <SelectTrigger className="h-12 bg-white/[0.04] border-white/[0.06] rounded-xl text-[15px]">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None that I know of</SelectItem>
              <SelectItem value="father">Father's side</SelectItem>
              <SelectItem value="mother">Mother's side</SelectItem>
              <SelectItem value="both">Both sides</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shedding Level */}
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-foreground/90">Daily hair shedding level</Label>
          <Select value={data.sheddingLevel} onValueChange={(v) => handleChange("sheddingLevel", v)}>
            <SelectTrigger className="h-12 bg-white/[0.04] border-white/[0.06] rounded-xl text-[15px]">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="heavy">Heavy</SelectItem>
              <SelectItem value="unsure">Not sure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scalp Issues */}
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-foreground/90">Any scalp issues?</Label>
          <Select value={data.scalpIssues} onValueChange={(v) => handleChange("scalpIssues", v)}>
            <SelectTrigger className="h-12 bg-white/[0.04] border-white/[0.06] rounded-xl text-[15px]">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="dryness">Dryness</SelectItem>
              <SelectItem value="oiliness">Oiliness</SelectItem>
              <SelectItem value="dandruff">Dandruff</SelectItem>
              <SelectItem value="irritation">Irritation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
