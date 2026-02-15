import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ExternalLink,
  Star,
  ChevronRight,
  Crown,
  Lock,
  Droplets,
  Sun,
  Wind,
  Leaf
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  rating: number;
  isPremium: boolean;
  icon: React.ReactNode;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Scalp Revitalizing Shampoo',
    brand: 'Generic Brand',
    category: 'Shampoo',
    description: 'Sulfate-free formula that gently cleanses while promoting scalp health.',
    rating: 4.5,
    isPremium: false,
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: '2',
    name: 'Biotin Growth Serum',
    brand: 'Generic Brand',
    category: 'Serum',
    description: 'Concentrated formula with biotin and peptides to support hair appearance.',
    rating: 4.7,
    isPremium: true,
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: '3',
    name: 'Volumizing Conditioner',
    brand: 'Generic Brand',
    category: 'Conditioner',
    description: 'Lightweight conditioner that adds body without weighing hair down.',
    rating: 4.3,
    isPremium: false,
    icon: <Wind className="w-5 h-5" />
  },
  {
    id: '4',
    name: 'Natural Hair Oil',
    brand: 'Generic Brand',
    category: 'Treatment',
    description: 'Blend of argan and jojoba oils for deep nourishment and shine.',
    rating: 4.6,
    isPremium: false,
    icon: <Leaf className="w-5 h-5" />
  },
  {
    id: '5',
    name: 'UV Protection Spray',
    brand: 'Generic Brand',
    category: 'Protection',
    description: 'Shields hair from sun damage and environmental stressors.',
    rating: 4.4,
    isPremium: true,
    icon: <Sun className="w-5 h-5" />
  },
];

interface ProductRecommendationsProps {
  hairlineType?: string;
  score?: number;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export const ProductRecommendations = ({
  hairlineType,
  score = 5,
  isPremium = false,
  onUpgrade
}: ProductRecommendationsProps) => {
  const [showAll, setShowAll] = useState(false);

  // Filter products based on user's needs
  const getRecommendedProducts = () => {
    // Simple recommendation logic based on score
    if (score < 5) {
      return products.filter(p =>
        p.category === 'Serum' || p.category === 'Treatment'
      );
    } else if (score < 7) {
      return products.filter(p =>
        p.category === 'Shampoo' || p.category === 'Conditioner'
      );
    }
    return products;
  };

  const recommendedProducts = getRecommendedProducts();
  const displayProducts = showAll ? recommendedProducts : recommendedProducts.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Product Suggestions
        </h3>
        {recommendedProducts.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:underline"
          >
            {showAll ? 'Show less' : 'View all'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className={`glass-panel p-4 ${
              product.isPremium && !isPremium ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                {product.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  {product.isPremium && !isPremium && (
                    <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {product.brand} • {product.category}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isPremium && (
        <div className="glass-panel p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Unlock Premium Recommendations</p>
              <p className="text-xs text-muted-foreground">
                Get personalized product suggestions based on your hairline type
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onUpgrade}
              className="flex-shrink-0"
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-center text-muted-foreground">
        Product suggestions are for informational purposes only. Always consult
        a professional before starting any new hair care regimen.
      </p>
    </div>
  );
};
