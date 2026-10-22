import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  Calendar, 
  Brain,
  Target,
  BookOpen,
  Gamepad2,
  Library,
  Timer,
  Shield,
  Zap,
  Users,
  Sparkles,
  Star,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { homePageData } from '../lib/staticData';

const iconMap = {
  BarChart2,
  Calendar,
  Brain,
  Target,
  BookOpen,
  Gamepad2,
  Library,
  Timer,
  Shield,
  Zap,
  Users,
  Sparkles,
  Monitor,
};

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/ask-ai');
  };

  return (
    <div className="container-custom py-6 sm:py-8">
      <div className="space-y-12 md:space-y-16 lg:space-y-20">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative py-6 md:py-10 lg:py-12 text-center"
        >
          <div className="relative max-w-4xl mx-auto space-y-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <h1 className="text-heading-xl sm:text-display-sm md:text-display-md lg:text-display-lg font-display font-bold tracking-tight text-charcoal-900 text-balance">
                Plan your day. Track your balance. Feel better.
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <p className="text-body-lg md:text-heading-sm text-charcoal-700 leading-relaxed">
                {homePageData.hero.subtitle}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGetStarted}
                className="btn-primary btn-lg"
              >
                <Brain className="h-5 w-5" />
                Get Started
              </motion.button>
              <Link
                to="/tracker"
                className="btn-secondary btn-lg"
              >
                <BarChart2 className="h-5 w-5" />
                Explore Dashboard
              </Link>
            </motion.div>

            {/* Hero Illustration / Product Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 relative"
            >
              <div className="relative max-w-5xl mx-auto">
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-card">
                  <div className="flex items-center gap-2 px-4 py-3 bg-charcoal-100 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-coral-300" />
                      <div className="w-3 h-3 rounded-full bg-honey-400" />
                      <div className="w-3 h-3 rounded-full bg-sage-300" />
                    </div>
                    <div className="flex-1 min-w-0 truncate text-center text-xs sm:text-sm text-charcoal-700 font-mono">
                      dashboard.balance-hub.app
                    </div>
                    <Monitor className="hidden sm:block h-5 w-5 text-charcoal-600" aria-hidden="true" />
                  </div>
                  <div className="relative p-3 sm:p-6 md:p-8">
                    <img
                      src={homePageData.hero.image}
                      alt="Balance Hub dashboard showing balance tracking, habit planner, and stress hub"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Product Overview / Key Capabilities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <h2 className="text-heading-xl sm:text-display-sm font-display font-bold text-charcoal-900 mb-3">
              Everything in one place
            </h2>
            <p className="text-body-lg text-charcoal-700">
              Six core tools that work together — no switching apps, no syncing issues.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {homePageData.features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="card p-6"
              >
                <div className="p-3 bg-sage-100 border border-sage-200 rounded-lg w-fit mb-4">
                  {(() => {
                    const Icon = iconMap[feature.icon as keyof typeof iconMap];
                    return <Icon className="h-6 w-6 text-sage-700" />;
                  })()}
                </div>
                <h3 className="text-heading-md font-semibold text-charcoal-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-md text-charcoal-700 leading-relaxed">
                  {feature.description}
                </p>
                <Link
                  to={feature.title === 'Balance Tracking' ? '/tracker' : 
                     feature.title === 'Habit Planner' ? '/planner' :
                     feature.title === 'Stress Management' ? '/stress-hub' : '/goals'}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-700 hover:text-sage-900 transition-colors mt-4"
                >
                  Open
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Additional Capabilities Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <h2 className="text-heading-xl sm:text-display-sm font-display font-bold text-charcoal-900 mb-3">
              More ways to find balance
            </h2>
            <p className="text-body-lg text-charcoal-700">
              Supporting tools for reflection, planning, and team coordination.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {homePageData.capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="card p-6"
              >
                <div className="p-3 bg-sage-50 border border-sage-200 rounded-lg w-fit mb-4">
                  {(() => {
                    const Icon = iconMap[capability.icon as keyof typeof iconMap];
                    return <Icon className="h-6 w-6 text-sage-700" />;
                  })()}
                </div>
                <h3 className="text-heading-md font-semibold text-charcoal-900 mb-2">
                  {capability.title}
                </h3>
                <p className="text-body-md text-charcoal-700 leading-relaxed">
                  {capability.description}
                </p>
                <Link
                  to={capability.title === 'Journal' ? '/journal' :
                     capability.title === 'Balance Game' ? '/game' :
                     capability.title === 'Resources' ? '/resources' :
                     capability.title === 'Work Time Tracker' ? '/work-time' :
                     capability.title === 'Smart Scheduler' ? '/smart-scheduler' : '/goals'}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-700 hover:text-sage-900 transition-colors mt-4"
                >
                  Open
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Helps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-border rounded-2xl p-5 sm:p-8 md:p-12"
        >
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-1">
              <h2 className="text-heading-xl sm:text-display-sm font-display font-bold text-charcoal-900 mb-3">
                How Balance Hub helps
              </h2>
              <p className="text-body-lg text-charcoal-700 mb-6">
                Most productivity tools optimize for output. Balance Hub optimizes for sustainability.
              </p>
              <ul className="space-y-4">
                {[
                  "See your actual time distribution across work, personal, health, and hobbies",
                  "Build habits with flexible scheduling — not rigid streaks that break",
                  "Access stress tools in two clicks, no onboarding flow required",
                  "Set goals that adapt when your priorities shift",
                  "Reflect weekly with guided journal prompts that reveal patterns",
                  "Coordinate with your team on workload visibility, not surveillance",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="flex items-start gap-3 text-charcoal-700"
                  >
                    <div className="flex-shrink-0 mt-1.5 w-2 h-2 bg-sage-600 rounded-full" />
                    <span className="text-body-md leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: Shield, title: 'Private by default', desc: 'Your data stays on your device. No analytics, no tracking, no selling.' },
                { icon: Zap, title: 'Fast and lightweight', desc: 'Loads in under a second. Works offline. No heavy bundles.' },
                { icon: Users, title: 'Team-aware', desc: 'Optional shared views for managers who want visibility without micromanagement.' },
                { icon: Sparkles, title: 'AI when useful', desc: 'Smart scheduling suggestions — only when you ask for them.' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="card p-6"
                >
                  <div className="p-3 bg-sage-50 border border-sage-200 rounded-lg w-fit mb-4">
                    <item.icon className="h-6 w-6 text-sage-700" />
                  </div>
                  <h3 className="text-heading-sm font-semibold text-charcoal-900 mb-2">{item.title}</h3>
                  <p className="text-body-sm text-charcoal-700">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials - Subtle */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <h2 className="text-heading-xl sm:text-display-sm font-display font-bold text-charcoal-900 mb-3">
              What people say
            </h2>
            <p className="text-body-lg text-charcoal-700">
              Real feedback from people using Balance Hub daily.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {homePageData.testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <p className="text-body-md text-charcoal-700 leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full border border-border"
                  />
                  <div>
                    <div className="font-medium text-charcoal-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-charcoal-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="bg-sage-50 border border-sage-200 rounded-2xl p-6 sm:p-10 lg:p-14 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-display-sm md:text-display-md font-bold text-charcoal-900">
              Ready to see where your time goes?
            </h2>
            <p className="text-body-lg text-charcoal-700">
              Start with the balance tracker. No account required to try it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGetStarted}
                className="btn-primary btn-lg"
              >
                <Brain className="h-5 w-5" />
                Get Started Free
              </motion.button>
              <Link
                to="/tracker"
                className="btn-secondary btn-lg"
              >
                <BarChart2 className="h-5 w-5" />
                Try Balance Tracker
              </Link>
            </div>
            <p className="text-sm text-charcoal-600">
              No credit card &middot; Works offline &middot; Export your data anytime
            </p>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-10 border-t border-border">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10">
            <div className="sm:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4" aria-label="Balance Hub Home">
                <div className="p-2 bg-sage-700 rounded-lg">
                  <BarChart2 className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="font-bold text-lg text-charcoal-900 tracking-tight">Balance Hub</span>
              </Link>
              <p className="text-body-md text-charcoal-600 max-w-xs">
                Plan your day. Track your balance. Feel better.
              </p>
            </div>
            <nav aria-label="Product navigation">
              <h3 className="font-semibold text-charcoal-900 mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/tracker" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Balance Tracker</Link></li>
                <li><Link to="/planner" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Habit Planner</Link></li>
                <li><Link to="/stress-hub" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Stress Hub</Link></li>
                <li><Link to="/goals" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Goals</Link></li>
                <li><Link to="/journal" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Journal</Link></li>
              </ul>
            </nav>
            <nav aria-label="More tools navigation">
              <h3 className="font-semibold text-charcoal-900 mb-4">More Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/game" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Balance Game</Link></li>
                <li><Link to="/resources" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Resources</Link></li>
                <li><Link to="/work-time" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Work Time Tracker</Link></li>
                <li><Link to="/smart-scheduler" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Smart Scheduler</Link></li>
                <li><Link to="/ask-ai" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">Ask AI</Link></li>
              </ul>
            </nav>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-charcoal-600">
              Built by the Balance Hub Team. Not backed by venture capital.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/Vrajesh-Sharma" target="_blank" rel="noopener noreferrer" className="text-charcoal-600 hover:text-charcoal-900 transition-colors text-sm">
                GitHub
              </a>
              <a href="#" className="text-charcoal-600 hover:text-charcoal-900 transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-charcoal-600 hover:text-charcoal-900 transition-colors text-sm">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}