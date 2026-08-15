import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Box, FileText, Activity, Settings, CheckCircle, Star, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { EngineeringService, PortfolioItem } from '../types';
import { AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function Home() {
  const [services, setServices] = useState<EngineeringService[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedService, setSelectedService] = useState<EngineeringService | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesData = await api.getServices();
        setServices(servicesData.slice(0, 4));
        
        const portfolioData = await api.getPortfolio();
        setPortfolio(portfolioData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };

    fetchData();
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
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000"
            alt="Manufacturing Process"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-900/90"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-4 font-display text-white">
              FabTech
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold tracking-[0.2em] text-white/90 mb-12 uppercase">
              DESIGN & FABRICATION
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Mengubah ide menjadi desain teknik yang presisi dan produk nyata.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
              <Link
                to="/order"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center group transition-all shadow-xl shadow-blue-900/40"
              >
                Mulai Proyek Sekarang
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/portfolio"
                className="bg-transparent hover:bg-white/10 border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all"
              >
                Lihat Portfolio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000" 
                  alt="Engineering Work" 
                  className="w-full aspect-[4/3] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl -z-10"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-blue-900 mb-8 font-display">
                Tentang FabTech
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  FabTech adalah perusahaan engineering yang fokus pada layanan desain CAD 3D, gambar teknik, dan fabrikasi mekanik. Kami melayani berbagai industri mulai dari manufaktur hingga startup produk.
                </p>
                <p>
                  Kami telah menangani banyak proyek dari skala kecil hingga besar, membantu klien mewujudkan ide menjadi produk nyata. Tim kami terdiri dari engineer berpengalaman yang menguasai berbagai software CAD terkini dan memahami standar engineering internasional.
                </p>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-1">Visi Kami</h4>
                    <p className="text-slate-500 text-sm">Menjadi platform desain dan fabrikasi teknik yang membantu inovasi teknologi di Indonesia.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-1">Misi Kami</h4>
                    <p className="text-slate-500 text-sm">Memberikan layanan desain engineering yang akurat, cepat, dan terjangkau bagi semua kalangan.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">Layanan Utama</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Solusi engineering end-to-end untuk kebutuhan akademis dan industri kecil.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.length > 0 ? (
              services.map((service, i) => {
                const Icon = getIcon(service.icon);
                return (
                  <motion.div
                    key={service.id}
                    whileHover={{ y: -10 }}
                    className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col"
                  >
                    <Icon className={cn("w-12 h-12 mb-6 transition-transform group-hover:scale-110", service.color || "text-blue-600")} />
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{service.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">{service.description}</p>
                    <button 
                      onClick={() => setSelectedService(service)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center"
                    >
                      Lihat Detail <ArrowRight className="ml-1 w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })
            ) : (
              [
                { icon: Box, title: '3D CAD Design', desc: 'SolidWorks, Inventor, Fusion 360 modeling.', color: 'text-blue-600' },
                { icon: FileText, title: '2D Drawing', desc: 'Engineering & manufacturing drawing standards.', color: 'text-blue-600' },
                { icon: Activity, title: 'Simulation', desc: 'ANSYS mechanical & structural analysis.', color: 'text-green-600' },
                { icon: Settings, title: 'Fabrication', desc: 'Prototype development & mechanical systems.', color: 'text-purple-600' },
              ].map((service, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                >
                  <service.icon className={cn("w-12 h-12 mb-6 transition-transform group-hover:scale-110", service.color)} />
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{service.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{service.desc}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

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
                className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="p-8 md:p-12">
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="absolute top-6 right-6 p-2 bg-slate-950/50 hover:bg-slate-800 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${selectedService.color || 'bg-blue-600/10 text-blue-600'}`}>
                    {React.createElement(getIcon(selectedService.icon), { className: "w-8 h-8" })}
                  </div>

                  <h2 className="text-3xl font-bold mb-4">{selectedService.title}</h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">{selectedService.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Capabilities</h4>
                      <ul className="space-y-3">
                        {selectedService.capabilities?.map((f, j) => (
                          <li key={j} className="flex items-center text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Software / Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.software?.map((s, j) => (
                          <span key={j} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link 
                      to="/order" 
                      className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-center"
                    >
                      Order Now
                    </Link>
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="px-8 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Portfolio Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-blue-900 mb-4 tracking-tighter font-display uppercase">
              Portfolio Kami
            </h2>
            <p className="text-slate-500 text-lg">Beberapa proyek unggulan yang telah kami selesaikan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {portfolio.length > 0 ? (
              portfolio.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-[2rem] aspect-[4/5]"
                >
                  <img 
                    src={project.image || project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/20 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <span className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2 block">{project.category}</span>
                    <h3 className="text-white text-2xl font-bold leading-tight">{project.title}</h3>
                  </div>
                </motion.div>
              ))
            ) : (
              [1, 2, 3].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-200 animate-pulse rounded-[2rem]"></div>
              ))
            )}
          </div>

          <div className="text-center">
            <Link 
              to="/portfolio"
              className="inline-flex items-center text-blue-600 font-bold hover:underline group"
            >
              Lihat Semua Portfolio <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter font-display uppercase">
              Mengapa Memilih Kami
            </h2>
            <p className="text-slate-400 text-lg">Keunggulan dalam setiap aspek engineering dan fabrikasi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              "Desain engineering yang presisi",
              "Pemodelan CAD profesional",
              "Dari konsep hingga fabrikasi",
              "Konsultasi gratis",
              "Harga terjangkau"
            ].map((point, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex items-center space-x-6 hover:bg-slate-800/50 transition-all",
                  i === 4 ? "md:col-span-2" : ""
                )}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">{point}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter font-display uppercase">
            Punya ide untuk mesin atau produk?
          </h2>
          <p className="text-blue-200/80 text-xl md:text-2xl mb-12">Kami membantu mendesain dan membuatnya.</p>
          <Link
            to="/order"
            className="inline-flex items-center bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-2xl shadow-blue-950/50"
          >
            Mulai Proyek Sekarang
            <ArrowRight className="ml-3 w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
