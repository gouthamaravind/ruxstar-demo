import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, ChevronDown, Star, Clock, Sparkles, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { fetchProducts } from '@/lib/api';
import { Product, CATEGORY_ICONS, formatINR } from '@/lib/types';

// Only these turnaround options
const TURNAROUND_OPTIONS = ['Same Day', '24 Hours'];

export default function PODCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPrintType, setSelectedPrintType] = useState<string>('');
  const [selectedTurnaround, setSelectedTurnaround] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  // Get category counts from actual products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Get unique categories from products
  const uniqueCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category))].sort();
  }, [products]);

  // Get products for the selected category (or all if none selected)
  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Get available print types for selected category
  const availablePrintTypes = useMemo(() => {
    const types = new Set<string>();
    categoryProducts.forEach(p => {
      p.supported_print_types?.forEach(t => types.add(t));
    });
    return [...types].sort();
  }, [categoryProducts]);

  // Get available turnarounds for selected category (filtered to only Same Day / 24 Hours)
  const availableTurnarounds = useMemo(() => {
    const turnarounds = new Set<string>();
    categoryProducts.forEach(p => {
      if (p.turnaround && TURNAROUND_OPTIONS.includes(p.turnaround)) {
        turnarounds.add(p.turnaround);
      }
    });
    return TURNAROUND_OPTIONS.filter(t => turnarounds.has(t));
  }, [categoryProducts]);

  // Reset filters when they become unavailable after category change
  useEffect(() => {
    if (selectedPrintType && !availablePrintTypes.includes(selectedPrintType)) {
      setSelectedPrintType('');
    }
    if (selectedTurnaround && !availableTurnarounds.includes(selectedTurnaround)) {
      setSelectedTurnaround('');
    }
  }, [selectedCategory, availablePrintTypes, availableTurnarounds]);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedPrintType && !product.supported_print_types?.includes(selectedPrintType)) return false;
    if (selectedTurnaround && product.turnaround !== selectedTurnaround) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchVariant = product.variant_type?.toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchVariant) return false;
    }
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
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container mx-auto px-4 py-12 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Premium Print-on-Demand</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Product Catalog
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse {products.length}+ customizable products across {uniqueCategories.length} categories. 
              Professional printing with fast turnaround.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Pills - Horizontal Scroll */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <ScrollArea className="w-full whitespace-nowrap py-3">
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="rounded-full shrink-0"
              >
                <Package className="h-4 w-4 mr-1.5" />
                All Products
                <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                  {products.length}
                </Badge>
              </Button>
              {uniqueCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                  className="rounded-full shrink-0"
                >
                  <span className="mr-1.5">{CATEGORY_ICONS[category] || '📦'}</span>
                  {category}
                  <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                    {categoryCounts[category] || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-36 space-y-1">
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-5">
                  <FilterSection 
                    title="Print Type" 
                    options={availablePrintTypes} 
                    selected={selectedPrintType} 
                    onSelect={setSelectedPrintType}
                    emptyMessage="Select a category first"
                  />
                  <FilterSection 
                    title="Turnaround" 
                    options={availableTurnarounds} 
                    selected={selectedTurnaround} 
                    onSelect={setSelectedTurnaround}
                    showIcon
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 mt-4">
                <h3 className="font-medium mb-3 text-sm">Why Choose Us</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-background/80 flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <span>Premium quality prints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-background/80 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span>Same day delivery available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-background/80 flex items-center justify-center">
                      <Package className="h-4 w-4 text-green-500" />
                    </div>
                    <span>Bulk order discounts</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Mobile Filter */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products, categories, variants..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-11 h-12 rounded-xl bg-card border-border"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)} 
                className="lg:hidden h-12 px-4 rounded-xl"
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
                  <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Filters</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <FilterSection title="Print Type" options={availablePrintTypes} selected={selectedPrintType} onSelect={setSelectedPrintType} inline emptyMessage="Select a category" />
                    <FilterSection title="Turnaround" options={availableTurnarounds} selected={selectedTurnaround} onSelect={setSelectedTurnaround} inline showIcon emptyMessage="Not available" />
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" onClick={clearFilters} size="sm" className="w-full">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of {products.length} products
                {selectedCategory && <span> in <span className="font-medium text-foreground">{selectedCategory}</span></span>}
              </p>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-10 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={{ 
                  hidden: { opacity: 0 }, 
                  visible: { opacity: 1, transition: { staggerChildren: 0.03 } } 
                }} 
                className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-card rounded-2xl border border-border"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
              </motion.div>
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
  inline = false,
  showIcon = false,
  emptyMessage = 'No options available'
}: { 
  title: string;
  options: string[]; 
  selected: string; 
  onSelect: (value: string) => void; 
  inline?: boolean;
  showIcon?: boolean;
  emptyMessage?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (inline) {
    return (
      <div>
        <h3 className="font-medium text-sm mb-2">{title}</h3>
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button 
                key={option} 
                onClick={() => onSelect(selected === option ? '' : option)} 
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selected === option 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {showIcon && <Clock className="h-3 w-3 inline mr-1" />}
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
        {title}
        {selected && <Badge variant="secondary" className="text-xs">{selected}</Badge>}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-1">
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-2">{emptyMessage}</p>
        ) : (
          options.map((option) => (
            <button 
              key={option} 
              onClick={() => onSelect(selected === option ? '' : option)} 
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                selected === option 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {showIcon && <Clock className="h-3.5 w-3.5" />}
              {option}
            </button>
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ProductCard({ product }: { product: Product }) {
  const hasVariant = product.variant_type && product.variant_type !== product.name;
  
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} 
      whileHover={{ y: -6, transition: { duration: 0.2 } }} 
      className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      <Link to={`/pod/order?product=${product.id}`} className="block">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
          <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
            {product.image || CATEGORY_ICONS[product.category] || '📦'}
          </span>
          
          {/* Quick badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.turnaround === 'Same Day' && (
              <Badge className="bg-green-500/90 text-white border-0 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Same Day
              </Badge>
            )}
          </div>
          
          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm font-semibold">
              {formatINR(product.base_price)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category & Variant */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">{product.category}</span>
            {hasVariant && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs font-medium text-primary">{product.variant_type}</span>
              </>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Print Types */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.supported_print_types?.slice(0, 3).map((type) => (
              <Badge key={type} variant="outline" className="text-xs font-normal">
                {type}
              </Badge>
            ))}
            {product.supported_print_types?.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{product.supported_print_types.length - 3}
              </Badge>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <span className="flex items-center gap-1">
              {product.sizes?.length > 0 ? `${product.sizes.length} sizes` : 'Standard'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {product.turnaround || '2-3 Days'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}