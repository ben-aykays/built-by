
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem } from '../types';
import { X, Globe, ArrowRight, ArrowUpRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface ProjectOverlayProps {
  project: PortfolioItem | null;
  onClose: () => void;
}

const ProjectOverlay: React.FC<ProjectOverlayProps> = ({ project, onClose }) => {
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex justify-end"
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Content Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full md:w-[85vw] lg:w-[70vw] h-full bg-brand-dark overflow-y-auto text-white border-l border-white/10"
          >
            <button 
              onClick={onClose}
              className="sticky top-8 right-8 float-right z-[110] p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors mr-8"
            >
              <X size={24} />
            </button>

            <div className="pt-32 px-8 md:px-20 pb-20">
              <header className="mb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                  <h1 className="text-[10vw] md:text-[6vw] font-display font-black uppercase tracking-tighter leading-[0.85]">
                    {project.title}
                  </h1>
                  <div className="text-right">
                    <span className="text-white/40 font-mono text-sm block mb-2">/ YEAR</span>
                    <span className="text-2xl font-light">{project.year}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/10 pt-12">
                  <div className="md:col-span-4 space-y-12">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">Discipline</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.categories.map(c => (
                          <span key={c} className="text-lg font-light">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">Client</h4>
                      <p className="text-lg font-light">{project.client}</p>
                    </div>
                  </div>

                  <div className="md:col-span-8">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-8">Brief</h4>
                    <p className={`${String(project.title).toLowerCase().includes('velocity') ? 'text-2xl md:text-3xl font-light text-zinc-300 leading-snug max-w-[60ch]' : 'text-xl md:text-3xl font-light text-zinc-300 leading-tight max-w-[65ch]'} mb-12`}>
                      {project.longDescription}
                    </p>
                    <a 
                      href={
                        String(project.title).toLowerCase().includes('velocity') && !project.link
                          ? 'https://builtby.aykays.com/velocity-gym/'
                          : (String(project.title).toLowerCase().includes('gifted') && !project.link
                              ? 'https://builtby.aykays.com/gifted-hands/'
                              : project.link)
                      } 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-bold border-b border-white/40 pb-2 hover:text-white transition-colors"
                    >
                      Visit Live Site <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </header>

              <div className="w-full bg-zinc-900 rounded-xl mb-20">
                <OptimizedImage
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-auto object-contain"
                  preload={true}
                  retryCount={3}
                  loading="eager"
                />
              </div>

              <div className="py-20 border-t border-white/5">
                <h2 className="text-3xl md:text-5xl font-display font-medium text-zinc-100 mb-8 italic">
                   The design approach focused on minimal interactions that evoke a sense of luxury.
                </h2>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectOverlay;
