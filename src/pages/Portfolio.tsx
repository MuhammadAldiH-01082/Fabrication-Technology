import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Tag, X, Calendar, Layers } from 'lucide-react';
import { PortfolioItem } from '../types';
import { AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function Portfolio() {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await api.getPortfolio();
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase text-slate-900"
          >
            Our <span className="text-blue-600">Portfolio</span>
          </motion.h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Kumpulan proyek yang telah kami selesaikan untuk klien mahasiswa, peneliti, dan industri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden group hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={project.image || project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white/80 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {project.year}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{project.category}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.software.map((s, j) => (
                    <span key={j} className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter border border-slate-100 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  View Case Study <ExternalLink className="ml-1 w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedProject && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              >
                <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                  <img 
                    src={selectedProject.image || selectedProject.imageUrl} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent md:hidden"></div>
                </div>
                
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-slate-100 rounded-full text-slate-900 transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-3 mb-6">
                    <span className="bg-blue-600/10 text-blue-600 border border-blue-600/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedProject.category}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> {selectedProject.year}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight text-slate-900">{selectedProject.title}</h2>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center">
                        <Layers className="w-3 h-3 mr-2" /> Project Overview
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Software & Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.software.map((s, j) => (
                          <span key={j} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <p className="text-slate-400 text-xs italic mb-6">
                      *Proyek ini dikerjakan sesuai dengan standar teknik yang berlaku dan telah melalui tahap validasi desain.
                    </p>
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                    >
                      Close Case Study
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {projects.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-slate-500">Belum ada proyek portofolio yang ditampilkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
