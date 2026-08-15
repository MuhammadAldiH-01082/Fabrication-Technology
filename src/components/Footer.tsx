import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, Instagram, MapPin } from 'lucide-react';
import { EngineeringService } from '../types';
import { api } from '../services/api';

export default function Footer() {
  const [services, setServices] = useState<EngineeringService[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await api.getServices();
        setServices(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching footer services:', error);
      }
    };
    fetchServices();
  }, []);

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Cpu className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">
                Fab<span className="text-blue-600">Tech</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mewujudkan ide teknik menjadi produk nyata melalui desain profesional dan fabrikasi presisi. Studio engineering terpercaya untuk riset dan industri.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-4">
              {services.length > 0 ? (
                services.map((service) => (
                  <li key={service.id}>
                    <Link to="/services" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                      {service.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/services" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">3D CAD Modeling</Link></li>
                  <li><Link to="/services" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">2D Engineering Drawing</Link></li>
                  <li><Link to="/services" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Mechanical Simulation</Link></li>
                  <li><Link to="/services" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Prototype Fabrication</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/portfolio" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Portfolio</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <span>Jl. Ploso I No.4, Rangkah, Kec. Tambaksari, Surabaya, Jawa Timur 60133</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400 text-sm">
                <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>081231925683</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>adamnabil37337@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} FabTech Engineering Studio. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-slate-500 hover:text-slate-400 text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-slate-400 text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
