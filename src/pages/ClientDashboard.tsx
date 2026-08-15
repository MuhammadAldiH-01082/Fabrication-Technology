import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, AlertCircle, FileText, ExternalLink, Plus, X, MapPin, Link as LinkIcon, Calendar, User as UserIcon, Settings, LogOut, Save, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import FileUpload from '../components/FileUpload';
import { api } from '../services/api';

export default function ClientDashboard() {
  const { user, profile, updateProfileData } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [showSuccess, setShowSuccess] = useState<{show: boolean, type: 'cancel' | 'profile'}>({ show: false, type: 'cancel' });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    photoURL: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        photoURL: profile.photoURL || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const ordersData = await api.getOrders(user.uid);
        setOrders(ordersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Poll orders every 15s
    return () => clearInterval(interval);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfileData(profileForm);
      setShowSuccess({ show: true, type: 'profile' });
      setTimeout(() => setShowSuccess({ show: false, type: 'profile' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleCancelOrder = async (orderId: string) => {
    setIsCancelling(true);
    try {
      await api.updateOrder(orderId, {
        status: 'cancelled'
      });
      // Refresh local orders
      const ordersData = await api.getOrders(user!.uid);
      setOrders(ordersData);
      
      setSelectedOrder(null);
      setShowSuccess({ show: true, type: 'cancel' });
      setTimeout(() => setShowSuccess({ show: false, type: 'cancel' }), 3000);
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['completed', 'cancelled'].includes(order.status);
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'in_progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900">
                {activeTab === 'orders' ? 'My Projects' : 'My Profile'}
              </h1>
              <p className="text-slate-600">
                {activeTab === 'orders' 
                  ? 'Pantau progress dan hasil desain teknik Anda.' 
                  : 'Kelola informasi akun dan preferensi Anda.'}
              </p>
            </div>
            {activeTab === 'orders' && (
              <Link
                to="/order"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Link>
            )}
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center",
                activeTab === 'orders' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Package className="w-4 h-4 mr-2" /> Projects
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center",
                activeTab === 'profile' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <UserIcon className="w-4 h-4 mr-2" /> Profile
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'completed', 'cancelled'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                      filter === f 
                        ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              {orders.some(o => o.status === 'cancelled') && filter !== 'cancelled' && (
                <button 
                  onClick={() => setFilter('cancelled')}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  Lihat Pesanan Dibatalkan
                </button>
              )}
            </div>

            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-bold text-blue-700">Informasi Pembatalan:</span> Anda dapat membatalkan pesanan secara mandiri melalui tombol detail selama status pesanan masih <span className="italic">Pending</span> atau <span className="italic">Reviewing</span> (sebelum diterbitkan penawaran harga atau status <span className="font-bold text-blue-600">Quoted</span>).
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  {filter === 'all' ? 'Belum ada proyek' : `Tidak ada proyek dengan status ${filter}`}
                </h3>
                <p className="text-slate-500 mb-8">
                  {filter === 'all' 
                    ? 'Anda belum melakukan pemesanan desain atau fabrikasi.' 
                    : 'Coba ubah filter untuk melihat proyek lainnya.'}
                </p>
                {filter === 'all' && (
                  <Link to="/order" className="text-blue-600 font-bold hover:underline">Mulai Proyek Pertama Anda →</Link>
                )}
                {filter !== 'all' && (
                  <button onClick={() => setFilter('all')} className="text-blue-600 font-bold hover:underline">Lihat Semua Proyek →</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
                  >
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border", getStatusColor(order.status))}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {format(new Date(order.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 line-clamp-1 text-slate-900">{order.serviceType}</h3>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {order.description}
                      </p>
                      
                      {order.price && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Quotation</span>
                            {order.status === 'quoted' && (
                              <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                                Tagihan Tersedia
                              </span>
                            )}
                          </div>
                          <p className="text-xl font-black text-slate-900">Rp {order.price.toLocaleString()}</p>
                          {order.status === 'quoted' && (
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                            >
                              Bayar Sekarang
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex space-x-2">
                        {order.resultFiles.length > 0 && (
                          <button className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors" title="Download Results">
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center"
                      >
                        Details <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 overflow-hidden shrink-0 shadow-inner">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-10 h-10 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-2xl font-black text-slate-900 mb-1">{profile?.displayName || 'User'}</h2>
                    <p className="text-slate-500 font-medium">{profile?.email}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-600 border border-blue-600/20">
                      {profile?.role} Account
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Display Name</label>
                  <input 
                    type="text"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Your Name"
                  />
                </div>

                <div className="space-y-4">
                  <FileUpload 
                    label="Profile Photo"
                    path={`profiles/${user.uid}`}
                    currentUrl={profileForm.photoURL}
                    onUploadComplete={(url) => setProfileForm({...profileForm, photoURL: url})}
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-normal">
                    Or use a direct link (Optional)
                  </p>
                  <input 
                    type="url"
                    value={profileForm.photoURL}
                    onChange={(e) => setProfileForm({...profileForm, photoURL: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-grow bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isSavingProfile ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 p-6 bg-white border border-slate-200 border-dashed rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex items-start gap-4">
                <Settings className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm">Account Info</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
                    Created: {profile?.createdAt ? format(new Date(profile.createdAt), 'dd MMM yyyy') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showSuccess.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl max-w-sm w-full"
              >
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 relative",
                  showSuccess.type === 'cancel' 
                    ? "bg-red-500/10 border-red-500/20" 
                    : "bg-green-500/10 border-green-500/20"
                )}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className={cn(
                      "absolute inset-0 rounded-full opacity-20",
                      showSuccess.type === 'cancel' ? "bg-red-500" : "bg-green-500"
                    )}
                  />
                  <motion.div
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="relative z-10"
                  >
                    {showSuccess.type === 'cancel' ? (
                      <X className="w-12 h-12 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    )}
                  </motion.div>
                </div>
                <h2 className="text-3xl font-black mb-3 text-white">
                  {showSuccess.type === 'cancel' ? 'Pesanan Dibatalkan' : 'Profil Diperbarui'}
                </h2>
                <p className="text-slate-400 text-base max-w-[250px] mx-auto leading-relaxed">
                  {showSuccess.type === 'cancel' 
                    ? 'Permintaan pembatalan Anda telah berhasil diproses.' 
                    : 'Informasi profil Anda telah berhasil disimpan.'}
                </p>
                <button 
                  onClick={() => setShowSuccess({ ...showSuccess, show: false })}
                  className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  Tutup
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                  <h2 className="text-xl font-bold">Project Details</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Service Type</label>
                      <p className="font-bold text-lg">{selectedOrder.serviceType}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Status</label>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border inline-block", getStatusColor(selectedOrder.status))}>
                        {selectedOrder.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Project Description</label>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                      {selectedOrder.description}
                    </p>
                  </div>

                  {selectedOrder.referenceUrl && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Reference Document</label>
                      <a 
                        href={selectedOrder.referenceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline text-sm font-bold"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        View Reference File
                      </a>
                    </div>
                  )}

                  {selectedOrder.shippingAddress && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Shipping Address</label>
                      <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <MapPin className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.resultFiles && selectedOrder.resultFiles.length > 0 && (
                    <div className="pt-6 border-t border-slate-800">
                      <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 block mb-3">Project Results / Delivery</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedOrder.resultFiles.map((file, i) => (
                          <a 
                            key={i} 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl text-white hover:bg-blue-600/20 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mr-3 group-hover:bg-blue-600 transition-colors">
                              <FileText className="w-4 h-4 text-blue-400 group-hover:text-white" />
                            </div>
                            <div className="flex-grow truncate">
                              <p className="text-xs font-bold truncate">{file.name}</p>
                              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Download File</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Requested Deadline</label>
                      <div className="flex items-center text-sm text-slate-300">
                        <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                        {selectedOrder.deadline}
                      </div>
                    </div>
                    {selectedOrder.price && (
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Total Quotation</label>
                        <p className="text-xl font-black text-white">Rp {selectedOrder.price.toLocaleString()}</p>
                        {selectedOrder.status === 'quoted' && (
                          <div className="mt-4 p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl">
                            <h4 className="text-sm font-bold text-blue-500 mb-2">Instruksi Pembayaran</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Silakan lakukan pembayaran ke rekening berikut:<br/>
                              <span className="font-bold text-white">Bank BCA: 1234567890</span><br/>
                              <span className="font-bold text-white">A/N: FabTech Engineering</span><br/>
                              Setelah transfer, silakan hubungi admin melalui chatbot untuk konfirmasi.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedOrder.resultFiles.length > 0 && (
                    <div className="pt-6 border-t border-slate-800">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-4">Deliverables / Result Files</label>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedOrder.resultFiles.map((file, idx) => (
                          <a 
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-600/50 transition-colors group"
                          >
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-blue-600 mr-3" />
                              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{file.name}</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'reviewing') && (
                      <button 
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        disabled={isCancelling}
                        className="text-red-500 hover:text-red-400 disabled:text-slate-600 text-sm font-bold transition-colors flex items-center"
                      >
                        {isCancelling ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <X className="w-4 h-4 mr-1" />
                        )}
                        {isCancelling ? 'Memproses...' : 'Batalkan Pesanan'}
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-2 rounded-xl font-bold text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
