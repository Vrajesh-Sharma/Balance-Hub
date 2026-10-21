import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, 
  Calendar, 
  Home,
  Activity,
  Target,
  BookOpen,
  Gamepad2,
  Library,
  Menu,
  X,
  Brain,
  Timer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const primaryNavItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BarChart2, label: 'Balance Tracker', path: '/tracker' },
  { icon: Calendar, label: 'Habit Planner', path: '/planner' },
  { icon: Activity, label: 'Stress Hub', path: '/stress-hub' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
];

const secondaryNavItems = [
  { icon: Gamepad2, label: 'Balance Game', path: '/game' },
  { icon: Library, label: 'Resources', path: '/resources' },
  { icon: Timer, label: 'Work Time', path: '/work-time' },
  { icon: Brain, label: 'Smart Scheduler', path: '/smart-scheduler' },
];

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setIsMoreOpen(false);
  };

  // Lock background scrolling while the mobile drawer is open, then restore it.
  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  // Allow keyboard users to dismiss the mobile drawer.
  React.useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled 
            ? 'bg-cream-50/95 backdrop-blur-sm border-b border-charcoal-200 shadow-subtle' 
            : 'bg-cream-50 border-b border-charcoal-200/50'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-16 gap-4 max-w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Balance Hub Home" onClick={handleLinkClick}>
              <div className="p-2 bg-sage-600 rounded-lg">
                <BarChart2 className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-lg text-white tracking-tight">
                Balance Hub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 min-w-0 justify-center" aria-label="Main navigation">
              {primaryNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" onMouseLeave={() => setIsMoreOpen(false)}>
                <button
                  onClick={() => setIsMoreOpen(true)}
                  onMouseEnter={() => setIsMoreOpen(true)}
                  className={`nav-link-inactive gap-1.5 ${isMoreOpen ? 'text-sage-600' : ''}`}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="true"
                  aria-label="More navigation items"
                >
                  <span>More</span>
                  {isMoreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white py-2 text-stone-700 shadow-xl z-[60]"
                      role="menu"
                    >
                      {secondaryNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                              isActive 
                            ? 'bg-teal-50 text-teal-800 border-l-2 border-teal-600' 
                            : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
                        }`}
                            role="menuitem"
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ask AI - Secondary Action */}
              <Link
                to="/ask-ai"
                onClick={handleLinkClick}
                className="btn-secondary btn-sm ml-2 shrink-0 hidden xl:inline-flex"
              >
                <Brain className="h-4 w-4" />
                Ask AI
              </Link>
            </nav>

            {/* Desktop Actions (Mobile) */}
            <div className="lg:hidden flex items-center gap-2 shrink-0">
              <Link
                to="/ask-ai"
                onClick={handleLinkClick}
                className="btn-primary btn-sm"
              >
                <Brain className="h-4 w-4" />
                Ask AI
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsMoreOpen(false); }}
              className="lg:hidden p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100 transition-colors shrink-0"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/45 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Menu overlay"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-[60] w-[min(20rem,85vw)] lg:hidden bg-[#173b36] text-white border-r border-white/15 p-5 sm:p-6 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-3" onClick={handleLinkClick}>
                <div className="p-2 bg-primary-500 rounded-lg">
                  <BarChart2 className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Balance Hub</span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto">
              {/* Primary Navigation */}
              <nav aria-label="Primary navigation">
                {primaryNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive 
                          ? 'bg-white/15 text-white border border-white/25'
                          : 'text-white/90 hover:text-white hover:bg-white/10 border border-transparent'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="my-4 border-t border-white/20" />

              {/* Secondary Navigation */}
              <nav aria-label="Secondary navigation">
                {secondaryNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive 
                          ? 'bg-white/15 text-white border border-white/25'
                          : 'text-white/90 hover:text-white hover:bg-white/10 border border-transparent'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/20">
              <Link
                to="/ask-ai"
                onClick={handleLinkClick}
                className="btn-primary w-full justify-center"
              >
                <Brain className="h-5 w-5" />
                Ask AI Assistant
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 pt-16">
        {/* Main content stays in place; the mobile drawer overlays it. */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}