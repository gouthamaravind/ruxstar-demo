import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Printer, MessageCircle, Sparkles, Truck, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeSwitch } from '@/components/ModeSwitch';
import { useApp } from '@/contexts/AppContext';
import { CATEGORIES, PRINT_TYPES } from '@/lib/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const categoryEmojis: Record<string, string> = {
  'T-Shirts': '👕',
  'Hoodies': '🧥',
  'Mugs': '☕',
  'Stickers': '🏷️',
  'Posters': '🖼️',
  'Caps': '🧢',
  'Business Cards': '📇',
};

const printEmojis: Record<string, string> = {
  'DTF': '🎨',
  'DTG': '🖨️',
  'Screen Print': '🖌️',
  'Sublimation': '💨',
  'UV Print': '☀️',
  'Embroidery': '🧵',
  'Vinyl': '📋',
};

export default function HomePage() {
  const { mode } = useApp();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              The Future of Print Commerce
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Print-on-Demand</span>
              <br />
              <span className="text-foreground">+ Social Commerce</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect with local print vendors, customize products, and share your designs with a creative community.
            </p>

            {/* Large Mode Switch */}
            <div className="flex justify-center mb-10">
              <ModeSwitch size="lg" />
            </div>

            {/* Mode-specific Cards */}
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              {mode === 'social' ? (
                <>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl bg-card border border-border shadow-card"
                  >
                    <MessageCircle className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Social Feed</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Discover trending designs and connect with creators
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/social">
                        Create Post <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl bg-card border border-border shadow-card"
                  >
                    <Users className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Community</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Follow creators and get inspired by their work
                    </p>
                    <Button variant="secondary" asChild className="w-full">
                      <Link to="/social">
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl bg-card border border-border shadow-card"
                  >
                    <Printer className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">POD Catalog</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Browse products from local print vendors
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/pod">
                        Start Order <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl bg-card border border-border shadow-card"
                  >
                    <div className="flex flex-wrap gap-2 mb-4">
                      {CATEGORIES.slice(0, 4).map((cat) => (
                        <span key={cat} className="text-2xl">{categoryEmojis[cat]}</span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">7 Categories</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      T-Shirts, Hoodies, Mugs, Stickers & more
                    </p>
                    <Button variant="secondary" asChild className="w-full">
                      <Link to="/pod">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* POD Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
              POD Categories
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground">
              Everything you need for custom merchandise
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
          >
            {CATEGORIES.map((category) => (
              <motion.div
                key={category}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-card text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <span className="text-4xl mb-3 block">{categoryEmojis[category]}</span>
                <h3 className="font-medium text-sm">{category}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Print Specializations */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
              Print Specializations
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground">
              Professional printing techniques for every need
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-wrap justify-center gap-3"
          >
            {PRINT_TYPES.map((type) => (
              <motion.div
                key={type}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border shadow-sm font-medium text-sm hover:border-primary/50 transition-colors cursor-pointer"
              >
                <span>{printEmojis[type]}</span>
                {type}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
              How It Works
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Customers */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.h3 variants={itemVariants} className="text-xl font-semibold mb-6 text-center">
                For Customers
              </motion.h3>
              <div className="space-y-4">
                {[
                  { icon: '🔍', title: 'Browse Catalog', desc: 'Explore products and vendors' },
                  { icon: '🎨', title: 'Customize Design', desc: 'Upload your artwork' },
                  { icon: '📦', title: 'Place Order', desc: 'Choose sizes, colors, quantity' },
                  { icon: '✅', title: 'Get Notified', desc: 'Order ready for pickup' },
                ].map((step, i) => (
                  <motion.div
                    key={step.title}
                    variants={itemVariants}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                      {step.icon}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.desc}</div>
                    </div>
                    <div className="ml-auto text-2xl font-bold text-muted-foreground/30">{i + 1}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* For Vendors */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.h3 variants={itemVariants} className="text-xl font-semibold mb-6 text-center">
                For Vendors
              </motion.h3>
              <div className="space-y-4">
                {[
                  { icon: '📝', title: 'Register Business', desc: 'Complete onboarding' },
                  { icon: '💰', title: 'Set Pricing', desc: 'Define rates & turnaround' },
                  { icon: '📬', title: 'Receive Orders', desc: 'Accept and print' },
                  { icon: '🎉', title: 'Mark Ready', desc: 'Notify customers' },
                ].map((step, i) => (
                  <motion.div
                    key={step.title}
                    variants={itemVariants}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                      {step.icon}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.desc}</div>
                    </div>
                    <div className="ml-auto text-2xl font-bold text-muted-foreground/30">{i + 1}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Join our platform as a customer or vendor and experience the future of print commerce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/pod">
                  <Printer className="mr-2 h-5 w-5" />
                  Explore POD Catalog
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/vendor/onboarding">
                  <Truck className="mr-2 h-5 w-5" />
                  Vendor Onboarding
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
