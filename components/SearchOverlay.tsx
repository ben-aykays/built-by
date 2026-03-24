
import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight, Command } from 'lucide-react';
import { PortfolioItem } from '../types';
import OptimizedImage from './OptimizedImage';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  projects: PortfolioItem[];
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSearch, searchQuery, projects }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    const filtered = projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.categories.some(c => (c || '').toLowerCase().includes(q))
    );
    return filtered.slice(0, 8);
  }, [projects, searchQuery]);

  const handleResultClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-brand-dark/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Spotlight Header */}
            <div className="flex items-center px-6 py-5 border-b border-white/10">
              <SearchIcon className="text-white/40 mr-4" size={22} />
              <input    
                ref={inputRef}
                type="text"
                placeholder="Search projects, categories..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onClose();
                  }
                }}
                className="flex-1 bg-transparent text-xl font-light focus:outline-none placeholder:text-white/30 text-white"
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-white/60 font-mono">
                  <Command size={10} />
                  <span>K</span>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1 hover:bg-white/5 rounded transition-colors text-white/60"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
              {searchQuery && results.length > 0 && (
                <div className="divide-y divide-white/5">
                  {results.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        window.location.hash = `#/project/${item.id}`;
                        onClose();
                      }}
                      className="group w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-left"
                    >
                      {item.imageUrl ? (
                        <OptimizedImage
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover border border-white/10"
                          preload={false}
                          retryCount={2}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-white/5 border border-white/10" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-white group-hover:text-white">{item.title}</div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                          {item.categories.join(' • ')}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-white/40 group-hover:text-white/80 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && results.length === 0 && (
                <div className="p-12 text-center text-zinc-500">
                  <div className="text-lg font-light italic mb-3">No results found.</div>
                  <div className="text-sm">Try another keyword or choose a suggestion.</div>
                </div>
              )}

              {!searchQuery && (
                <div className="p-8">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-6">Suggestions</div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Photography', 'Development', 'Design', 'Branding', 'Luxury', 'E-commerce'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => { onSearch(tag); onClose(); }}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/20 bg-white/0 hover:bg-white/5 text-sm text-zinc-400 hover:text-white transition-all text-left"
                      >
                        <span className="uppercase tracking-widest">{tag}</span>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Spotlight Footer */}
            <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex justify-between items-center text-[10px] text-white/40 font-mono uppercase tracking-widest">
              <div className="flex gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
              </div>
              <span>Spotlight v1.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
