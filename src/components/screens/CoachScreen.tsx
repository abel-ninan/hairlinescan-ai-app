import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  BarChart3,
  Target,
  Lightbulb,
  ScanLine,
  ArrowLeft,
  Lock,
  BookOpen,
  Sparkles,
  Wrench,
  Leaf,
  FlaskConical,
  Scissors,
  SearchCheck,
  Apple,
  Droplets,
  Brain,
  Sun,
} from 'lucide-react';
import { Scan } from '@/types/database';
import { renderRichText, SourcesBlock, Citation } from '@/lib/renderText';
import { useEdgeSwipeBack } from '@/hooks/useEdgeSwipeBack';

interface CoachScreenProps {
  onNewScan: () => void;
  scans: Scan[];
}

interface TopicSection {
  title: string;
  content: string[];
  sources?: Citation[];
}

interface TopicData {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  intro: string;
  sections: TopicSection[];
}

const topicContent: TopicData[] = [
  {
    icon: BookOpen,
    label: 'Hair Health Guide',
    intro: 'Understanding your hair biology is the foundation of any effective hair care strategy. Here is everything you need to know about how hair grows, what affects it, and how to keep it healthy.',
    sections: [
      {
        title: 'Understanding the Hair Growth Cycle',
        content: [
          'Each hair follicle goes through three phases: Growth phase (active growth, 2-7 years), Transition phase (2-3 weeks), and Resting phase (shedding, 3 months). At any time, about 85-90% of your hair is in the growth phase.',
          'Losing 50-100 hairs per day is completely normal [1]. If you notice significantly more shedding, clumps of hair, or widening parts, it may be worth investigating further.',
          'The length of your growth phase is largely genetic and determines your maximum hair length. Factors like nutrition, stress, and hormones can shorten this phase.',
          'Hair grows approximately 1.25 cm (0.5 inches) per month, or about 15 cm (6 inches) per year [1]. This is why any new routine requires at least 3-6 months to show visible results.',
          'The average person has about 100,000 hair follicles on their head. Blondes tend to have more (~120,000), brunettes about 100,000, and redheads fewer (~80,000). You must lose roughly 50% of density before thinning becomes visually obvious to others.',
          'A fourth phase, the release phase, is now recognized — this is the active shedding sub-phase of the resting phase where the old hair is released from the follicle while the new growth-phase hair begins growing beneath it.',
        ],
        sources: [
          { n: 1, authors: 'American Academy of Dermatology', title: 'Do you have hair loss or hair shedding?', year: 2024, journal: 'AAD.org', url: 'https://www.aad.org/public/diseases/hair-loss/insider/shedding' },
        ],
      },
      {
        title: 'What Causes Hair Loss',
        content: [
          'Pattern hair changes (the most common type of hair change in men) are primarily genetic. Hair follicles gradually produce thinner hairs over time due to hormonal sensitivity. By age 35, around two-thirds of men experience noticeable hair loss, and by age 50 about 85% see significant thinning [1].',
          'Temporary shedding is diffuse hair loss triggered by stress, illness, surgery, crash dieting, or hormonal changes. It typically appears 2-4 months after the triggering event and usually resolves within 6-9 months once the trigger is removed.',
          'Patchy hair loss is a condition causing sudden loss in small areas. It affects approximately 2% of the population. If you notice sudden patchy loss, talk to a hair care professional for evaluation.',
          'Traction-related hair loss results from chronic pulling tension on hair from tight hairstyles (braids, ponytails, extensions). If caught early, it is reversible. Chronic traction leads to permanent hair loss in affected areas.',
          'Other factors include nutritional gaps (iron, zinc, biotin, vitamin D), thyroid changes, certain prescriptions, and styling habits. A varied diet and healthy lifestyle support overall hair health.',
        ],
        sources: [
          { n: 1, authors: 'American Hair Loss Association', title: "Men's Hair Loss", year: 2024, journal: 'americanhairloss.org', url: 'https://www.americanhairloss.org/mens-hair-loss/' },
        ],
      },
      {
        title: 'The Norwood Scale Explained',
        content: [
          'The Hamilton-Norwood scale classifies male pattern hair loss into 7 stages. Stage 1 shows no significant hair loss. Stage 2 is a mature/adult hairline with slight temporal recession — this is normal and affects most men by their late 20s.',
          'Stages 3-4 show deepening temporal recession and possible vertex (crown) thinning. These stages are where Many men find that adjusting their grooming routine and hairstyle at this stage makes a noticeable difference.',
          'Stages 5-7 represent extensive loss where the frontal and vertex areas merge. Exploring different hairstyles and grooming products can help you look your best. A barber or stylist can offer great personalized advice.',
          'For women, the Ludwig Scale is used instead. It classifies female pattern hair loss into 3 grades of increasing diffuse thinning over the crown, typically with preservation of the frontal hairline — a key difference from male pattern loss.',
          'Various progress tracking methods can help you monitor patchy hair loss, measuring the percentage of scalp coverage from minimal to full loss.',
        ],
      },
      {
        title: 'Nutrition for Hair Health',
        content: [
          'Protein is essential — hair is 95% keratin, a structural protein. Your body needs adequate amino acids (especially cysteine, methionine, and lysine) to synthesize keratin. Good sources include eggs, fish, lean meats, legumes, and Greek yogurt. A balanced diet with enough protein supports healthy hair.',
          'Key micronutrients: Iron (low iron levels are associated with hair changes — consult a professional for the right amount), Zinc (supports follicle function), Biotin (B7, involved in keratin production; consult a professional for the right amount if deficient), Vitamin D (low levels linked to hair thinning), and Omega-3 fatty acids (support scalp health).',
          'A 2025 systematic review of 17 studies with 61,332 participants confirmed vitamin D and iron as the most critical nutrients, with higher levels inversely related to hair thinning [1]. Vitamin C was recognized primarily for improving iron absorption.',
          'The Mediterranean diet shows protective effects: a case-control study of 212 males found that eating raw vegetables 3+ times per week reduced odds of pattern hair changes by 57%, and regular fresh herb consumption reduced odds by 56% [2].',
          'Stay well hydrated — hair is 25% water by weight. Dehydration makes hair brittle, reduces elasticity, and slows growth. Aim for at least 2.5-3 liters of water daily.',
        ],
        sources: [
          { n: 1, authors: 'Gomes N, Silva N, Teixeira B', title: 'Assessing the relationship between dietary factors and hair health: A systematic review', year: 2025, journal: 'Nutrition and Health', url: 'https://pubmed.ncbi.nlm.nih.gov/40836838/' },
          { n: 2, authors: 'Fortes C, Mastroeni S, et al.', title: 'Mediterranean diet: fresh herbs and fresh vegetables decrease the risk of Androgenetic Alopecia in males', year: 2018, journal: 'Archives of Dermatological Research', url: 'https://pubmed.ncbi.nlm.nih.gov/29181579/' },
        ],
      },
      {
        title: 'Lifestyle Factors',
        content: [
          'Sleep: During deep sleep, your body supports cell renewal and hair growth. A 2025 study found that being a "night owl" / evening chronotype may be linked to gradual thinning, possibly connected to disrupted sleep patterns [1].',
          'Stress management: Chronic stress can push hair follicles into the resting phase prematurely. A landmark 2021 study from Ya-Chieh Hsu\'s lab at Harvard found that the stress hormone corticosterone suppresses GAS6, a key signal needed for hair follicle stem cell activation [2].',
          'Exercise: Regular moderate exercise improves blood circulation to the scalp, reduces stress hormones, and supports overall health. A 2025 randomized controlled trial found no significant link between creatine supplementation and hair changes over 12 weeks, debunking a common gym myth [3].',
          'Avoid smoking: Smoking reduces blood flow to the scalp and exposes follicles to toxins, accelerating hair thinning. Studies show smokers have significantly higher rates of hair loss.',
          'Gut health matters: Emerging research shows that a healthy gut supports nutrient absorption and reduces inflammation. Probiotic-rich foods like yogurt, kefir, and kimchi may support overall hair health.',
        ],
        sources: [
          { n: 1, authors: 'Wu Q, Li M, Xiong Y, et al.', title: 'Association between sleep patterns, circadian rhythms, and hair loss in young adults', year: 2025, journal: 'Chronobiology International', url: 'https://pubmed.ncbi.nlm.nih.gov/40844134/' },
          { n: 2, authors: 'Choi S, Zhang B, Ma S, et al. (Hsu Lab, Harvard)', title: 'Corticosterone inhibits GAS6 to govern hair follicle stem-cell quiescence', year: 2021, journal: 'Nature', url: 'https://pubmed.ncbi.nlm.nih.gov/33790465/' },
          { n: 3, authors: 'Antonio J, Evans C, et al.', title: 'Does creatine cause hair loss? A 12-week randomized controlled trial', year: 2025, journal: 'Journal of the International Society of Sports Nutrition', url: 'https://pubmed.ncbi.nlm.nih.gov/40265319/' },
        ],
      },
    ],
  },
  {
    icon: Sparkles,
    label: 'Best Hair Products',
    intro: 'Choosing the right products can make a significant difference in hair health and appearance. Here are evidence-based product recommendations organized by category, updated with the latest research.',
    sections: [
      {
        title: 'Shampoos',
        content: [
          'Anti-Dandruff Shampoo: Shampoos with antifungal and scalp-soothing ingredients help maintain a healthy scalp environment. Use 2-3 times per week. Look for formulas with zinc pyrithione, selenium sulfide, or tea tree oil.',
          'Caffeine Shampoo: A 2017 multicenter open-label randomized trial found a caffeine-based topical liquid at 0.2% was non-inferior to minoxidil 5% solution for male androgenetic alopecia [1]. Look for shampoos with at least 0.2% caffeine for best results.',
          'Biotin-enriched Shampoo: While biotin is more effective taken orally, biotin shampoos can strengthen the hair shaft and reduce breakage. Look for formulas that also contain niacinamide (vitamin B3), which improves blood flow to the scalp and strengthens the skin barrier.',
          'Sulfate-free options: Shampoos without SLS/SLES are gentler on the scalp and preserve the scalp microbiome. The scalp-first approach is the dominant trend in professional hair care for 2025-2026, treating the scalp like skin with barrier support and microbiome-friendly cleansing.',
        ],
        sources: [
          { n: 1, authors: 'Dhurat R, Chitallia J, et al.', title: 'An Open-Label Randomized Multicenter Study Assessing the Noninferiority of a Caffeine-Based Topical Liquid 0.2% versus Minoxidil 5% Solution in Male Androgenetic Alopecia', year: 2017, journal: 'Skin Pharmacology and Physiology', url: 'https://pubmed.ncbi.nlm.nih.gov/29241229/' },
        ],
      },
      {
        title: 'Conditioners & Deep Care',
        content: [
          'Use a conditioner after every wash — it seals the hair cuticle, reduces friction, and prevents breakage. Focus on mid-lengths to ends, avoiding the scalp.',
          'Deep conditioning masks with ingredients like argan oil, shea butter, or hydrolyzed keratin can repair damaged hair when used weekly.',
          'Leave-in conditioners with heat protectant properties are essential if you use blow dryers or styling tools. Look for products with silicones (dimethicone, cyclomethicone) that form a protective barrier.',
          'Scalp serums containing niacinamide (vitamin B3) improve blood flow, strengthen the skin barrier, and reduce inflammation. Salicylic acid (BHA) serums provide gentle chemical exfoliation for the scalp.',
          'Hyaluronic acid scalp products are a new category gaining traction — they hydrate the scalp without adding oil, improving the follicular environment.',
        ],
      },
      {
        title: 'Topical Products',
        content: [
          'Growth Serums: Look for serums containing peptides, biotin, caffeine, or plant-based growth factors. Apply to clean scalp as directed. Results take 3-6 months of consistent use. Initial increased shedding can be normal as your scalp adjusts to a new routine.',
          'Rosemary Oil: One of the most popular natural hair care ingredients. A 2015 randomized comparative trial (Panahi et al.) found rosemary oil as effective as minoxidil 2% for androgenetic alopecia over 6 months [1]. Mix 3-5 drops with a carrier oil and massage into scalp for 5 minutes before washing.',
          'Copper Peptides (GHK-Cu): An active ingredient in some hair serums. A 2015 BioMed Research International review documented GHK\'s role in skin and follicle regeneration [2]. Concentrations vary by product — follow label directions.',
          'Topical Melatonin: A 2012 multicenter study of more than 1,800 volunteers found topical melatonin associated with improvements on the hair-pull test over 3 months [3]. Apply in the evening as directed on the product label.',
          'Saw Palmetto Serum: A 2020 systematic review in Skin Appendage Disorders found 60% of participants reported improved hair quality, with a 27% rise in hair count and 83% reporting greater density across the included studies [4].',
          'Pumpkin Seed Oil: A 2014 randomized, double-blind, placebo-controlled trial of 76 men found 400 mg/day pumpkin seed oil for 24 weeks led to a 40% mean increase in hair count compared to placebo [5].',
        ],
        sources: [
          { n: 1, authors: 'Panahi Y, Taghizadeh M, et al.', title: 'Rosemary oil vs minoxidil 2% for the treatment of androgenetic alopecia: a randomized comparative trial', year: 2015, journal: 'Skinmed', url: 'https://pubmed.ncbi.nlm.nih.gov/25842469/' },
          { n: 2, authors: 'Pickart L, Vasquez-Soltero JM, Margolina A', title: 'GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration', year: 2015, journal: 'BioMed Research International', url: 'https://onlinelibrary.wiley.com/doi/10.1155/2015/648108' },
          { n: 3, authors: 'Fischer TW, Trueb RM, et al.', title: 'Topical Melatonin for Treatment of Androgenetic Alopecia', year: 2012, journal: 'International Journal of Trichology', url: 'https://pubmed.ncbi.nlm.nih.gov/23766606/' },
          { n: 4, authors: 'Evron E, Juhasz M, et al.', title: 'Natural Hair Supplement: Friend or Foe? Saw Palmetto, a Systematic Review in Alopecia', year: 2020, journal: 'Skin Appendage Disorders', url: 'https://pubmed.ncbi.nlm.nih.gov/33313047/' },
          { n: 5, authors: 'Cho YH, Lee SY, et al.', title: 'Effect of pumpkin seed oil on hair growth in men with androgenetic alopecia: a randomized, double-blind, placebo-controlled trial', year: 2014, journal: 'Evidence-Based Complementary and Alternative Medicine', url: 'https://pubmed.ncbi.nlm.nih.gov/24864154/' },
        ],
      },
      {
        title: 'Supplements',
        content: [
          'Biotin: Supports keratin infrastructure. Most effective for those with actual biotin deficiency, which is relatively uncommon. Consult a professional for the right amount. Important: biotin can interfere with lab tests (thyroid panels, troponin) — stop supplementation 72 hours before blood work.',
          'Vitamin D3: Many people are deficient, and low vitamin D is associated with hair loss. Research suggests many people with temporary shedding have vitamin D deficiency [1]. If you think you may be deficient, consult a professional for the right amount.',
          'Iron (if deficient): Only supplement if blood tests show low iron levels. Research suggests many people with temporary shedding have low iron [1]. Consult a professional for the right amount. Take with vitamin C to boost absorption. Avoid taking with calcium, tea, or coffee.',
          'Zinc (consult a professional for the right amount if deficient): Plays a critical role in follicle function and DNA synthesis. Research has found zinc levels were significantly lower in people with various types of hair loss. Limit supplementation duration to avoid copper deficiency.',
          'Marine Collagen: Provides amino acids that support hair structure. Studies suggest improved hair thickness and reduced shedding after 90 days.',
          'Omega-3 Fish Oil: A 2015 study of 120 women found a 6-month combined omega-3/6/antioxidant supplement led to about 89.9% of participants reporting reduced hair loss [2]. Consult a professional for the right amount.',
        ],
        sources: [
          { n: 1, authors: 'Gomes N, Silva N, Teixeira B', title: 'Assessing the relationship between dietary factors and hair health: A systematic review (17 studies, 61,332 participants)', year: 2025, journal: 'Nutrition and Health', url: 'https://pubmed.ncbi.nlm.nih.gov/40836838/' },
          { n: 2, authors: "Le Floc'h C, Cheniti A, et al.", title: 'Effect of a nutritional supplement on hair loss in women', year: 2015, journal: 'Journal of Cosmetic Dermatology', url: 'https://onlinelibrary.wiley.com/doi/abs/10.1111/jocd.12127' },
        ],
      },
    ],
  },
  {
    icon: Wrench,
    label: 'Best Hair Tools',
    intro: 'The right tools can enhance your hair care routine and even stimulate growth. Here are the most effective tools backed by science and professional recommendations, updated with the latest data.',
    sections: [
      {
        title: 'Scalp Massagers',
        content: [
          'Manual scalp massage has been shown in peer-reviewed research to improve scalp blood flow and increase hair thickness. A 2016 study in Eplasty (Koyama et al.) found that 4 minutes per day of standardized scalp massage in 9 Japanese men resulted in measurably thicker hair after 24 weeks [1].',
          'Use gentle, circular motions during shampooing or on a dry scalp. This helps distribute natural oils, remove dead skin cells, and stimulate follicles.',
          'Electric scalp massagers offer more consistent pressure and vibration. Look for ones with multiple massage modes and waterproof design for shower use.',
        ],
        sources: [
          { n: 1, authors: 'Koyama T, Kobayashi K, Hama T, Murakami K, Ogawa R', title: 'Standardized Scalp Massage Results in Increased Hair Thickness by Inducing Stretching Forces to Dermal Papilla Cells in the Subcutaneous Tissue', year: 2016, journal: 'Eplasty', url: 'https://pubmed.ncbi.nlm.nih.gov/26904154/' },
        ],
      },
      {
        title: 'Derma Rollers & Microneedling',
        content: [
          'Microneedling creates tiny micro-channels that may support scalp health and product absorption. A roller or dermapen used on the scalp can help your favorite serums penetrate more effectively.',
          'For best results, use a 0.25mm roller for home use, once per week. Professional settings may use deeper needles. Always start gentle and increase frequency as your scalp adjusts.',
          'A 2024 systematic review and meta-analysis of randomized controlled trials in androgenetic alopecia found that shallow needle depths (≤1mm) were at least as effective as deeper depths (>1mm) on hair count outcomes [1]. Home use is generally recommended at 0.25mm; deeper depths are typically clinical settings.',
          'Apply your growth serums or scalp products 24 hours AFTER microneedling (not immediately — give your scalp time to recover). The micro-channels help products absorb better.',
          'Pen-type devices (dermapens) allow more consistent depth and adjustable settings compared to rolling devices.',
          'Replace your derma roller every 8-12 uses, as the needles dull. Safety: in the same review, adverse events were mild and self-limiting (scalp itching, mild redness, transient bleeding), with no systemic adverse events reported [1].',
        ],
        sources: [
          { n: 1, authors: 'Xu Y, et al.', title: 'Effect of Microneedle on Hair Regrowth in Patients with Androgenetic Alopecia: A Systematic Review and Meta-Analysis of Randomized Controlled Trials', year: 2024, journal: 'Facial Plastic Surgery & Aesthetic Medicine (Thieme)', url: 'https://www.thieme-connect.com/products/ejournals/pdf/10.1055/s-0044-1782181.pdf' },
        ],
      },
      {
        title: 'Low-Level Laser Devices (LLLT)',
        content: [
          'Laser caps and combs use red light (620-678nm wavelength, with 650nm identified as most effective) to support scalp health. Many commercially available devices are on the market.',
          'Studies suggest LLLT may support hair appearance, with some research showing comparable results to popular topical products.',
          'A 2025 review of 63 articles on light-based therapies for alopecia confirmed positive effects across multiple hair change patterns, with no serious side effects reported in the included studies [1].',
          'Recommended use: 20-30 minutes, every other day. Results typically appear after 3-6 months of consistent use. Effects cease when use stops.',
          'Laser caps (iRestore, Capillus) offer full scalp coverage and hands-free convenience. Best used alongside your regular hair care routine for combined benefits.',
          'Important limitation: LLLT cannot stimulate growth from inactive follicles. It works by supporting weakened but still-living follicles.',
        ],
        sources: [
          { n: 1, title: 'The Use of Light-Based Therapies in the Treatment of Alopecia', year: 2025, journal: 'Journal of Cosmetic Dermatology', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12395542/' },
        ],
      },
      {
        title: 'AI-Powered Scalp Analyzers',
        content: [
          'New AI-powered scalp analyzers (such as Becon Pro) can measure 10+ scalp parameters: pore density, hairs per follicle, hair thickness, volume, dandruff, sebum levels, moisture, temperature, and even scalp odor.',
          'These devices use UV-A LED imaging with 50X and 200X magnification and AI algorithms to provide personalized recommendations based on scalp conditions.',
          'AI-powered scalp microbiome analysis is an active research area. A 2025 paper in mSystems described a "MiSCH" index using multi-kingdom 16S rRNA + ITS1 sequencing and machine learning to assess scalp health [1].',
          'For home monitoring, consistent monthly progress photos from the same angle, lighting, and distance remain the most reliable way to track changes, as day-to-day differences are too subtle to notice.',
        ],
        sources: [
          { n: 1, authors: 'Wang X, Li F, Sun Y, Meng F, Song Y, Su X', title: 'Microbial dysbiosis and its diagnostic potential in androgenetic alopecia: insights from multi-kingdom sequencing and machine learning', year: 2025, journal: 'mSystems', url: 'https://pubmed.ncbi.nlm.nih.gov/40434156/' },
        ],
      },
      {
        title: 'Brushes, Combs & Styling Tools',
        content: [
          'Use a wide-tooth comb on wet hair to minimize breakage. Wet hair stretches significantly more than dry hair (up to ~30% beyond its original length before breaking), making it more vulnerable to snapping [1].',
          'Boar bristle brushes distribute natural scalp oils along the hair shaft, adding shine and reducing frizz. Use on dry hair only.',
          'Detangling brushes (like Tangle Teezer or Wet Brush) flex with the hair rather than pulling, which may reduce breakage compared to traditional brushes. Note: specific percentage figures often cited come from brand-commissioned testing rather than peer-reviewed studies.',
          'If using a blow dryer, keep it at least 6 inches away and use medium heat. Ionic dryers reduce drying time and minimize heat damage. High heat (above 150°C/300°F) damages the protein structure of hair.',
          'Always apply a heat protectant spray before using any heated styling tools. Avoid tight hair ties with metal clasps — use silk or satin scrunchies instead to prevent traction-related hair loss.',
        ],
        sources: [
          { n: 1, authors: 'Sinclair RD', title: 'Healthy Hair: What Is it?', year: 2007, journal: 'Journal of Investigative Dermatology Symposium Proceedings', url: 'https://www.jidsponline.org/article/S0022-202X(15)52655-9/fulltext' },
        ],
      },
    ],
  },
  {
    icon: Leaf,
    label: 'Natural Remedies',
    intro: 'Natural approaches to hair health have been used for centuries. While evidence varies, several natural remedies now have robust scientific support for promoting hair growth and scalp health.',
    sections: [
      {
        title: 'Essential Oils',
        content: [
          'Rosemary Oil: The most well-studied essential oil for hair growth. The 2015 Panahi et al. randomized comparative trial found rosemary oil as effective as minoxidil 2% for androgenetic alopecia [1]. Mix 3-5 drops with a carrier oil and massage into scalp for 5 minutes before washing.',
          'Peppermint Oil: A 2014 mouse study found 3% peppermint oil outperformed 3% minoxidil for hair growth markers [2]. Use 2-3 drops mixed with coconut or jojoba oil.',
          'Lavender Oil: Has antimicrobial and anti-inflammatory properties. A 2025 double-blind, randomized, three-armed, placebo-controlled clinical trial of "Rosmagain" (a rosemary-lavender oil topical) reported a 57.73% increase in hair growth rate vs placebo [3]. Use 3-4 drops in a carrier oil.',
          'Tea Tree Oil: Excellent for scalp health — it has antifungal and antibacterial properties. A 2002 RCT in JAAD with 126 patients found a 5% tea tree oil shampoo improved dandruff by 41% vs 11% with placebo over 4 weeks [4]. Use 2-3 drops mixed with shampoo.',
        ],
        sources: [
          { n: 1, authors: 'Panahi Y, Taghizadeh M, et al.', title: 'Rosemary oil vs minoxidil 2% for the treatment of androgenetic alopecia: a randomized comparative trial', year: 2015, journal: 'Skinmed', url: 'https://pubmed.ncbi.nlm.nih.gov/25842469/' },
          { n: 2, authors: 'Oh JY, Park MA, Kim YC', title: 'Peppermint Oil Promotes Hair Growth without Toxic Signs', year: 2014, journal: 'Toxicological Research', url: 'https://pubmed.ncbi.nlm.nih.gov/25584150/' },
          { n: 3, title: 'Rosmagain as a Natural Therapeutic for Hair Regrowth and Scalp Health: A Double-Blind, Randomized, Three-Armed, Placebo-Controlled Clinical Trial', year: 2025, journal: 'Cureus', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12256010/' },
          { n: 4, authors: 'Satchell AC, Saurajen A, Bell C, Barnetson RS', title: 'Treatment of dandruff with 5% tea tree oil shampoo', year: 2002, journal: 'Journal of the American Academy of Dermatology', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0190962202003134' },
        ],
      },
      {
        title: 'Natural Oils for Hair',
        content: [
          'Coconut Oil: Penetrates the hair shaft better than any other oil due to its low molecular weight. Apply before washing (pre-poo) to prevent hygral fatigue — the swelling and contraction cycle that weakens hair.',
          'Castor Oil (Jamaican Black Castor Oil): Rich in ricinoleic acid which has anti-inflammatory properties. While research on hair growth is limited, many users report thicker-feeling hair. Apply to scalp and edges 2-3 times per week.',
          'Argan Oil: Rich in vitamin E and fatty acids. Best used as a finishing oil on mid-lengths to ends to add shine and reduce frizz without weighing hair down.',
          'Jojoba Oil: Chemically similar to sebum (your scalp\'s natural oil), making it excellent for balancing oil production. Good for both oily and dry scalps.',
        ],
      },
      {
        title: 'Scalp Care',
        content: [
          'Apple Cider Vinegar Rinse: Mix 2 tablespoons ACV with 1 cup water. Use as a final rinse after conditioning. It helps remove product buildup, balances scalp pH (4.5-5.5), and adds shine. Use once a week.',
          'Aloe Vera Gel: Contains proteolytic enzymes that repair dead skin cells on the scalp. It has anti-inflammatory properties and can soothe an irritated scalp. Apply pure aloe gel for 30 minutes before washing.',
          'Green Tea Rinse: Green tea contains EGCG, a potent antioxidant that may support scalp health. Drinking green tea regularly or using it as a cooled scalp rinse can be a nice addition to your routine.',
          'Onion Juice: Some research suggests onion juice may support scalp health and hair appearance when applied regularly. It is believed to support collagen production and improve blood supply to follicles.',
        ],
      },
      {
        title: 'Dietary Natural Remedies',
        content: [
          'Saw Palmetto: A 2020 systematic review in Skin Appendage Disorders of saw palmetto for alopecia found that across the included studies, 60% of participants reported improved hair quality, 27% had a rise in hair count, and 83% had greater density [1]. Available as capsules or topical serum.',
          'Pumpkin Seed Oil: A 2014 RCT (Cho et al.) in 76 men found 400 mg/day for 24 weeks led to a 40% mean increase in hair count vs placebo [2].',
          'Ashwagandha: A popular adaptogen that may help manage stress levels. Research suggests it can support relaxation and overall wellbeing. Since stress is a known factor in hair changes, managing stress is an important part of any hair care routine. Consult a professional for the right amount.',
          'Probiotics: A 2024 randomized clinical trial in Nutrients of 136 androgenetic alopecia participants found a Lactiplantibacillus plantarum / Lactiplantibacillus pentosus blend maintained hair thickness vs decreasing thickness in placebo over 16 weeks [3]. A separate 2024 RCT in Frontiers in Nutrition found Latilactobacillus curvatus LB-P9 improved hair luster by 19% and tensile strength over 24 weeks [4].',
        ],
        sources: [
          { n: 1, authors: 'Evron E, Juhasz M, et al.', title: 'Natural Hair Supplement: Friend or Foe? Saw Palmetto, a Systematic Review in Alopecia', year: 2020, journal: 'Skin Appendage Disorders', url: 'https://pubmed.ncbi.nlm.nih.gov/33313047/' },
          { n: 2, authors: 'Cho YH, Lee SY, et al.', title: 'Effect of pumpkin seed oil on hair growth in men with androgenetic alopecia: a randomized, double-blind, placebo-controlled trial', year: 2014, journal: 'Evidence-Based Complementary and Alternative Medicine', url: 'https://pubmed.ncbi.nlm.nih.gov/24864154/' },
          { n: 3, authors: 'Garcia-Navarro A, Vasallo-Morillas MI, Navarro-Lopez V, et al.', title: 'Randomized Clinical Trial to Evaluate the Effect of Probiotic Intake on Androgenic Alopecia', year: 2024, journal: 'Nutrients (MDPI)', url: 'https://pubmed.ncbi.nlm.nih.gov/39275216/' },
          { n: 4, authors: 'Park S, et al.', title: 'Efficacy and safety of Latilactobacillus curvatus LB-P9 on hair health: a randomized, double-blind, placebo-controlled clinical trial', year: 2024, journal: 'Frontiers in Nutrition', url: 'https://pubmed.ncbi.nlm.nih.gov/39606574/' },
        ],
      },
    ],
  },
  {
    icon: FlaskConical,
    label: 'Science-Backed Tips',
    intro: 'These tips are grounded in peer-reviewed research and hair care science. Implement them consistently for the best results.',
    sections: [
      {
        title: 'Washing & Cleansing',
        content: [
          'Wash your hair 2-3 times per week for normal hair. Over-washing strips natural oils; under-washing leads to buildup that can clog follicles. Oily scalps may need daily washing.',
          'Use lukewarm water, not hot. Hot water opens the hair cuticle excessively, making hair more prone to damage and frizz. Finish with a cool rinse to seal the cuticle and add shine.',
          'Focus shampoo on the scalp, not the lengths. The scalp is where oil and buildup accumulate. The shampoo that runs down during rinsing is sufficient for the lengths.',
          'Double cleanse if using heavy styling products: first wash removes product buildup, second wash actually cleans the scalp.',
          'Consider your water quality: a 2014 study in International Journal of Trichology confirmed that hard water can cause measurable hair damage, including increased surface roughness [1]. A shower filter can remove chlorine, heavy metals, and excess minerals.',
        ],
        sources: [
          { n: 1, authors: 'Luqman MW, Hassan Ramzan M, et al.', title: 'Effects of hard water on hair', year: 2014, journal: 'International Journal of Trichology', url: 'https://pubmed.ncbi.nlm.nih.gov/24574692/' },
        ],
      },
      {
        title: 'Drying & Styling',
        content: [
          'Pat hair dry with a microfiber towel instead of rubbing with a regular towel. Traditional terry cloth towels create friction that damages the cuticle and causes frizz.',
          'Air drying is gentlest, but if using a blow dryer, use the lowest heat setting that is effective. High heat (above 150°C/300°F) damages the protein structure of hair.',
          'Never brush wet hair with a regular brush — use a wide-tooth comb or a flexible detangling brush. Wet hair can stretch ~30% beyond its original length before breaking, making it especially vulnerable to snapping [1].',
          'Apply styling products to damp (not soaking wet) hair for better distribution and hold.',
          'Choose matte-finish products over glossy gels for thin hair. Matte clays and pastes add texture and volume, while gels and shine serums weigh hair down and make the scalp more visible.',
        ],
        sources: [
          { n: 1, authors: 'Sinclair RD', title: 'Healthy Hair: What Is it?', year: 2007, journal: 'Journal of Investigative Dermatology Symposium Proceedings', url: 'https://www.jidsponline.org/article/S0022-202X(15)52655-9/fulltext' },
        ],
      },
      {
        title: 'Sleep & Recovery',
        content: [
          'Sleep on a silk or satin pillowcase. Cotton creates friction that can damage hair and cause frizz; silk fibers have a lower friction coefficient than cotton, though peer-reviewed quantification varies.',
          'Avoid sleeping with wet hair — it increases the risk of fungal infections on the scalp and causes hygral fatigue, weakening the hair shaft.',
          'Growth hormone release peaks during deep sleep (stages 3 and 4 of NREM). Research has shown that core circadian clock genes including BMAL1 are involved in regulating the hair follicle cycle [1].',
          'A 2025 study in Chronobiology International found that being an evening chronotype ("night owl") was an independent risk factor for androgenetic alopecia in young adults, with disrupted clock-gene expression and shifted sleep-wake patterns implicated [2].',
          'If you have longer hair, use a loose silk scrunchie or braid to prevent tangling and breakage while sleeping.',
        ],
        sources: [
          { n: 1, authors: 'Lin KK, Kumar V, Geyfman M, et al.', title: 'Circadian Clock Genes Contribute to the Regulation of Hair Follicle Cycling', year: 2009, journal: 'PLOS Genetics', url: 'https://pubmed.ncbi.nlm.nih.gov/19629164/' },
          { n: 2, authors: 'Wu Q, Li M, Xiong Y, et al.', title: 'Association between sleep patterns, circadian rhythms, and hair loss in young adults', year: 2025, journal: 'Chronobiology International', url: 'https://pubmed.ncbi.nlm.nih.gov/40844134/' },
        ],
      },
      {
        title: 'Scalp Care',
        content: [
          'A healthy scalp has a pH between 4.5 and 5.5 (slightly acidic). Products that disrupt this can lead to dryness, irritation, and impaired barrier function. Your scalp hosts a balance of bacteria and fungi — maintaining this microbial balance is key.',
          'Exfoliate your scalp once a week to remove dead skin cells and product buildup. Use a gentle scalp scrub with salicylic acid (BHA) or a scalp brush.',
          'Protect your scalp from UV exposure. Prolonged sun exposure can cause hair damage and may worsen scalp irritation [1]. Wear a hat or use UV-protective scalp spray when outdoors for extended periods.',
          'If you live in a polluted area, consider using a clarifying shampoo weekly to remove environmental deposits from hair and scalp.',
          'If you notice persistent itching, flaking, redness, or tenderness, talk to a hair care professional. Many common scalp issues respond well to over-the-counter products, and a professional can suggest the best approach for your situation.',
        ],
        sources: [
          { n: 1, authors: 'American Academy of Dermatology', title: 'Hair styling without damage', year: 2024, journal: 'AAD.org', url: 'https://www.aad.org/public/everyday-care/hair-scalp-care/hair/style-without-damage' },
        ],
      },
      {
        title: 'Maximizing Your Results',
        content: [
          'Consistency beats intensity: Using any hair care product daily for 6 months produces far better results than using it intensively for 2 months and stopping. Make your routine a non-negotiable habit.',
          'Stack complementary products: Combine a scalp-healthy shampoo, a growth-supporting serum, and regular scalp massage for the best results. A multi-pronged approach is more effective than any single product.',
          'Take progress photos monthly from the same angle, lighting, and distance. This is the most reliable way to track changes, as day-to-day differences are too subtle to notice.',
          'Give any new product at least 3-6 months before judging results. Hair grows only about 1.25 cm (0.5 inches) per month [1], so meaningful visual changes take time.',
          'Track your shedding: If you notice increased shedding after starting a new hair care product, this can be normal — your scalp may be adjusting. Give it 4-6 weeks before judging. If it continues, switch products.',
        ],
        sources: [
          { n: 1, authors: 'American Academy of Dermatology', title: 'Do you have hair loss or hair shedding?', year: 2024, journal: 'AAD.org', url: 'https://www.aad.org/public/diseases/hair-loss/insider/shedding' },
        ],
      },
    ],
  },
];

const topicContentExtended: TopicData[] = [
  {
    icon: Scissors,
    label: 'Hairstyles & Grooming',
    intro: 'Strategic haircuts and grooming techniques can make a dramatic difference in how your hair looks — even if you are experiencing thinning. These are professional barber and stylist secrets for maximizing hair appearance.',
    sections: [
      {
        title: 'Best Haircuts for Thinning Hair',
        content: [
          'Textured Crop / French Crop: Short on the sides (fade), longer and textured on top. The forward-falling fringe disguises a receding hairline. Point cutting creates natural texture that makes thin hair look thicker.',
          'Buzz Cut / Crew Cut: When thinning is diffuse, a shorter look (#2-#4 guard) eliminates the contrast between thick and thin areas. A skin fade on the sides draws attention upward and creates a clean, confident look.',
          'Side Part with Volume: For early thinning, a classic side part swept away from the thinner side creates the illusion of fullness. Use lightweight volumizing mousse at the roots, blow dry upward, then set with a matte paste.',
          'Textured Quiff: Longer on top (3-4 inches), blow-dried upward and back with volume at the roots. Works best for Norwood 2-3.',
          'Caesar Cut: Short (1-2 inches), cut to one uniform length with a short horizontal fringe. Named after Julius Caesar who reportedly used it to conceal his receding hairline. Simple, effective, and masculine.',
          'The "Shaved Head" Option: For advanced thinning (Norwood 5+), fully shaving can look dramatically better than clinging to sparse coverage. Moisturize the scalp and apply SPF 30+ daily.',
        ],
      },
      {
        title: 'Hair Fibers & Concealers',
        content: [
          'Keratin Hair Fibers (Toppik, Caboki): Electrostatically-charged keratin fibers cling to existing hair, making it look 2-3x thicker instantly. Best for moderate thinning where some hair remains. Waterproof versions available.',
          'Scalp Micropigmentation (SMP): Tiny dots of pigment tattooed onto the scalp to replicate hair follicles. Creates the appearance of a closely-shaved head or adds density. Latest techniques use zone-specific needle selection and randomized dot distribution for a natural look. Lasts 3-7 years with maintenance. Cost: $2,000-5,000. A 2025 case series of 10 patients in the Journal of Cosmetic Dermatology found a standardized SMP protocol effective for localized alopecia [1].',
          'Color-Matched Concealer Sprays: Products like DermMatch or Color Wow Root Cover Up darken the scalp to reduce contrast with hair.',
          'Modern Hair Systems: Ultra-thin lace or polyurethane bases with hand-tied human hair. Virtually undetectable when professionally fitted. Annual cost: $3,500-4,500 including 4-6 systems, maintenance, and professional servicing.',
        ],
        sources: [
          { n: 1, authors: 'Liu, et al.', title: 'Scalp Micropigmentation Is an Effective Treatment for Localized Alopecia: Technical Analysis and a Series of Ten Case Reports', year: 2025, journal: 'Journal of Cosmetic Dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/40899372/' },
        ],
      },
      {
        title: 'Styling Products for Volume',
        content: [
          'Volumizing Mousse: Apply a golf-ball sized amount to towel-dried roots. Flip your head upside down and blow dry from roots. The alcohol evaporates, leaving polymers that prop up the hair shaft, creating 2-3x volume.',
          'Sea Salt Spray: Creates natural-looking texture and grip. The salt crystals rough up the cuticle, adding grit and body. Limit to 2-3x per week as it can dry hair out.',
          'Matte Clay or Paste: Products with low shine make hair look thicker than glossy gels. Apply a pea-sized amount to dry hair. Look for products with kaolin clay or beeswax.',
          'Dry Shampoo for Volume: Apply dry shampoo at the roots of clean hair — not just greasy hair. The starch particles coat the shaft and create grip and lift. This is a secret weapon for thin hair.',
          'Avoid: Heavy waxes, shine serums, wet-look gels, and anything oil-based. These weigh hair down and make the scalp more visible.',
        ],
      },
      {
        title: 'Daily Grooming Routine for Thin Hair',
        content: [
          'Morning: 1) Apply your preferred scalp serum if using — wait 15-20 min. 2) Style with lightweight volumizing product. 3) Blow dry on medium heat, lifting at roots. 4) Optional: Apply hair fibers to thin areas. 5) Set with flexible-hold hairspray from 12 inches away.',
          'Wash Days (2-3x/week): 1) Pre-wash oil if using. 2) Your preferred scalp-healthy shampoo on scalp only. 3) Lightweight conditioner on mid-lengths and ends only. 4) Cool water final rinse. 5) Gently squeeze with microfiber towel. 6) Volumizing mousse at roots. 7) Blow dry upside-down for maximum lift.',
          'Evening: 1) Apply nighttime topical product. 2) Derma roller on designated nights (1x/week at 1.5mm). 3) Sleep on silk or satin pillowcase.',
          'Weekly: 1) Scalp exfoliation with salicylic acid scrub. 2) Deep conditioning on lengths. 3) Progress photo. 4) Inspect tools and replace as needed.',
        ],
      },
    ],
  },
  {
    icon: SearchCheck,
    label: 'Myths vs Facts',
    intro: 'There is an enormous amount of misinformation about hair loss. The global hair care market is worth over $10 billion — meaning huge financial incentive to sell products that may not work. Here we separate scientific fact from fiction.',
    sections: [
      {
        title: 'Common Myths Debunked',
        content: [
          'MYTH: "Wearing hats causes hair loss." FACT: Hats do NOT cause hair loss. The only exception would be extremely tight hats worn 24/7 causing traction. Hats actually protect your scalp from UV damage.',
          'MYTH: "Hair loss comes from your mother\'s side." FACT: While the androgen receptor gene (AR) is on the X chromosome (from mother), a 2017 PLOS Genetics study by Hagenaars et al. identified 287 independent genetic signals for male pattern baldness across autosomal AND X chromosomes (247 autosomal + 40 X) from both parents [1].',
          'MYTH: "Frequent shampooing causes hair loss." FACT: The hairs in the drain were already in the resting phase and would have fallen out regardless. Infrequent washing can lead to sebum buildup and scalp irritation.',
          'MYTH: "Hair products stop working after a while." FACT: Most hair care products continue to work as long as you use them. Hair changes are progressive and natural — your products may need adjustment over time as your hair evolves.',
          'MYTH: "Cutting hair makes it grow back thicker." FACT: Cutting has zero effect on thickness, growth rate, or color. Freshly cut hair has a blunt tip that can feel coarser, but the follicle determines thickness, not the shaft.',
          'MYTH: "Creatine causes hair loss." FACT: A 2025 12-week randomized controlled trial in the Journal of the International Society of Sports Nutrition found no significant differences in hair growth parameters between creatine and placebo groups in 45 resistance-trained males [2]. Your gym supplements are not to blame.',
        ],
        sources: [
          { n: 1, authors: 'Hagenaars SP, Hill WD, et al.', title: 'Genetic prediction of male pattern baldness', year: 2017, journal: 'PLOS Genetics', url: 'https://pubmed.ncbi.nlm.nih.gov/28196072/' },
          { n: 2, authors: 'Antonio J, Evans C, et al.', title: 'Does creatine cause hair loss? A 12-week randomized controlled trial', year: 2025, journal: 'Journal of the International Society of Sports Nutrition', url: 'https://pubmed.ncbi.nlm.nih.gov/40265319/' },
        ],
      },
      {
        title: 'Product Myths',
        content: [
          'MYTH: "One product can fix everything." FACT: The best approach combines multiple habits — good nutrition, proper hair care products, scalp hygiene, and stress management. No single product is a magic solution.',
          'MYTH: "Start your routine only when hair changes are noticeable." FACT: By the time changes are visually noticeable, you may have already lost a significant amount of density in that area. Early habits are dramatically more effective.',
          'MYTH: "Hair transplants look fake." FACT: Modern hair transplant techniques using individual follicular units of 1-4 hairs are virtually undetectable. The "hair plug" look from the 1980s-90s used larger grafts.',
          'MYTH: "Supplements alone can stop hair loss." FACT: Supplements only help if you are DEFICIENT. For genetic hair changes, supplements alone are not a complete solution. A well-rounded approach including diet, products, and lifestyle habits works best.',
          'MYTH: "Professional services are a permanent fix for hair changes." FACT: Professional services can help improve appearance, but they are not a permanent fix. Ongoing grooming habits matter most for long-term results.',
        ],
      },
      {
        title: 'Lifestyle Myths',
        content: [
          'MYTH: "Stress only causes temporary hair loss." FACT: Acute stress causes temporary shedding, but research suggests chronic stress can also affect follicle regeneration. A 2021 study from Ya-Chieh Hsu\'s lab at Harvard, published in Nature, showed that the stress hormone corticosterone suppresses GAS6 — a key signal needed for hair follicle stem cell activation [1].',
          'MYTH: "You cannot do anything about genetic hair changes." FACT: Good grooming habits, the right products, and a healthy lifestyle can make a real difference in how your hair looks.',
          'MYTH: "Hair products cause hair loss." FACT: No commercially available shampoo or styling product causes hair loss. However, excessive bleaching, chemical relaxers, or tight braiding can cause traction-related hair loss over time.',
          'MYTH: "Cold showers promote hair growth." FACT: Cold water seals the hair cuticle (improving shine) but has no documented effect on the follicle or growth rate.',
          'MYTH: "Exercise causes hair loss." FACT: Regular moderate exercise actually improves hormonal balance over time. Brief post-workout hormone changes fall within normal ranges and do not cause noticeable hair changes.',
        ],
        sources: [
          { n: 1, authors: 'Choi S, Zhang B, Ma S, et al. (Hsu Lab, Harvard)', title: 'Corticosterone inhibits GAS6 to govern hair follicle stem-cell quiescence', year: 2021, journal: 'Nature', url: 'https://pubmed.ncbi.nlm.nih.gov/33790465/' },
        ],
      },
      {
        title: 'Quick Facts You Should Know',
        content: [
          'According to the American Hair Loss Association, by age 35 about two-thirds of men experience noticeable hair loss, and by age 50 approximately 85% have significantly thinning hair [1]. You are not alone.',
          'Significant density loss often occurs before thinning becomes visually obvious to others. Early action and good habits can help preserve more hair.',
          'Hair grows approximately 1.25 cm (0.5 inches) per month [2]. This is why any new routine takes at least 3-6 months to show visible results.',
          'Hair changes are gradual and natural. The sooner you build good grooming habits, the better your hair will look over time. Consistency is key.',
          'Always look for peer-reviewed research, not marketing claims or influencer testimonials. If a product sounds too good to be true, it almost certainly is.',
        ],
        sources: [
          { n: 1, authors: 'American Hair Loss Association', title: "Men's Hair Loss", year: 2024, journal: 'americanhairloss.org', url: 'https://www.americanhairloss.org/mens-hair-loss/' },
          { n: 2, authors: 'American Academy of Dermatology', title: 'Do you have hair loss or hair shedding?', year: 2024, journal: 'AAD.org', url: 'https://www.aad.org/public/diseases/hair-loss/insider/shedding' },
        ],
      },
    ],
  },
  {
    icon: Apple,
    label: 'Nutrition & Diet',
    intro: 'What you eat directly impacts your hair health. Hair follicles are among the most metabolically active cells in your body, requiring a constant supply of nutrients. A 2025 systematic review (see Macronutrients section below) confirmed specific nutrients are critical for hair growth.',
    sections: [
      {
        title: 'Essential Macronutrients',
        content: [
          'Protein: Hair is 95% keratin. Your body needs adequate amino acids (especially cysteine, methionine, and lysine) to synthesize it. Top sources: eggs (all essential amino acids + biotin), salmon (protein + omega-3s), chicken, Greek yogurt, lentils, quinoa. Not getting enough protein can affect hair growth.',
          'Healthy Fats: Omega-3 (EPA/DHA) reduce scalp inflammation. A 2015 study of 120 women in the Journal of Cosmetic Dermatology found a combined omega-3/6/antioxidant supplement led to about 89.9% of participants reporting reduced hair loss after 6 months [1]. Sources: fatty fish (2-3 servings/week), walnuts, flaxseeds, chia seeds, avocados.',
          'Complex Carbohydrates: Follicles need energy for the growth phase. Very low-carb diets can increase stress on the body, potentially affecting hair. Choose whole grains, sweet potatoes, oats. Avoid crash diets — rapid weight loss is a common trigger for temporary shedding.',
          'Overall: A 2025 systematic review of 17 studies (61,332 participants) in Nutrition and Health found vitamin D and iron in particular to be inversely related to hair thinning [2].',
        ],
        sources: [
          { n: 1, authors: "Le Floc'h C, Cheniti A, et al.", title: 'Effect of a nutritional supplement on hair loss in women', year: 2015, journal: 'Journal of Cosmetic Dermatology', url: 'https://onlinelibrary.wiley.com/doi/abs/10.1111/jocd.12127' },
          { n: 2, authors: 'Gomes N, Silva N, Teixeira B', title: 'Assessing the relationship between dietary factors and hair health: A systematic review', year: 2025, journal: 'Nutrition and Health', url: 'https://pubmed.ncbi.nlm.nih.gov/40836838/' },
        ],
      },
      {
        title: 'Critical Micronutrients',
        content: [
          'Iron: One of the most common nutritional gaps linked to hair changes. Low iron levels are associated with shedding — consult a professional if you think you may be low. Best sources: red meat, dark leafy greens, legumes. Take with vitamin C to boost absorption. Avoid taking with calcium, tea, or coffee.',
          'Zinc: Supports follicle function and cell repair. Research has found lower zinc in people with various types of hair changes. Top sources: oysters, beef, pumpkin seeds, chickpeas. Consult a professional for the right amount — excess can cause other imbalances.',
          'Vitamin D: A 2025 systematic review of 17 studies and 61,332 participants found vitamin D inversely related to hair thinning [1]. Many people are deficient — consult a professional for the right amount. Take with fat for absorption.',
          'Biotin (B7): Essential for keratin infrastructure. True deficiency is rare in varied diets. Consult a professional for the right amount if you think you may be deficient. Note: biotin can interfere with lab tests — stop supplementation 72 hours before any blood work.',
          'Vitamin C: Supports collagen production and helps your body absorb iron. Top sources: red bell peppers, citrus fruits, strawberries, kiwi. A diet rich in fruits and vegetables usually provides plenty.',
        ],
        sources: [
          { n: 1, authors: 'Gomes N, Silva N, Teixeira B', title: 'Assessing the relationship between dietary factors and hair health: A systematic review', year: 2025, journal: 'Nutrition and Health', url: 'https://pubmed.ncbi.nlm.nih.gov/40836838/' },
        ],
      },
      {
        title: 'Hair-Boosting Foods',
        content: [
          'Eggs: One of the best foods for hair — protein, biotin (33% DV per egg), zinc, selenium, iron. The yolk provides vitamin D and omega-3s. Eat 2-3 daily, cooked (raw whites block biotin).',
          'Salmon & Fatty Fish: Rich in omega-3s, vitamin D, protein, B vitamins. Aim for 2-3 servings per week. Choose low-mercury options: salmon, sardines, trout, light tuna. Avoid high-mercury fish: swordfish, king mackerel, tilefish.',
          'Spinach & Dark Leafy Greens: Packed with iron, folate, vitamin A, vitamin C. Vitamin A helps skin glands produce sebum. Note: too much vitamin A from supplements can actually worsen hair — get it from food instead.',
          'Berries: Loaded with antioxidants and vitamin C. Anthocyanins improve blood circulation to the scalp. Eat 1 cup daily.',
          'Nuts & Seeds: Walnuts (omega-3, biotin, vitamin E), Brazil nuts (selenium — just 2 provide 100% DV), pumpkin seeds (zinc), sunflower seeds (vitamin E), flaxseeds (omega-3). A daily handful provides broad spectrum hair-supporting nutrients.',
          'Sweet Potatoes: Excellent source of beta-carotene (safe plant-based vitamin A). One medium sweet potato provides over 100% of daily vitamin A needs.',
        ],
      },
      {
        title: 'Foods & Habits to Avoid',
        content: [
          'Excess Sugar: A 2024 study in Frontiers in Nutrition (Bazmi et al., N=9,647 Fasa Adult Cohort) linked a higher dietary inflammatory index (DII) with androgenetic alopecia [1]. Limit added sugars for overall wellness.',
          'Crash Diets: Eating very low calories deprives follicles of nutrients and can trigger temporary shedding within 2-3 months. Recovery takes 6-12 months.',
          'Excessive Alcohol: Depletes zinc, folic acid, and B vitamins. Increases estrogen in men, disrupts sleep, and causes dehydration. Limit to 1-2 drinks/day with alcohol-free days.',
          'Sugar-Sweetened Beverages: Associated with higher risk of hair changes in studies. Replace with water, green tea (rich in antioxidants), or bone broth.',
          'Excessive Vitamin A Supplements: Too much supplemental vitamin A can contribute to hair loss. This only applies to supplements and animal sources — beta-carotene from plants is safe.',
        ],
        sources: [
          { n: 1, authors: 'Bazmi S, Sepehrinia M, et al.', title: 'Androgenic alopecia is associated with higher dietary inflammatory index and lower antioxidant index scores', year: 2024, journal: 'Frontiers in Nutrition', url: 'https://pubmed.ncbi.nlm.nih.gov/39211830/' },
        ],
      },
      {
        title: 'The Mediterranean Diet & Gut Health',
        content: [
          'A 2018 case-control study (Fortes et al., 104 AGA + 108 controls, total 212 males) found the Mediterranean diet significantly protective: raw vegetables 3+ times/week reduced pattern hair change odds by 57% (OR 0.43), and regular fresh herbs reduced odds by 56% (OR 0.44) [1]. Soy-based foods and cruciferous vegetables may also reduce risk via isoflavone content.',
          'Gut-Hair Axis: A healthy gut microbiome improves nutrient absorption and reduces systemic inflammation. A 2025 study in MDPI Cosmetics built a Random Forest model using gut microbiome data that distinguished people with alopecia areata from healthy controls with 92% accuracy [2].',
          'Eat probiotic-rich foods daily: yogurt, kefir, sauerkraut, kimchi, kombucha, miso. Research suggests certain probiotic strains from fermented foods may support hair appearance and strength over time.',
          'Eat prebiotic fiber to feed good bacteria: garlic, onions, bananas, asparagus, oats.',
          'Bone Broth: Rich in collagen, glycine, proline — amino acids supporting connective tissue around follicles. Contains bioavailable minerals. Drink 1-2 cups daily.',
          'Hydration: Hair is 25% water. Dehydration makes hair brittle and slows growth. Aim for 2.5-3 liters daily. Signs of hair dehydration: static, brittleness, dullness, slower growth.',
        ],
        sources: [
          { n: 1, authors: 'Fortes C, Mastroeni S, et al.', title: 'Mediterranean diet: fresh herbs and fresh vegetables decrease the risk of Androgenetic Alopecia in males', year: 2018, journal: 'Archives of Dermatological Research', url: 'https://pubmed.ncbi.nlm.nih.gov/29181579/' },
          { n: 2, title: 'Decoding Gut Microbiome Dysbiosis as a Non-Invasive Diagnostic Biomarker for Alopecia Areata', year: 2025, journal: 'Cosmetics (MDPI)', url: 'https://www.mdpi.com/2079-9284/12/6/274' },
        ],
      },
    ],
  },
];

const newTopicContent: TopicData[] = [
  {
    icon: Droplets,
    label: 'Scalp Microbiome & Gut Health',
    intro: 'The scalp microbiome and gut-hair axis are rapidly emerging frontiers in hair loss research. Your scalp hosts trillions of microorganisms that directly influence follicle health, and your gut bacteria affect hair through systemic inflammation and nutrient absorption.',
    sections: [
      {
        title: 'Your Scalp Microbiome',
        content: [
          'Your scalp hosts a complex ecosystem of bacteria and fungi that live in balance. These organisms help maintain a healthy scalp environment by keeping each other in check and supporting the scalp\'s natural pH of 4.5-5.5.',
          'When this balance is healthy, beneficial organisms help process natural oils into compounds that protect your scalp. When the balance is disrupted, certain organisms can overgrow and cause irritation or flaking.',
          'A 2025 paper in mSystems described a "MiSCH" diagnostic index that uses multi-kingdom 16S rRNA + ITS1 sequencing and machine learning to assess scalp microbial health [1].',
          'Research shows that a balanced scalp microbiome is linked to better hair health, while imbalances — such as overgrowth of certain fungi — can irritate the scalp and affect hair quality.',
        ],
        sources: [
          { n: 1, authors: 'Wang X, Li F, Sun Y, Meng F, Song Y, Su X', title: 'Microbial dysbiosis and its diagnostic potential in androgenetic alopecia: insights from multi-kingdom sequencing and machine learning', year: 2025, journal: 'mSystems', url: 'https://pubmed.ncbi.nlm.nih.gov/40434156/' },
        ],
      },
      {
        title: 'Scalp Barrier Function',
        content: [
          'When the scalp barrier is compromised, reduced microbial diversity can lead to: overgrowth of irritating organisms, increased inflammation affecting follicles, and increased moisture loss from the scalp.',
          'Products that disrupt the pH (alkaline shampoos, harsh detergents) can cause dysbiosis. The "scalp-first" approach — treating the scalp like facial skin with barrier support and microbiome-friendly cleansing — is the dominant professional hair care trend for 2025-2026.',
          'Key scalp-friendly ingredients: niacinamide (barrier strengthening), salicylic acid (gentle exfoliation), hyaluronic acid (hydration without oil), zinc pyrithione (antifungal balance).',
          'A 2025 study in the International Journal of Cosmetic Science found that caffeine and adenosine topicals affect both the scalp microbiome and lipidome, suggesting even common hair products alter the microbial ecosystem [1].',
        ],
        sources: [
          { n: 1, authors: 'Li, et al.', title: 'The effects of caffeine and adenosine on the microbiome and lipidome of the scalp', year: 2025, journal: 'International Journal of Cosmetic Science', url: 'https://pubmed.ncbi.nlm.nih.gov/40395216/' },
        ],
      },
      {
        title: 'The Gut-Hair Axis',
        content: [
          'The gut-hair connection works through multiple pathways: gut health affects overall inflammation levels, your immune system influences follicle health, and the nutrients produced by gut bacteria circulate throughout your body including your scalp.',
          'A 2025 study in MDPI Cosmetics built a Random Forest model from gut microbiome data that distinguished people with alopecia areata from healthy controls with 92% accuracy, suggesting a strong gut-hair connection [1].',
          'People experiencing patchy hair loss often have a different balance of gut bacteria compared to those without hair loss, suggesting that gut health plays a role in hair condition [1].',
          'This is an active area of research and findings continue to evolve.',
        ],
        sources: [
          { n: 1, title: 'Decoding Gut Microbiome Dysbiosis as a Non-Invasive Diagnostic Biomarker for Alopecia Areata', year: 2025, journal: 'Cosmetics (MDPI)', url: 'https://www.mdpi.com/2079-9284/12/6/274' },
        ],
      },
      {
        title: 'Probiotic Research for Hair',
        content: [
          'Several studies have explored probiotics for hair health. A 2024 randomized clinical trial in Nutrients of 136 androgenetic alopecia participants found a Lactiplantibacillus plantarum / L. pentosus blend maintained hair thickness over 16 weeks vs decreasing thickness in placebo [1].',
          'A 2024 study in Frontiers in Nutrition on Latilactobacillus curvatus LB-P9 (a fermented-food-derived probiotic) found a 19% improvement in hair luster and a +10.27 gf/mm² increase in tensile strength over 24 weeks, with no serious reported side effects [2].',
          'This is an emerging area of research. Eating probiotic-rich foods daily (yogurt, kefir, sauerkraut, kimchi, kombucha) is a simple way to support your gut-hair connection.',
          'Best current practice: Eat probiotic-rich foods daily (yogurt, kefir, sauerkraut, kimchi, kombucha). Support with prebiotic fiber (garlic, onions, bananas, asparagus, oats) to feed beneficial bacteria.',
        ],
        sources: [
          { n: 1, authors: 'Garcia-Navarro A, Vasallo-Morillas MI, Navarro-Lopez V, et al.', title: 'Randomized Clinical Trial to Evaluate the Effect of Probiotic Intake on Androgenic Alopecia', year: 2024, journal: 'Nutrients (MDPI)', url: 'https://pubmed.ncbi.nlm.nih.gov/39275216/' },
          { n: 2, authors: 'Park S, et al.', title: 'Efficacy and safety of Latilactobacillus curvatus LB-P9 on hair health: a randomized, double-blind, placebo-controlled clinical trial', year: 2024, journal: 'Frontiers in Nutrition', url: 'https://pubmed.ncbi.nlm.nih.gov/39606574/' },
        ],
      },
    ],
  },
  {
    icon: Brain,
    label: 'Mental Health & Hair',
    intro: 'There is a strong connection between mental wellbeing and hair health. Stress and low mood can contribute to hair changes, and hair changes can affect confidence and self-image. Understanding this connection is important for a well-rounded hair care approach.',
    sections: [
      {
        title: 'The Psychological Impact of Hair Loss',
        content: [
          'Research consistently describes a two-way connection: stress and low mood can worsen hair changes, AND hair changes can increase stress and affect confidence [1].',
          'Both men and women report feeling frustrated, embarrassed, or self-conscious about hair changes. Women often experience greater social pressure around hair appearance than men.',
          'People with gradual thinning have been found in studies to be psychologically affected, often showing higher anxiety and mild depressive symptoms [1].',
          'The unpredictability of conditions like patchy hair loss — where patches can appear and resolve without warning — can create chronic anxiety about recurrence.',
        ],
        sources: [
          { n: 1, authors: 'Hunt N, McHale S', title: 'The psychological impact of alopecia', year: 2005, journal: 'BMJ', url: 'https://pubmed.ncbi.nlm.nih.gov/16239692/' },
        ],
      },
      {
        title: 'How Stress Damages Hair — The Biology',
        content: [
          'Stress raises your body\'s stress hormone levels, which can disrupt the normal hair growth cycle. Over time, elevated stress hormones may push more follicles into the resting phase, leading to increased shedding.',
          'Chronic stress can also trigger inflammation in the scalp, which may weaken hair follicles and slow down new growth.',
          'Anxiety and low mood can affect overall wellness, which in turn may show up in hair quality and volume over time.',
          'A 2021 study from Ya-Chieh Hsu\'s lab at Harvard, published in Nature, found that the stress hormone corticosterone suppresses GAS6 — a key signal needed for hair follicle stem cell activation [1]. Managing stress is not just good for your mood; the biology suggests it is good for your hair too.',
        ],
        sources: [
          { n: 1, authors: 'Choi S, Zhang B, Ma S, et al. (Hsu Lab, Harvard)', title: 'Corticosterone inhibits GAS6 to govern hair follicle stem-cell quiescence', year: 2021, journal: 'Nature', url: 'https://pubmed.ncbi.nlm.nih.gov/33790465/' },
        ],
      },
      {
        title: 'When to Talk to a Professional',
        content: [
          'If you notice sudden or unusual hair changes, it is worth speaking with a professional. Many everyday factors — including new products, diet changes, and stress — can affect hair appearance.',
          'A barber, stylist, or hair care professional can help identify what might be going on and suggest the best approach for your situation.',
          'Most temporary hair changes improve on their own once the underlying factor is addressed. Being proactive about your hair care routine helps.',
        ],
      },
      {
        title: 'Related Conditions',
        content: [
          'Hair-pulling habits (trichotillomania): A pattern of repetitive hair pulling. A 2022 meta-analysis in the Journal of Psychiatric Research found a prevalence of about 1.14% (95% CI 0.66-1.96%); Mayo Clinic similarly cites approximately 1-2% [1] [2]. Habit-reversal training is the most effective behavioral approach.',
          'Excessive appearance concerns: Persistent worries about perceived hair changes that may lead to excessive checking, mirror avoidance, or spending on unnecessary products. Talking to a counselor can help.',
          'Stress-related hair concerns: Worries about hair that may be amplified by stress and anxiety. Managing stress and seeking emotional support can make a real difference.',
          'Stress-related shedding: Often appears 2-4 months after a stressful event (bereavement, job loss, relationship breakdown, financial crisis, surgery, illness). Usually reversible within 6-12 months once the stressor resolves.',
        ],
        sources: [
          { n: 1, authors: 'Thomson H, et al.', title: 'Prevalence and gender distribution of trichotillomania: A systematic review and meta-analysis', year: 2022, journal: 'Journal of Psychiatric Research', url: 'https://pubmed.ncbi.nlm.nih.gov/35802953/' },
          { n: 2, authors: 'Mayo Clinic', title: 'Trichotillomania (hair-pulling disorder)', year: 2024, journal: 'mayoclinic.org', url: 'https://www.mayoclinic.org/diseases-conditions/trichotillomania/symptoms-causes/syc-20355188' },
        ],
      },
      {
        title: 'Evidence-Based Coping Strategies',
        content: [
          'Mindfulness and meditation: Shown to improve quality of life, reduce anxiety, and lower stress levels. Regular mindfulness practice can help you manage the emotional side of hair changes.',
          'Talking to a counselor: Professionals can help you recognize and change negative thinking patterns about appearance, and address social anxiety related to hair changes.',
          'Physical Exercise: Regular aerobic exercise (30 minutes, 5x/week) reduces stress hormones and improves circulation. Both mood and hair benefit from staying active.',
          'Community and Social Support: Support groups (both in-person and online) contribute significantly to coping. Hair salons have been identified as informal support networks providing emotional validation.',
          'Integrated Multidisciplinary Care: The recommended model combines professional hair care + emotional support + lifestyle modifications + stress management. Routine awareness of emotional wellbeing in people experiencing hair loss is now recommended as standard practice.',
          'Self-compassion: Hair loss does not define your worth. Embracing your appearance, whether through products, styling, or acceptance, is a valid and healthy choice.',
        ],
      },
    ],
  },
  {
    icon: Sun,
    label: 'Environmental & Lifestyle',
    intro: 'Your environment — from the water you shower with to the air you breathe to the light from your screens — directly affects your hair health. Here is what the latest research reveals about environmental and lifestyle factors.',
    sections: [
      {
        title: 'Water Quality & Hair',
        content: [
          'Hard water (high mineral content) can cause measurable hair damage. A 2016 study in the International Journal of Trichology found calcium deposition of 0.804% on hair exposed to hard water vs 0.26% on hair in distilled water, and magnesium deposition of 0.34% vs 0.078% [1].',
          'The harder the water, the greater the effect: very hard water has been associated with reduced hair strength and rougher texture [1].',
          'Chlorine in tap water strips natural oils from hair and scalp, leaving hair dry, brittle, and more prone to breakage. It can also irritate the scalp and disrupt the microbiome.',
          'Solution: A shower filter removes chlorine, heavy metals, and excess minerals. Users often report less hair loss, more gloss, and better manageability after 2+ months of use.',
        ],
        sources: [
          { n: 1, authors: 'Srinivasan G, Srinivas CR, Mathew AC, Duraiswami D', title: 'Effect of topical application of hard water in weakening of hair in men', year: 2016, journal: 'International Journal of Trichology', url: 'https://pubmed.ncbi.nlm.nih.gov/27654734/' },
        ],
      },
      {
        title: 'UV Radiation & Sun Exposure',
        content: [
          'UV radiation can cause protein degradation in hair, color changes, and cuticle damage. Prolonged sun exposure is also a known cause of scalp irritation and sunburn [1].',
          'The scalp is one of the most sun-exposed areas of the body, yet it is rarely protected. Sunburn on the scalp can damage follicles and worsen irritation.',
          'Protection: Wear a hat or use UV-protective scalp spray (SPF 30+). This is especially important for those with thinning hair or shaved heads. UV-protective sprays are available specifically for the scalp and hair.',
        ],
        sources: [
          { n: 1, authors: 'American Academy of Dermatology', title: 'Skin cancer types and prevention', year: 2024, journal: 'AAD.org', url: 'https://www.aad.org/public/diseases/skin-cancer' },
        ],
      },
      {
        title: 'Pollution & Blue Light',
        content: [
          'Particulate matter (PM) pollution and other environmental factors can deposit on hair and scalp. Using a clarifying or chelating shampoo weekly can help remove these deposits.',
          'A 2024 in-vitro study in Lasers in Medical Science found that 457nm blue light reduced viability and proliferation of human hair follicle stem cells and dermal papilla cells [1]. Prolonged intense exposure near the scalp may warrant caution.',
          'However, controlled blue-LED devices designed for hair care have shown different results. A 2021 study in Lasers in Medical Science found that a 417nm blue LED device used twice weekly for 10 weeks led to increased hair density or shaft width in about 90% of androgenetic alopecia patients studied [2].',
          'For daily life: blue light from screens at normal distances is unlikely to cause significant hair damage. The studied effects involve more intense exposure than typical screen use.',
        ],
        sources: [
          { n: 1, title: 'Blue light inhibits cell viability and proliferation in hair follicle stem cells and dermal papilla cells', year: 2024, journal: 'Lasers in Medical Science', url: 'https://pubmed.ncbi.nlm.nih.gov/39377836/' },
          { n: 2, title: 'Blue light-emitting diodes in hair regrowth: the first prospective study', year: 2021, journal: 'Lasers in Medical Science', url: 'https://link.springer.com/article/10.1007/s10103-021-03327-9' },
        ],
      },
      {
        title: 'Sleep & Circadian Rhythms',
        content: [
          'A 2025 study in Chronobiology International found that being an evening chronotype ("night owl") was an independent risk factor for androgenetic alopecia in young adults, with disrupted circadian clock-gene expression and shifted sleep-wake patterns implicated [1].',
          'Your body\'s internal clock influences hair growth cycles. Foundational research in 2009 by Lin et al. (PLOS Genetics) showed that core circadian clock genes including BMAL1 contribute to regulation of the hair follicle cycle [2].',
          'Melatonin — the hormone that helps regulate sleep — has also been studied in the context of hair health, including in topical form for androgenetic alopecia [3].',
          'Sleep deprivation can affect stress hormones and overall recovery. Key repair and growth processes happen during deep sleep, so consistent rest is important.',
          'Practical advice: Aim for 7-9 hours of consistent sleep. Go to bed and wake at the same time daily. Limit screen time before bed (blue light suppresses melatonin).',
        ],
        sources: [
          { n: 1, authors: 'Wu Q, Li M, Xiong Y, et al.', title: 'Association between sleep patterns, circadian rhythms, and hair loss in young adults', year: 2025, journal: 'Chronobiology International', url: 'https://pubmed.ncbi.nlm.nih.gov/40844134/' },
          { n: 2, authors: 'Lin KK, Kumar V, Geyfman M, et al.', title: 'Circadian Clock Genes Contribute to the Regulation of Hair Follicle Cycling', year: 2009, journal: 'PLOS Genetics', url: 'https://pubmed.ncbi.nlm.nih.gov/19629164/' },
          { n: 3, authors: 'Fischer TW, Trueb RM, et al.', title: 'Topical Melatonin for Treatment of Androgenetic Alopecia', year: 2012, journal: 'International Journal of Trichology', url: 'https://pubmed.ncbi.nlm.nih.gov/23766606/' },
        ],
      },
      {
        title: 'Exercise & Physical Activity',
        content: [
          'Aerobic exercise improves blood flow to the scalp and supports healthy hormone levels. A 2021 study in the Journal of Cosmetic Dermatology examined the relationship between exercise and severity of androgenic alopecia in a data set collected in 2020 [1].',
          'A 2025 12-week randomized controlled trial in the Journal of the International Society of Sports Nutrition (Antonio et al., N=45 resistance-trained males) found NO significant differences in hair growth parameters between creatine and placebo groups, debunking the creatine-hair loss myth [2].',
          'Resistance training temporarily affects hormone levels after a workout, but regular exercise improves overall balance and lowers stress hormones over time.',
          'Excessive endurance exercise (overtraining) without adequate nutrition is a risk factor for temporary shedding due to elevated stress hormones and caloric deficit.',
          'Optimal protocol for hair health: Moderate exercise 3-5 times per week, 45-60 minutes per session. Mix cardio and resistance training. Ensure adequate protein and caloric intake to support both exercise recovery and hair growth.',
        ],
        sources: [
          { n: 1, title: 'Relationship between the exercise and severity of androgenic alopecia', year: 2021, journal: 'Journal of Cosmetic Dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/34382589/' },
          { n: 2, authors: 'Antonio J, Evans C, et al.', title: 'Does creatine cause hair loss? A 12-week randomized controlled trial', year: 2025, journal: 'Journal of the International Society of Sports Nutrition', url: 'https://pubmed.ncbi.nlm.nih.gov/40265319/' },
        ],
      },
    ],
  },
];

const allTopicContent = [...topicContent, ...topicContentExtended, ...newTopicContent];

export const CoachScreen = ({ onNewScan, scans }: CoachScreenProps) => {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const topicScrollRef = useRef<HTMLDivElement>(null);
  const closeTopic = useCallback(() => setSelectedTopic(null), []);
  useEdgeSwipeBack(closeTopic, selectedTopic !== null);

  // Reset scroll when entering topic detail
  useEffect(() => {
    if (selectedTopic !== null && topicScrollRef.current) {
      topicScrollRef.current.scrollTop = 0;
    }
  }, [selectedTopic]);

  // Topics are previewable for everyone so Apple reviewers (and curious users)
  // can reach the medical citations without a scan — required by Guideline 1.4.1.
  // Full guides + personalized insights unlock after the first hairline scan.
  const hasScans = scans.length > 0;

  function calculateTrend(scans: Scan[]): 'up' | 'down' | 'stable' {
    if (scans.length < 2) return 'stable';
    const recent = scans.slice(0, Math.min(5, scans.length));
    const older = scans.slice(Math.min(5, scans.length));
    if (older.length === 0) return 'stable';
    const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / older.length;
    if (recentAvg > olderAvg + 0.5) return 'up';
    if (recentAvg < olderAvg - 0.5) return 'down';
    return 'stable';
  }

  function getConsistency(scans: Scan[]): string {
    if (scans.length < 3) return 'N/A';
    const scores = scans.map(s => s.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < 0.5) return 'Very Consistent';
    if (stdDev < 1) return 'Consistent';
    if (stdDev < 2) return 'Variable';
    return 'Highly Variable';
  }

  // Topic detail view
  if (selectedTopic !== null) {
    const topic = allTopicContent[selectedTopic];
    const TopicIcon = topic.icon;
    // Free preview: first section (with its citations) is always visible so the
    // medical sourcing is reachable; remaining sections unlock after a scan.
    const visibleSections = hasScans ? topic.sections : topic.sections.slice(0, 1);
    const lockedSections = hasScans ? [] : topic.sections.slice(1);
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="safe-area-top flex-shrink-0" />
        {/* Topic header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 min-h-[44px] py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Coach</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <TopicIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{topic.label}</h1>
            </div>
          </div>
        </div>

        <div ref={topicScrollRef} className="flex-1 overflow-y-auto px-5 space-y-5 pb-6">
          {/* Intro */}
          <p className="text-sm text-muted-foreground leading-relaxed">{topic.intro}</p>

          {/* Entertainment disclaimer */}
          <div className="rounded-xl bg-card border border-border/50 p-3">
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-center">
              For entertainment and general information only. Not medical advice. Consult a qualified healthcare professional before making any health decisions.
            </p>
          </div>

          {/* Sections */}
          {visibleSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 bg-primary/5">
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              </div>
              <div className="p-4 space-y-3">
                {section.content.map((paragraph, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2 flex-shrink-0" />
                    <p className="text-xs text-foreground/80 leading-relaxed">{renderRichText(paragraph, section.sources)}</p>
                  </div>
                ))}
                <SourcesBlock sources={section.sources} />
              </div>
            </div>
          ))}

          {/* Locked sections — unlock with a scan */}
          {lockedSections.length > 0 && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">
                Scan to unlock the full guide
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
                {lockedSections.length} more {lockedSections.length === 1 ? 'section' : 'sections'} in this guide, plus personalized coaching from your hairline scan. Every section is backed by peer-reviewed citations.
              </p>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed mb-4">
                {lockedSections.map((s) => s.title).join('  ·  ')}
              </p>
              <button
                onClick={onNewScan}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ScanLine className="w-4 h-4" />
                Scan to unlock
              </button>
            </div>
          )}

          {/* Spacer for bottom nav */}
          <div className="h-24 flex-shrink-0" />
        </div>
      </div>
    );
  }

  const sortedScans = [...scans].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latestScan = hasScans ? sortedScans[0] : null;
  const averageScore = hasScans
    ? (sortedScans.reduce((sum, s) => sum + s.score, 0) / sortedScans.length).toFixed(1)
    : '0';
  const bestScore = hasScans ? Math.max(...sortedScans.map(s => s.score)).toFixed(1) : '0';
  const trend = calculateTrend(sortedScans);
  const consistency = getConsistency(sortedScans);

  const scansWithMetrics = sortedScans.filter(s => s.metrics != null);
  const metricsCount = scansWithMetrics.length;
  const avgMetrics = metricsCount > 0 ? {
    symmetry: scansWithMetrics.reduce((s, sc) => s + (sc.metrics?.symmetry ?? 0), 0) / metricsCount,
    definition: scansWithMetrics.reduce((s, sc) => s + (sc.metrics?.definition ?? 0), 0) / metricsCount,
    fullness: scansWithMetrics.reduce((s, sc) => s + (sc.metrics?.fullness ?? 0), 0) / metricsCount,
    structure: scansWithMetrics.reduce((s, sc) => s + (sc.metrics?.structure ?? 0), 0) / metricsCount,
    texture: scansWithMetrics.reduce((s, sc) => s + (sc.metrics?.texture ?? 0), 0) / metricsCount,
  } : null;

  const metricEntries = avgMetrics ? [
    { label: 'Symmetry', value: avgMetrics.symmetry },
    { label: 'Definition', value: avgMetrics.definition },
    { label: 'Fullness', value: avgMetrics.fullness },
    { label: 'Structure', value: avgMetrics.structure },
    { label: 'Texture', value: avgMetrics.texture },
  ] : [];

  const trendInsight = trend === 'up'
    ? "Your scores are improving! Keep up the great work with your routine."
    : trend === 'down'
    ? "Your recent scores have dipped. Consider reviewing your hair care habits."
    : "Your scores are holding steady. Consistency is key.";

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="safe-area-top flex-shrink-0" />
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Coach</h1>
        <p className="text-sm text-muted-foreground">Your hair care resource hub</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-5">
        {/* Scan CTA — shown until the user completes their first scan */}
        {!hasScans && (
          <button
            onClick={onNewScan}
            className="w-full rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3.5 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <ScanLine className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Scan to unlock your coaching</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Preview any topic below. Scan your hairline to unlock every full guide plus personalized insights.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
          </button>
        )}

        {/* Explore Topics — always visible */}
        <div>
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Explore Topics</h3>
          <div className="space-y-2.5">
            {allTopicContent.map((topic, i) => {
              const TopicIcon = topic.icon;
              return (
                <button
                  key={topic.label}
                  onClick={() => setSelectedTopic(i)}
                  className="w-full rounded-2xl bg-card border border-border/50 p-4 flex items-center gap-3.5 active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TopicIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium">{topic.label}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{topic.sections.length} sections</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Your Insights — show when scans exist */}
        {hasScans && (
          <>
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Your Insights</h3>

            {/* Overview cards grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <BarChart3 className="w-4 h-4 mb-1.5 text-primary" />
                <p className="text-2xl font-bold tabular-nums">{averageScore}</p>
                <p className="text-[11px] text-muted-foreground">Average Score</p>
              </div>
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <Award className="w-4 h-4 mb-1.5 text-primary" />
                <p className="text-2xl font-bold tabular-nums">{bestScore}</p>
                <p className="text-[11px] text-muted-foreground">Best Score</p>
              </div>
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                {trend === 'up' && <TrendingUp className="w-4 h-4 mb-1.5 text-green-400" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 mb-1.5 text-red-400" />}
                {trend === 'stable' && <Minus className="w-4 h-4 mb-1.5 text-muted-foreground" />}
                <p className="text-2xl font-bold capitalize">{trend}</p>
                <p className="text-[11px] text-muted-foreground">Trend</p>
              </div>
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <Target className="w-4 h-4 mb-1.5 text-primary" />
                <p className="text-lg font-bold">{consistency}</p>
                <p className="text-[11px] text-muted-foreground">Consistency</p>
              </div>
            </div>

            {/* Average Metrics progress bars */}
            {avgMetrics && (
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Average Metrics</h3>
                <div className="space-y-3.5">
                  {metricEntries.map(({ label, value }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground font-medium">{label}</span>
                        <span className="text-xs font-semibold text-foreground tabular-nums">
                          {value.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, value * 10)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trend insight card */}
            <div className="rounded-2xl bg-card border border-border/50 p-4">
              <div className="flex items-start gap-3">
                {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />}
                {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
                {trend === 'stable' && <Minus className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-0.5">Trend Insight</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{trendInsight}</p>
                </div>
              </div>
            </div>

            {/* Personalized tips */}
            {latestScan?.personalized_tips && latestScan.personalized_tips.length > 0 && (
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Personalized Tips</h3>
                </div>
                <ul className="space-y-2.5">
                  {latestScan.personalized_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-foreground/80 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Entertainment disclaimer */}
        <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
          For entertainment only. Not medical advice.
        </p>

        {/* Spacer for bottom nav */}
        <div className="h-20 flex-shrink-0" />
      </div>
    </div>
  );
};
