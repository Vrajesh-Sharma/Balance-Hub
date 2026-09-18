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

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled 
            ? 'bg-dark-950/95 backdrop-blur-sm border-b border-dark-800 shadow-subtle' 
            : 'bg-dark-950 border-b border-dark-800/50'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-16 gap-4 max-w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Balance Hub Home" onClick={handleLinkClick}>
              <div className="p-2 bg-primary-500 rounded-lg">
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
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  onMouseEnter={() => setIsMoreOpen(true)}
                  className={`nav-link-inactive gap-1.5 ${isMoreOpen ? 'text-primary-400' : ''}`}
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
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-dark-900 border border-dark-700 rounded-lg shadow-card-hover py-2 z-50"
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
                                ? 'bg-primary-500/15 text-primary-400' 
                                : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
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
              className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors shrink-0"
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
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
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
            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden bg-dark-950 border-r border-dark-800 p-6 flex flex-col"
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
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors"
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
                          ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' 
                          : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="my-4 border-t border-dark-800" />

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
                          ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' 
                          : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
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

            <div className="pt-4 border-t border-dark-800">
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

      <div className="flex pt-16">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}