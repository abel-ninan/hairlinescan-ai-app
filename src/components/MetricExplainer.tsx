import { useState } from 'react';
import {
  Info,
  X,
  BarChart3,
  Maximize2,
  PenTool,
  Layers,
  Box,
  Fingerprint
} from 'lucide-react';

interface MetricInfo {
  name: string;
  icon: React.ReactNode;
  shortDescription: string;
  fullDescription: string;
  whatItMeasures: string[];
  whatAffectsIt: string[];
  improvementTips: string[];
}

const metrics: MetricInfo[] = [
  {
    name: "Overall Score",
    icon: <BarChart3 className="w-5 h-5" />,
    shortDescription: "Your combined hairline appearance score",
    fullDescription: "The overall score is a weighted average of all individual metrics, giving you a single number that represents the overall cosmetic appearance of your hairline based on the photo analysis.",
    whatItMeasures: [
      "Combined assessment of all hairline characteristics",
      "Balance between different hairline features",
      "Overall visual harmony and appearance"
    ],
    whatAffectsIt: [
      "Photo quality and lighting",
      "Hair styling at time of photo",
      "All individual metric scores",
      "Consistency across features"
    ],
    improvementTips: [
      "Take photos in good, even lighting",
      "Ensure hairline is clearly visible",
      "Style hair naturally before scanning"
    ]
  },
  {
    name: "Symmetry",
    icon: <Maximize2 className="w-5 h-5" />,
    shortDescription: "How balanced your hairline appears",
    fullDescription: "Symmetry measures how evenly balanced your hairline is from left to right. While perfect symmetry is rare and not necessary for an attractive appearance, general balance contributes to a harmonious look.",
    whatItMeasures: [
      "Left-to-right balance of the hairline",
      "Evenness of temple recession",
      "Center point alignment"
    ],
    whatAffectsIt: [
      "Natural genetics and hair growth patterns",
      "How you part or style your hair",
      "Camera angle in the photo",
      "Head position relative to camera"
    ],
    improvementTips: [
      "Face the camera directly for accurate reading",
      "Experiment with different parts",
      "Consider styles that create visual balance"
    ]
  },
  {
    name: "Definition",
    icon: <PenTool className="w-5 h-5" />,
    shortDescription: "Clarity of your hairline edge",
    fullDescription: "Definition measures how clearly defined the edge of your hairline is. A well-defined hairline has a clear boundary between hair and forehead, while a less defined hairline may appear more gradual or fuzzy.",
    whatItMeasures: [
      "Sharpness of the hairline edge",
      "Clarity of the hair-to-skin transition",
      "Consistency of the hairline border"
    ],
    whatAffectsIt: [
      "Hair thickness and density at the edges",
      "How recently you've had a haircut",
      "Natural hair growth patterns",
      "Photo focus and quality"
    ],
    improvementTips: [
      "Regular edge cleanup by a barber",
      "Use products that define edges",
      "Ensure good lighting when taking photos"
    ]
  },
  {
    name: "Fullness",
    icon: <Layers className="w-5 h-5" />,
    shortDescription: "Density and coverage of hair",
    fullDescription: "Fullness assesses the visual density and coverage of your hair, particularly along the hairline. This metric considers how thick and full your hair appears in the analyzed area.",
    whatItMeasures: [
      "Hair density at the hairline",
      "Visual coverage and thickness",
      "Overall volume appearance"
    ],
    whatAffectsIt: [
      "Natural hair thickness and count",
      "Styling and product use",
      "Lighting in the photo",
      "Hair length and cut style"
    ],
    improvementTips: [
      "Volumizing products can enhance appearance",
      "Consider cuts that maximize volume",
      "Good nutrition supports hair health"
    ]
  },
  {
    name: "Structure",
    icon: <Box className="w-5 h-5" />,
    shortDescription: "Shape and form of your hairline",
    fullDescription: "Structure evaluates the overall shape and architectural form of your hairline. This includes the curve, angles, and distinctive features that make up your unique hairline pattern.",
    whatItMeasures: [
      "Overall hairline shape and form",
      "Presence of distinctive features",
      "Consistency of the hairline pattern"
    ],
    whatAffectsIt: [
      "Genetics - hairline shape is inherited",
      "Natural aging and maturation",
      "Styling choices and hair direction",
      "Previous haircuts and styling"
    ],
    improvementTips: [
      "Work with your natural hairline shape",
      "Consult a stylist for flattering cuts",
      "Embrace unique features like widow's peaks"
    ]
  },
  {
    name: "Texture",
    icon: <Fingerprint className="w-5 h-5" />,
    shortDescription: "Quality and condition of hair",
    fullDescription: "Texture assesses the visual quality and condition of your hair as it appears in the photo. This includes shine, smoothness, and overall health appearance of the hair along your hairline.",
    whatItMeasures: [
      "Visual health of hair strands",
      "Shine and light reflection",
      "Smoothness and frizz levels"
    ],
    whatAffectsIt: [
      "Hair care routine and products",
      "Environmental factors",
      "Heat styling and chemical treatments",
      "Overall health and nutrition"
    ],
    improvementTips: [
      "Use quality conditioners",
      "Limit heat styling",
      "Protect from sun and environmental damage"
    ]
  }
];

interface MetricExplainerProps {
  metricName?: string;
  showAll?: boolean;
}

export const MetricExplainer = ({ metricName, showAll = false }: MetricExplainerProps) => {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const filteredMetrics = metricName
    ? metrics.filter(m => m.name.toLowerCase() === metricName.toLowerCase())
    : metrics;

  const displayMetrics = showAll ? filteredMetrics : filteredMetrics.slice(0, 1);

  return (
    <div className="space-y-3">
      {displayMetrics.map((metric) => (
        <div key={metric.name} className="glass-panel overflow-hidden">
          <button
            onClick={() => setExpandedMetric(
              expandedMetric === metric.name ? null : metric.name
            )}
            className="w-full p-4 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {metric.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{metric.name}</h4>
              <p className="text-xs text-muted-foreground">
                {metric.shortDescription}
              </p>
            </div>
            <Info className="w-5 h-5 text-muted-foreground" />
          </button>

          {expandedMetric === metric.name && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {metric.fullDescription}
              </p>

              <div>
                <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  What It Measures
                </h5>
                <ul className="space-y-1">
                  {metric.whatItMeasures.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  What Can Affect It
                </h5>
                <ul className="space-y-1">
                  {metric.whatAffectsIt.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Tips
                </h5>
                <ul className="space-y-1">
                  {metric.improvementTips.map((tip, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Quick info modal component
interface MetricInfoModalProps {
  metricName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MetricInfoModal = ({ metricName, isOpen, onClose }: MetricInfoModalProps) => {
  const metric = metrics.find(m => m.name.toLowerCase() === metricName.toLowerCase());

  if (!isOpen || !metric) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-card p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {metric.icon}
            </div>
            <h3 className="font-semibold">{metric.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {metric.fullDescription}
          </p>

          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              What It Measures
            </h5>
            <ul className="space-y-1">
              {metric.whatItMeasures.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Tips to Improve
            </h5>
            <ul className="space-y-1">
              {metric.improvementTips.map((tip, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
