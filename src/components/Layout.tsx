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
  const moreRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Header shadow once the page is scrolled
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  React.useEffect(() => {
    setIsMoreOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Mobile drawer: lock background scroll, close on Escape, move focus in/out
  React.useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    // Drawer is lg:hidden-equivalent (xl breakpoint); close it if the viewport grows past it
    const mq = window.matchMedia('(min-width: 1280px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    mq.addEventListener('change', onChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      mq.removeEventListener('change', onChange);
      menuButtonRef.current?.focus();
    };
  }, [isMenuOpen]);

  // "More" dropdown: close on outside click or Escape
  React.useEffect(() => {
    if (!isMoreOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMoreOpen]);

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsMoreOpen(false);
  };

  const isMoreActive = secondaryNavItems.some((item) => item.path === location.pathname);

  const drawerLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 min-h-[44px] rounded-xl text-base font-medium transition-colors ${
      isActive
        ? 'bg-sage-100 text-sage-800 border border-sage-200'
        : 'text-charcoal-800 border border-transparent hover:bg-charcoal-100 hover:text-charcoal-900'
    }`;

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-sage-700 focus:text-white"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-cream-50 border-b transition-shadow duration-200 ${
          isScrolled ? 'border-charcoal-200 shadow-subtle' : 'border-charcoal-200/60'
        }`}
      >
        <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 rounded-lg"
              aria-label="Balance Hub home"
              onClick={closeAll}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-700">
                <BarChart2 className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="hidden sm:block font-display font-bold text-lg text-charcoal-900 tracking-tight">
                Balance Hub
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav
              className="hidden xl:flex items-center gap-1 flex-1 min-w-0 justify-center"
              aria-label="Main navigation"
            >
              {primaryNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeAll}
                    className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}

              {/* More dropdown (click / keyboard driven so hover and click never fight) */}
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen((open) => !open)}
                  className={
                    isMoreActive || isMoreOpen ? 'nav-link-active gap-1.5' : 'nav-link-inactive gap-1.5'
                  }
                  aria-expanded={isMoreOpen}
                  aria-haspopup="menu"
                  aria-controls="more-menu"
                >
                  <span>More</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-150 ${isMoreOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      id="more-menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-elevated p-1.5 z-50"
                      role="menu"
                    >
                      {secondaryNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeAll}
                            className={`flex items-center gap-3 px-3 min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-sage-100 text-sage-800'
                                : 'text-charcoal-800 hover:bg-charcoal-100 hover:text-charcoal-900'
                            }`}
                            role="menuitem"
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right-side actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/ask-ai" onClick={closeAll} className="btn-primary btn-sm">
                <Brain className="h-4 w-4" aria-hidden="true" />
                <span>Ask AI</span>
              </Link>

              <button
                type="button"
                ref={menuButtonRef}
                onClick={() => {
                  setIsMoreOpen(false);
                  setIsMenuOpen((open) => !open);
                }}
                className="xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl text-charcoal-800 hover:bg-charcoal-100 transition-colors shrink-0"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-drawer"
              >
                {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer: dimmed overlay + solid panel, both above the header */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-charcoal-950/50 xl:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-[55] flex w-[85vw] max-w-sm flex-col bg-cream-50 border-r border-charcoal-200 shadow-elevated xl:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-charcoal-200 px-4">
                <Link to="/" className="flex items-center gap-2.5 rounded-lg" onClick={closeAll}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-700">
                    <BarChart2 className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <span className="font-display font-bold text-lg text-charcoal-900">Balance Hub</span>
                </Link>
                <button
                  type="button"
                  ref={closeButtonRef}
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-charcoal-800 hover:bg-charcoal-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                <nav aria-label="Primary" className="space-y-1">
                  {primaryNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeAll}
                        className={drawerLinkClass(isActive)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <p className="mt-6 mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                  More
                </p>
                <nav aria-label="More" className="space-y-1">
                  {secondaryNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeAll}
                        className={drawerLinkClass(isActive)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="shrink-0 border-t border-charcoal-200 p-4">
                <Link to="/ask-ai" onClick={closeAll} className="btn-primary w-full">
                  <Brain className="h-5 w-5" aria-hidden="true" />
                  Ask AI Assistant
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main id="main-content" className="pt-16 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
