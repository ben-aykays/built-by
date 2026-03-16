
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data';
import ProjectCard from '../components/ProjectCard';
import ProjectOverlay from '../components/ProjectOverlay';
import { PortfolioItem } from '../types';
import { X, Filter, ArrowRight } from 'lucide-react';

const categories = ['All', 'Photography', 'Development', 'Design', 'Branding'] as const;

interface HomeProps {
  searchQuery: string;
  onClearSearch: () => void;
  allProjects?: PortfolioItem[];
}

const Home: React.FC<HomeProps> = ({ searchQuery, onClearSearch, allProjects: incomingProjects }) => {
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('All');
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [remoteProjects, setRemoteProjects] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const mediaCache: Record<number, string> = {};
    const normalize = (u: any) => {
      const s = typeof u === 'string' ? u : '';
      if (!s) return '';
      if (s.startsWith('http://')) return s.replace('http://', 'https://');
      if (s.startsWith('//')) return 'https:' + s;
      if (s.startsWith('/')) return 'https://tw.aykays.com' + s;
      return s;
    };
    const getMediaUrl = async (id?: number): Promise<string> => {
      if (!id || id <= 0) return '';
      if (mediaCache[id]) return mediaCache[id];
      try {
        const r = await fetch(`https://tw.aykays.com/wp-json/wp/v2/media/${id}`);
        const j = await r.json();
        const url = normalize(j?.source_url || '');
        if (url) mediaCache[id] = url;
        return url;
      } catch {
        return '';
      }
    };
    const mapToPortfolio = async (p: any): Promise<PortfolioItem | null> => {
      const acf = p?.acf || {};
      const title = acf.project_title || p?.title?.rendered;
      if (!title) return null;
      const imgCandidates = [
        acf.hero_image?.sizes?.large,
        acf.hero_image?.sizes?.medium_large,
        acf.hero_image?.sizes?.full,
        acf.hero_image?.url,
        typeof acf.hero_image === 'string' ? acf.hero_image : '',
        acf.project_image?.sizes?.large,
        acf.project_image?.sizes?.medium_large,
        acf.project_image?.sizes?.full,
        acf.project_image?.url,
        typeof acf.project_image === 'string' ? acf.project_image : '',
        acf.cover?.sizes?.large,
        acf.cover?.sizes?.medium_large,
        acf.cover?.sizes?.full,
        acf.cover?.url,
        typeof acf.cover === 'string' ? acf.cover : '',
        p?._embedded?.['wp:featuredmedia']?.[0]?.source_url
      ];
      let imageUrl = normalize(imgCandidates.find((x: any) => !!x) || '');
      if (!imageUrl) {
        const possibleIds: Array<number | undefined> = [
          typeof acf.hero_image === 'number' ? acf.hero_image : acf.hero_image?.id,
          typeof acf.project_image === 'number' ? acf.project_image : acf.project_image?.id,
          typeof acf.cover === 'number' ? acf.cover : acf.cover?.id
        ];
        for (const pid of possibleIds) {
          imageUrl = await getMediaUrl(pid);
          if (imageUrl) break;
        }
      }
      return {
        id: p?.slug || String(p?.id || title),
        title,
        shortDescription: acf.project_brief || '',
        longDescription: acf.project_description || acf.project_brief || '',
        link: (() => {
          const slug = (p?.slug || String(title || ''))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          const raw = acf.project_link || p?.link || '';
          const s = typeof raw === 'string' ? raw : '';
          const norm = (u: string) => {
            if (!u) return '';
            if (u.startsWith('http://')) return u.replace('http://', 'https://');
            if (u.startsWith('//')) return 'https:' + u;
            if (u.startsWith('/')) return 'https://builtby.aykays.com' + u;
            if (/^[a-z0-9.-]+\.[a-z]{2,}([/:].*)?$/i.test(u)) return `https://${u}`;
            return u;
          };
          const normalized = norm(s);
          const needsBuiltby =
            !normalized ||
            /tw\.aykays\.com/i.test(normalized) ||
            /\/projects\//i.test(normalized);
          if (needsBuiltby && slug) {
            return `https://builtby.aykays.com/${slug}/`;
          }
          return normalized;
        })(),
        categories: (() => {
          const keys = acf && typeof acf === 'object' ? Object.keys(acf) : [];
          const disciplineKey = keys.find(k => k.toLowerCase().includes('discipline'));
          const raw =
            (disciplineKey ? acf[disciplineKey] : undefined) ??
            acf.discipline ??
            acf.disciplines ??
            acf.services ??
            acf.categories;
          if (Array.isArray(raw)) {
            return raw
              .map((x: any) => {
                if (typeof x === 'string') return x;
                if (x && typeof x === 'object') {
                  return x.name || x.label || x.value || '';
                }
                return '';
              })
              .filter((s: string) => !!s);
          }
          if (typeof raw === 'string') {
            return raw
              .split(/[,\\n;]+/)
              .map(s => s.trim())
              .filter(Boolean);
          }
          if (raw && typeof raw === 'object' && typeof raw.value === 'string') {
            return [raw.value];
          }
          return ['Development'];
        })(),
        imageUrl,
        year: acf.project_year || '',
        client: (() => {
          const keys = acf && typeof acf === 'object' ? Object.keys(acf) : [];
          const clientKey = keys.find(k => k.toLowerCase().includes('client') || k.toLowerCase().includes('brand'));
          const v =
            (clientKey ? acf[clientKey] : undefined) ??
            acf.client ??
            acf.client_name ??
            acf.client_title ??
            acf.brand ??
            acf.company;
          if (typeof v === 'string') return v;
          if (v && typeof v === 'object') {
            return v.name || v.label || v.value || '';
          }
          return '';
        })()
      };
    };
    (async () => {
      try {
        const r = await fetch('https://tw.aykays.com/wp-json/wp/v2/projects?per_page=50&orderby=date&order=asc&_embed');
        const arr = await r.json();
        const mappedArr = Array.isArray(arr) ? await Promise.all(arr.map(mapToPortfolio)) : [];
        const mapped = mappedArr.filter(Boolean) as PortfolioItem[];
        setRemoteProjects(mapped);
      } catch {
        // silent
      }
    })();
  }, []);

  const allProjects = useMemo(() => {
    return (incomingProjects && incomingProjects.length > 0) ? incomingProjects : remoteProjects;
  }, [incomingProjects, remoteProjects]);

  const filteredProjects = useMemo(() => {
    let results = allProjects;
    
    if (activeCategory !== 'All') {
      const ac = activeCategory.toLowerCase();
      results = results.filter(p => 
        p.categories.some(c => (c || '').toLowerCase().includes(ac))
      );
    }
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.shortDescription.toLowerCase().includes(q) ||
        p.categories.some(c => c.toLowerCase().includes(q))
      );
    }
    
    return results;
  }, [activeCategory, searchQuery, allProjects]);

  // Handle URL hashes for direct project linking in single page
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/project/')) {
        const id = hash.replace('#/project/', '');
        const p = allProjects.find(item => item.id === id);
        if (p) setSelectedProject(p);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [allProjects]);

  return (
    <div className="pt-40 pb-24 min-h-screen">
      <ProjectOverlay 
        project={selectedProject} 
        onClose={() => {
          setSelectedProject(null);
          window.history.pushState("", document.title, window.location.pathname + window.location.search);
        }} 
      />

      {/* Hero Section */}
      <section className="px-6 md:px-12 mb-20 md:mb-40">
        <div className="relative">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          >
            <h1 className="text-[14vw] md:text-[10vw] font-display font-black leading-[0.8] uppercase tracking-tighter">
              Crafting <br />
              <span className="text-outline">Digital</span> <br />
              Pioneers.
            </h1>
          </motion.div>
          
          <div className="mt-20 flex flex-col md:flex-row justify-between items-start gap-12 border-t border-black/5 pt-12">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-xl md:text-2xl font-light text-zinc-400 max-w-2xl leading-relaxed"
            >
              We are a creative studio delivering world-class digital experiences for high-end luxury brands and innovative startups.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex gap-16 text-[10px] uppercase tracking-[0.3em] font-medium text-white/40"
            >
              <div>Role <br /><span className="text-white">Full Service</span></div>
              <div>Expertise <br /><span className="text-white">Interactive</span></div>
              <div>Location <br /><span className="text-white">Worldwide</span></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Controls: Category + Active Search Indicator */}
      <div className="sticky top-28 z-30 px-6 md:px-12 mb-20 pointer-events-none flex flex-col gap-4 items-start">
        <div className="flex items-center gap-4 p-2 bg-zinc-900/60 backdrop-blur-xl rounded-full border border-white/10 pointer-events-auto shadow-2xl">
          <div className="pl-4 pr-2 text-zinc-500 border-r border-white/10">
            <Filter size={14} />
          </div>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-500 ${
                  activeCategory === cat 
                  ? 'bg-white text-black scale-105' 
                  : 'text-zinc-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 text-white rounded-full pointer-events-auto shadow-xl border border-white/10"
            >
              <span className="text-[10px] uppercase tracking-widest font-bold">Showing results for: {searchQuery}</span>
              <button 
                onClick={onClearSearch} 
                className="hover:rotate-90 transition-transform p-1 bg-white/10 rounded-full"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid Section */}
      <section className="px-6 md:px-12">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-32"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, idx) => (
                <motion.div 
                  layout
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                >
                  <ProjectCard 
                    project={project} 
                    index={idx} 
                    onClick={(p) => setSelectedProject(p)}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-60 text-center"
              >
                <div className="max-w-md mx-auto">
                  <h3 className="text-zinc-600 text-3xl font-display font-black uppercase tracking-tighter mb-4 italic">No Pioneers Found.</h3>
                  <p className="text-zinc-500 font-light mb-12">We haven't built that yet, but we'd love to.</p>
                  <button 
                    onClick={() => { setActiveCategory('All'); onClearSearch(); }}
                    className="group inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-white py-4 px-8 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    Clear Filter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Work With Us CTA */}
      <section className="mt-60 px-6 md:px-12 text-center py-60 border-t border-white/5 relative bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent" />
        <h2 className="text-[12vw] md:text-[8vw] font-display font-black uppercase tracking-tighter mb-12 leading-none">
          Ready to <br /><span className="text-outline italic">evolve?</span>
        </h2>
        <a 
          href="mailto:hello@aykays.com" 
          className="group relative inline-flex items-center gap-6 text-2xl md:text-4xl font-light hover:text-zinc-400 transition-colors"
        >
          hello@aykays.com
          <div className="p-4 rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all rotate-45 group-hover:rotate-0">
             <ArrowRight size={24} />
          </div>
        </a>
      </section>
    </div>
  );
};

export default Home;
