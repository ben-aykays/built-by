
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Command } from 'lucide-react';
import AykaysLogo from '../assets/images/Aykays.png';

interface NavbarProps {
  onSearchOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open and close on Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const escListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', escListener);
      // focus first link for accessibility
      setTimeout(() => firstMobileLinkRef.current?.focus(), 10);
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', escListener);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Work', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-5 flex justify-between items-center ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-4' : 'bg-transparent'}`}>
      <Link to="/" className="block w-20 md:w-20">
         <img src={AykaysLogo} alt="Aykays" className="w-full h-auto object-contain" />
      </Link>

      <div className="hidden md:flex items-center space-x-12">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-[13px] uppercase tracking-[0.1em] hover:text-white transition-colors font-medium ${
              location.pathname === link.path ? 'text-white' : 'text-white/60'
            }`}
          >
            {link.name}
          </Link>
        ))}
        <button 
          onClick={onSearchOpen}
          className="flex items-center gap-3 group px-4 py-2 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
        >
          <Search size={16} strokeWidth={2} className="text-white/60 group-hover:text-white transition-colors" />
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity text-white/60">
            <Command size={12} />
            <span className="text-[11px] font-mono">K</span>
          </div>
        </button>
      </div>

      <div className="md:hidden flex items-center space-x-6 text-white">
        <button onClick={onSearchOpen} className="p-2">
          <Search size={20} />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 z-50 relative"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] md:hidden"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
              className="relative inset-x-0 top-0 bg-brand-dark shadow-2xl border-b border-white/10 flex flex-col items-start p-12 pt-24 text-white"
            >
             <div className="space-y-6 w-full">
               {navLinks.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="block text-5xl font-display font-black uppercase tracking-tighter hover:text-brand-red hover:italic transition-all focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                    ref={item.name === 'Work' ? (firstMobileLinkRef as any) : undefined}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
             </div>
             
             <div className="mt-16 pt-8 border-t border-white/10 w-full flex justify-between items-end">
               <div className="text-[10px] uppercase tracking-widest text-white/50">
                 Office <br />
                 <span className="text-white">London / UK</span>
               </div>
               <div className="text-[10px] uppercase tracking-widest text-white/50 text-right">
                 Say Hi <br />
                 <span className="text-white">hello@agency.com</span>
               </div>
             </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
