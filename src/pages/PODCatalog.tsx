import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getProducts, CATEGORIES, PRINT_TYPES, TURNAROUNDS, Product } from '@/lib/mockData';

export default function PODCatalog() {
  const products = getProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPrintType, setSelectedPrintType] = useState<string>('');
  const [selectedTurnaround, setSelectedTurnaround] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedPrintType && !product.supportedPrintTypes.includes(selectedPrintType)) return false;
    if (selectedTurnaround && product.turnaround !== selectedTurnaround) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeFiltersCount = [selectedCategory, selectedPrintType, selectedTurnaround].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPrintType('');
    setSelectedTurnaround('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">POD Catalog</h1>
            <p className="text-muted-foreground">Browse and order custom printed products</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <FilterSection
                title="Category"
                options={CATEGORIES}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <FilterSection
                title="Print Type"
                options={PRINT_TYPES}
                selected={selectedPrintType}
                onSelect={setSelectedPrintType}
              />
              <FilterSection
                title="Turnaround"
                options={TURNAROUNDS}
                selected={selectedTurnaround}
                onSelect={setSelectedTurnaround}
              />
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="w-full">
                  Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Mobile Filter Toggle */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2" variant="secondary">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden overflow-hidden mb-6"
                >
                  <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Filters</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <FilterSection
                      title="Category"
                      options={CATEGORIES}
                      selected={selectedCategory}
                      onSelect={setSelectedCategory}
                      inline
                    />
                    <FilterSection
                      title="Print Type"
                      options={PRINT_TYPES}
                      selected={selectedPrintType}
                      onSelect={setSelectedPrintType}
                      inline
                    />
                    <FilterSection
                      title="Turnaround"
                      options={TURNAROUNDS}
                      selected={selectedTurnaround}
                      onSelect={setSelectedTurnaround}
                      inline
                    />
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" onClick={clearFilters} size="sm">
                        Clear All
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredProducts.length} of {products.length} products
            </p>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No products match your filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ 
  title, 
  options, 
  selected, 
  onSelect, 
  inline = false 
}: { 
  title: string; 
  options: string[]; 
  selected: string; 
  onSelect: (value: string) => void;
  inline?: boolean;
}) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-3">{title}</h3>
      <div className={inline ? "flex flex-wrap gap-2" : "space-y-1"}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(selected === option ? '' : option)}
            className={`${inline ? 'px-3 py-1.5 rounded-full text-xs' : 'w-full text-left px-3 py-2 rounded-lg text-sm'} transition-colors ${
              selected === option
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
    >
      <div className="aspect-square bg-muted/50 flex items-center justify-center text-6xl">
        {product.image}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold">{product.name}</h3>
          <Badge variant="secondary" className="flex-shrink-0">
            ${product.basePrice}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {product.supportedPrintTypes.slice(0, 3).map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
          {product.supportedPrintTypes.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{product.supportedPrintTypes.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>Sizes: {product.sizes.length}</span>
          <span>{product.turnaround}</span>
        </div>

        <Button asChild className="w-full">
          <Link to={`/pod/order?product=${product.id}`}>
            Order Now
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
