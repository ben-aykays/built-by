
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black px-6 md:px-12 pt-32 pb-12 border-t border-white/10 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-32">
        <div>
          <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-12">
            Let's build the <br /><span className="text-outline-white">Future</span>
          </h2>
          <a 
            href="mailto:hello@aykays.com"
            className="group flex items-center gap-6 text-2xl md:text-4xl font-light hover:text-white/70 transition-colors"
          >
            hello@aykays.com
            <div className="p-4 rounded-full border border-white/20 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">
              <ArrowUpRight size={24} />
            </div>
          </a>
        </div>
        
        <div className="grid grid-cols-2 gap-12 self-end">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-6">Social</h4>
            <ul className="space-y-4 text-sm font-medium text-white/70">
              <li><a href="https://www.facebook.com/AykaysAgency" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="https://www.instagram.com/aykaysagency" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://linkedin.com/company/aykays" className="hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="https://twitter.com/aykaysagency" className="hover:text-white transition-colors">X (Twitter)</a></li>
              <li><a href="https://whatsapp.com/channel/0029VbAakSLA89MZ9IVLhu0c" className="hover:text-white transition-colors">Whatsapp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-6">Office</h4>
            <ul className="space-y-4 text-sm font-light text-white/60">
              <li>Bunglow # R-10, </li>
              <li>Row 7, Block 10-A, </li>
              <li>Gulshan-e-Iqbal, Karachi.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-12 text-[10px] uppercase tracking-widest text-white/40">
        <p>© 2026 Aykays — All rights reserved.</p>
        <a href="https://builtby.aykays.com" target="_blank" rel="noopener noreferrer" className="mt-4 md:mt-0 hover:text-white transition-colors">A project by builtby.aykays.com</a>
      </div>
    </footer>
  );
};

export default Footer;
