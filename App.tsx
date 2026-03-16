
import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchOverlay from './components/SearchOverlay';
import CustomCursor from './components/CustomCursor';
import Home from './pages/Home';
import { PortfolioItem } from './types';
import { imageLoader } from './utils/imageLoader';

const App: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<PortfolioItem[]>([]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch projects once and share across app
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
        imageUrl: imageUrl || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
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
            
          let extractedCats: string[] = [];
          
          if (Array.isArray(raw)) {
            extractedCats = raw
              .map((x: any) => {
                if (typeof x === 'string') return x;
                if (x && typeof x === 'object') {
                  return x.name || x.label || x.value || '';
                }
                return '';
              })
              .filter((s: string) => !!s);
          } else if (typeof raw === 'string') {
            extractedCats = raw
              .split(/[,\\n;]+/)
              .map(s => s.trim())
              .filter(Boolean);
          } else if (raw && typeof raw === 'object' && typeof raw.value === 'string') {
            extractedCats = [raw.value];
          }

          // Map raw specific disciplines to our main categories for the filter bar
          const mainCategories = new Set<string>();
          const rawStr = extractedCats.join(' ').toLowerCase() + ' ' + (title || '').toLowerCase();
          
          if (rawStr.match(/photo|art|creative|lens|frame|pop/)) mainCategories.add('Photography');
          if (rawStr.match(/design|luxury|beauty|wood|floor|material|aesthetic|style|gallery/)) mainCategories.add('Design');
          if (rawStr.match(/brand|legacy|logo|creative|agency/)) mainCategories.add('Branding');
          if (rawStr.match(/school|academy|gym|fitness|doctor|physio|medical|health|wellness|program|clinic|hospital|dev|tech/)) mainCategories.add('Development');
          
          // If no mapping found, randomly assign or default to Development/Design
          if (mainCategories.size === 0) {
            mainCategories.add('Development');
            if (Math.random() > 0.5) mainCategories.add('Design');
          }

          return Array.from(mainCategories);
        })(),
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
        const r = await fetch('https://tw.aykays.com/wp-json/wp/v2/projects?per_page=100&orderby=date&order=asc&_embed');
        const arr = await r.json();
        const mappedArr = Array.isArray(arr) ? await Promise.all(arr.map(mapToPortfolio)) : [];
        const mapped = mappedArr.filter(Boolean) as PortfolioItem[];
        setProjects(mapped);
        
        // Preload images for better performance
        if (mapped.length > 0) {
          // Preload first 6 images immediately (visible on page load)
          const immediateImages = mapped.slice(0, 6).map(p => p.imageUrl).filter(Boolean);
          imageLoader.preloadImages(immediateImages);
          
          // Preload remaining images after a delay
          setTimeout(() => {
            const remainingImages = mapped.slice(6).map(p => p.imageUrl).filter(Boolean);
            imageLoader.preloadImages(remainingImages);
          }, 2000);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <Router>
      <div className="bg-brand-dark bg-grid min-h-screen selection:bg-brand-red selection:text-white relative overflow-x-hidden text-white">
        <CustomCursor />
        
        {/* Dynamic Background Accents */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-white/5 rounded-full blur-[200px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[180px] pointer-events-none" />

        <Navbar onSearchOpen={() => setIsSearchOpen(true)} />
        
        <SearchOverlay 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)}
          onSearch={(q) => setSearchQuery(q)}
          searchQuery={searchQuery}
          projects={projects}
        />

        <main>
          <Home searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} allProjects={projects} />
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
