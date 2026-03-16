
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { portfolioData } from '../data';
// Added ArrowUpRight to the imports from lucide-react
import { ArrowLeft, Globe, ArrowRight, ArrowUpRight } from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = portfolioData.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-display font-bold mb-4">Project Not Found</h1>
        <Link to="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Work
        </Link>
      </div>
    );
  }

  const currentIndex = portfolioData.findIndex(p => p.id === id);
  const nextProject = portfolioData[(currentIndex + 1) % portfolioData.length];

  return (
    <div className="bg-white min-h-screen text-brand-black">
      {/* Dynamic Header */}
      <section className="pt-40 px-6 md:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <h1 className="text-[12vw] md:text-[8vw] font-display font-black uppercase tracking-tighter leading-[0.85]">
              {project.title}
            </h1>
            <div className="text-right">
              <span className="text-brand-black/50 font-mono text-sm block mb-2">/ YEAR</span>
              <span className="text-2xl font-light">{project.year}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-black/5 pt-12">
            <div className="md:col-span-3 space-y-12">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-brand-black/50 mb-4">Discipline</h4>
                <div className="flex flex-col gap-2">
                  {project.categories.map(c => (
                    <span key={c} className="text-lg font-light">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-brand-black/50 mb-4">Client</h4>
                <p className="text-lg font-light">{project.client}</p>
              </div>
            </div>

            <div className="md:col-span-7 md:col-start-5">
              <h4 className="text-[10px] uppercase tracking-[0.4em] text-brand-black/50 mb-8">Brief</h4>
              <p className="text-2xl md:text-4xl font-light text-brand-black/80 leading-tight mb-12">
                {project.longDescription}
              </p>
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-bold border-b border-black pb-2 hover:text-brand-red transition-colors"
              >
                Visit Live Site <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Hero Image */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="px-6 md:px-0"
      >
        <div className="w-full bg-brand-gray md:rounded-none rounded-2xl">
          <OptimizedImage
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-auto object-contain"
            preload={true}
            retryCount={3}
            loading="eager"
          />
        </div>
      </motion.section>

      {/* Quote/Impact Section */}
      <section className="py-40 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-display font-medium text-center italic leading-tight text-zinc-100"
          >
            "Innovation is not just about technology, it's about shifting perspectives and creating emotional resonance."
          </motion.h2>
          <div className="mt-20 flex justify-center">
             <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Next Project Teaser */}
      <Link 
        to={`/project/${nextProject.id}`}
        className="group block relative h-[80vh] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
           <OptimizedImage
             src={nextProject.imageUrl}
             alt="Next project"
             className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 ease-out"
             preload={false}
             retryCount={2}
             loading="lazy"
           />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span className="text-[10px] uppercase tracking-[0.6em] text-zinc-400 mb-12 block">Up Next</span>
          <h2 className="text-6xl md:text-[10vw] font-display font-black uppercase tracking-tighter leading-none mb-12">
            {nextProject.title}
          </h2>
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.4em] font-bold">
            View Project <ArrowRight className="group-hover:translate-x-4 transition-transform duration-500" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProjectDetail;
