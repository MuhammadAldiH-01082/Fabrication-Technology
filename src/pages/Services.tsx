import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Box, FileText, Activity, Settings, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EngineeringService } from '../types';
import { AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function Services() {
  const [services, setServices] = useState<EngineeringService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<EngineeringService | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await api.getServices();
        setServices(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Box': return Box;
      case 'FileText': return FileText;
      case 'Activity': return Activity;
      case 'Settings': return Settings;
      default: return Box;
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase font-display text-blue-900"
          >
            Layanan Kami
          </motion.h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Kami menyediakan solusi teknik komprehensif mulai dari konsep desain hingga realisasi produk.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[1, 2].map(i => (
              <div key={i} className="h-96 bg-white border border-slate-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, i) => {
              const Icon = getIcon(service.icon);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden group hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.color || 'bg-blue-50 text-blue-900'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-blue-900">{service.title}</h2>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow line-clamp-3">{service.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.capabilities?.slice(0, 4).map((f, j) => (
                        <li key={j} className="flex items-center text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link 
                      to="/order" 
                      className="w-full inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      Pesan Sekarang
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedService(null)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="p-8 md:p-12">
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-slate-100 rounded-full text-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${selectedService.color || 'bg-blue-600/10 text-blue-600'}`}>
                    {React.createElement(getIcon(selectedService.icon), { className: "w-8 h-8" })}
                  </div>

                  <h2 className="text-4xl font-black mb-4 uppercase tracking-tight text-slate-900">{selectedService.title}</h2>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed">{selectedService.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Key Capabilities</h4>
                      <ul className="space-y-4">
                        {selectedService.capabilities?.map((f, j) => (
                          <li key={j} className="flex items-start text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Engineering Tools</h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedService.software?.map((s, j) => (
                          <span key={j} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
                    <Link 
                      to="/order" 
                      className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all text-center shadow-lg shadow-blue-500/20"
                    >
                      Mulai Proyek Sekarang
                    </Link>
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="px-10 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-all"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
