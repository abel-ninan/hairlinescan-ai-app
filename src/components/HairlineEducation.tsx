import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  BookOpen,
  HelpCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is a hairline?",
    answer: "Your hairline is the edge of your hair growth on your forehead. It frames your face and can vary significantly in shape, height, and pattern from person to person. Hairlines are largely determined by genetics and can change naturally over time."
  },
  {
    question: "What are the different hairline types?",
    answer: "Common hairline types include: Low Hairline (close to eyebrows), High Hairline (further up the forehead), Rounded (curved shape), Straight (horizontal line), Widow's Peak (V-shaped point in center), M-Shaped (recedes at temples), and Bell-Shaped (rounded with slight peaks)."
  },
  {
    question: "Is hairline recession normal?",
    answer: "Yes, some hairline changes are completely normal as you age. A 'mature hairline' typically develops in men during their late teens to late 20s, where the hairline moves back slightly (about 1-1.5cm). This is different from pattern baldness and is a natural part of maturing."
  },
  {
    question: "What factors affect hairline appearance?",
    answer: "Several factors influence your hairline: Genetics (most significant factor), Age, Hormones, Stress levels, Nutrition, Hairstyling practices (traction alopecia from tight styles), and Overall health. Most of these are natural and not cause for concern."
  },
  {
    question: "How accurate is this app?",
    answer: "This app uses AI for entertainment purposes only and provides cosmetic appearance analysis. Results are estimates based on photo analysis and should NOT be used for medical diagnosis. Always consult a dermatologist or trichologist for professional assessment of any hair or scalp concerns."
  },
  {
    question: "Can I improve my hairline appearance?",
    answer: "There are several ways to enhance hairline appearance: Use volumizing products, Try hairstyles that complement your hairline shape, Maintain good scalp health with proper care, Consider a professional haircut that works with your natural hairline, and Stay healthy overall."
  }
];

interface HairlineType {
  name: string;
  description: string;
  characteristics: string[];
  stylingTips: string[];
}

const hairlineTypes: HairlineType[] = [
  {
    name: "Low Hairline",
    description: "A hairline that sits closer to the eyebrows, typically 2-4cm above them.",
    characteristics: [
      "Forehead appears shorter",
      "Often has a youthful appearance",
      "Common in many ethnicities"
    ],
    stylingTips: [
      "Styles with volume work well",
      "Consider side parts to add dimension",
      "Textured cuts add interest"
    ]
  },
  {
    name: "High Hairline",
    description: "A hairline positioned higher on the forehead, creating a larger forehead appearance.",
    characteristics: [
      "More forehead visibility",
      "Can be genetic or age-related",
      "Often associated with intelligence stereotypes"
    ],
    stylingTips: [
      "Bangs or fringe can balance proportions",
      "Forward-styled looks work well",
      "Avoid slicked-back styles if concerned"
    ]
  },
  {
    name: "Widow's Peak",
    description: "A V-shaped point in the center of the hairline, named after its resemblance to a hood.",
    characteristics: [
      "Distinctive V-shape at center",
      "Strongly genetic trait",
      "Associated with many attractive features"
    ],
    stylingTips: [
      "Embrace it - it's a unique feature",
      "Side parts highlight it well",
      "Pompadour styles complement it"
    ]
  },
  {
    name: "Rounded Hairline",
    description: "A smooth, curved hairline without sharp angles or points.",
    characteristics: [
      "Soft, curved appearance",
      "Considered very balanced",
      "Versatile for many styles"
    ],
    stylingTips: [
      "Most hairstyles work well",
      "Can easily pull back hair",
      "Great for both formal and casual looks"
    ]
  },
  {
    name: "M-Shaped Hairline",
    description: "A hairline with recession at the temples, creating an M shape.",
    characteristics: [
      "Temples slightly higher",
      "Very common in mature men",
      "Can be genetic or age-related"
    ],
    stylingTips: [
      "Textured crops hide temple areas",
      "Forward styles add coverage",
      "Shorter sides balance proportions"
    ]
  },
  {
    name: "Straight Hairline",
    description: "A horizontal hairline that runs straight across the forehead.",
    characteristics: [
      "Uniform across forehead",
      "Creates a strong frame",
      "Less common than curved types"
    ],
    stylingTips: [
      "Classic styles work beautifully",
      "Can wear hair in any direction",
      "Great for minimalist looks"
    ]
  }
];

interface EducationSectionProps {
  section: 'faq' | 'types' | 'tips';
}

export const HairlineEducation = ({ section }: EducationSectionProps) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedType, setExpandedType] = useState<number | null>(null);

  if (section === 'faq') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Frequently Asked Questions</h3>
        </div>
        {faqs.map((faq, index) => (
          <div key={index} className="glass-panel overflow-hidden">
            <button
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-sm pr-4">{faq.question}</span>
              {expandedFaq === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            {expandedFaq === index && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (section === 'types') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Hairline Types Guide</h3>
        </div>
        {hairlineTypes.map((type, index) => (
          <div key={index} className="glass-panel overflow-hidden">
            <button
              onClick={() => setExpandedType(expandedType === index ? null : index)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div>
                <span className="font-medium">{type.name}</span>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </div>
              {expandedType === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            {expandedType === index && (
              <div className="px-4 pb-4 pt-0 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Characteristics
                  </p>
                  <ul className="space-y-1">
                    {type.characteristics.map((char, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Styling Tips
                  </p>
                  <ul className="space-y-1">
                    {type.stylingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
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
  }

  // Tips section
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Hair Care Best Practices</h3>
      </div>

      <div className="glass-panel p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-500">1</span>
          Daily Care Routine
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Wash hair 2-3 times per week with sulfate-free shampoo</li>
          <li>• Use lukewarm water - hot water can dry out your scalp</li>
          <li>• Gently massage scalp to improve circulation</li>
          <li>• Pat dry with a soft towel instead of rubbing</li>
          <li>• Let hair air dry when possible</li>
        </ul>
      </div>

      <div className="glass-panel p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-500">2</span>
          Nutrition for Hair Health
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Protein-rich foods (eggs, fish, lean meats)</li>
          <li>• Iron sources (spinach, lentils, red meat)</li>
          <li>• Omega-3 fatty acids (salmon, walnuts, flaxseed)</li>
          <li>• Biotin (eggs, almonds, sweet potatoes)</li>
          <li>• Stay hydrated - drink plenty of water</li>
        </ul>
      </div>

      <div className="glass-panel p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-500">3</span>
          Styling Best Practices
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Avoid tight hairstyles that pull on the hairline</li>
          <li>• Use heat protectant before using hot tools</li>
          <li>• Limit heat styling to preserve hair health</li>
          <li>• Choose the right products for your hair type</li>
          <li>• Get regular trims every 4-6 weeks</li>
        </ul>
      </div>

      <div className="glass-panel p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-500">4</span>
          Lifestyle Factors
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Manage stress through exercise or meditation</li>
          <li>• Get 7-8 hours of quality sleep</li>
          <li>• Avoid smoking - it affects hair health</li>
          <li>• Protect hair from sun and environmental damage</li>
          <li>• Regular exercise improves overall circulation</li>
        </ul>
      </div>

      <div className="glass-panel p-4 bg-amber-500/10 border-amber-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              When to See a Professional
            </h4>
            <p className="text-sm text-muted-foreground">
              If you notice sudden or significant hair changes, excessive shedding,
              scalp irritation, or have concerns about hair loss, please consult a
              dermatologist or trichologist. Early professional advice can be helpful.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
