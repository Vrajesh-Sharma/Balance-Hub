import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Calendar, 
  Home,
  Activity,
  Target,
  BookOpen,
  GamepadIcon,
  Library,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BarChart2, label: 'Balance Tracker', path: '/tracker' },
  { icon: Calendar, label: 'Habit Planner', path: '/planner' },
  { icon: Activity, label: 'Stress Hub', path: '/stress-hub' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: GamepadIcon, label: 'Balance Game', path: '/game' },
  { icon: Library, label: 'Resources', path: '/resources' },
];

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl font-bold">Balance Hub</h1>
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Top Navigation */}
        <nav className="hidden lg:block px-6 py-2 border-t border-gray-700">
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors hover:bg-gray-700 ${
                  location.pathname === item.path ? 'bg-cyan-500 text-white' : 'text-gray-300'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="flex pt-[120px] lg:pt-[130px]">
        {/* Mobile Sidebar */}
        <motion.nav
          initial={{ x: -300 }}
          animate={{ x: isMenuOpen ? 0 : -300 }}
          className="fixed lg:hidden top-[130px] left-0 h-[calc(100vh-130px)] w-64 bg-gray-800 p-4 z-40"
        >
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-700 ${
                  location.pathname === item.path ? 'bg-cyan-500 text-white' : 'text-gray-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1 px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}