import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EngineeringService } from '../types';
import { motion } from 'motion/react';
import { Send, Info, CheckCircle, FileText, Trash2, Paperclip } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { cn } from '../lib/utils';
import { api } from '../services/api';

export default function Order() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availableServices, setAvailableServices] = useState<EngineeringService[]>([]);

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    deadline: '',
    shippingAddress: '',
    referenceUrl: '',
    files: [] as { name: string, url: string }[],
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await api.getServices();
        setAvailableServices(services);
        if (services.length > 0 && !formData.serviceType) {
          setFormData(prev => ({ ...prev, serviceType: services[0].title }));
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await api.createOrder({
        uid: user.uid,
        clientName: profile?.displayName || user.displayName || 'Guest',
        clientEmail: user.email,
        serviceType: formData.serviceType,
        description: formData.description,
        deadline: formData.deadline,
        shippingAddress: formData.shippingAddress,
        referenceUrl: formData.referenceUrl,
        files: formData.files,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-slate-200 p-12 rounded-3xl text-center max-w-md mx-auto shadow-xl"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Order Berhasil!</h2>
          <p className="text-slate-600 mb-8">Permintaan Anda telah kami terima. Admin akan segera meninjau proyek Anda.</p>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-blue-600"
            />
          </div>
          <p className="text-xs text-slate-400 mt-4">Mengalihkan ke dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="bg-blue-600 p-8 text-white">
            <h1 className="text-3xl font-black tracking-tight uppercase">Order Service</h1>
            <p className="font-medium opacity-80">Lengkapi detail proyek teknik Anda di bawah ini.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Jenis Layanan</label>
                <select 
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                >
                  {availableServices.length > 0 ? (
                    availableServices.map(s => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))
                  ) : (
                    <>
                      <option>3D CAD Design</option>
                      <option>2D Engineering Drawing</option>
                      <option>Mechanical Simulation</option>
                      <option>Prototype Fabrication</option>
                    </>
                  )}
                  <option value="Custom Engineering Project">Custom Engineering Project</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Deadline Target</label>
                <input 
                  type="date" 
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Deskripsi Proyek</label>
              <textarea 
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Jelaskan detail proyek, spesifikasi teknis, atau instruksi khusus..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">File Referensi / Dokumen</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload 
                  path={`orders/${user.uid}/temp`}
                  accept=".pdf,.doc,.docx,.zip,.jpg,.png,.step,.stp,.iges"
                  onUploadComplete={(url) => {
                    const fileName = url.split('/').pop()?.split('?')[0] || 'Document';
                    setFormData(prev => ({
                      ...prev,
                      files: [...prev.files, { name: fileName.split('-').slice(1).join('-'), url }]
                    }));
                  }}
                />
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded Files</p>
                  {formData.files.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                      <Paperclip className="w-5 h-5 mb-1" />
                      <p className="text-[10px] font-bold">No files yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {formData.files.map((file, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex items-center space-x-2 truncate">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs text-slate-600 truncate">{file.name}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              files: prev.files.filter((_, idx) => idx !== i)
                            }))}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Link Referensi (Opsional)</label>
              <input 
                type="url" 
                value={formData.referenceUrl}
                onChange={(e) => setFormData({...formData, referenceUrl: e.target.value})}
                placeholder="https://drive.google.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alamat Pengiriman (Jika Membutuhkan Produk Fisik)</label>
              <textarea 
                rows={3}
                value={formData.shippingAddress}
                onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                placeholder="Nama Penerima, No HP, Alamat Lengkap..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Setelah submit, Admin akan meninjau permintaan Anda dan mengirimkan penawaran harga (Quotation) melalui dashboard dan email. Anda bisa mengunggah file referensi di dashboard setelah order dibuat.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Kirim Permintaan Order
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
