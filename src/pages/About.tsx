import React from 'react';
import { motion } from 'motion/react';
import { Target, Eye, ShieldCheck, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase text-slate-900">
              Tentang <span className="text-blue-600">FabTech</span>
            </h1>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
              FabTech adalah perusahaan engineering yang fokus pada layanan desain CAD 3D, gambar teknik, dan fabrikasi mekanik. Kami melayani berbagai industri mulai dari manufaktur hingga startup produk.
            </p>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Kami telah menangani banyak proyek dari skala kecil hingga besar, membantu klien mewujudkan ide menjadi produk nyata. Tim kami terdiri dari engineer berpengalaman yang menguasai berbagai software CAD terkini dan memahami standar engineering internasional.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1">50+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Projects Done</p>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1">30+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Happy Clients</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
              <img 
                src="https://picsum.photos/seed/team/800/800" 
                alt="Our Team" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-blue-600 p-8 rounded-2xl shadow-2xl hidden md:block">
              <Award className="w-12 h-12 text-white" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white border border-slate-200 p-12 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold mb-6 text-slate-900">Visi Kami</h3>
            <p className="text-slate-600 leading-relaxed">
              Menjadi platform desain dan fabrikasi teknik yang membantu inovasi teknologi di Indonesia.
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-12 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold mb-6 text-slate-900">Misi Kami</h3>
            <p className="text-slate-600 leading-relaxed">
              Memberikan layanan desain engineering yang akurat, cepat, dan terjangkau bagi semua kalangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
