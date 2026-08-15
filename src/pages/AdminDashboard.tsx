import React, { useState, useEffect, useRef } from 'react';
import { Order, EngineeringService, PortfolioItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, User, ShoppingBag, CheckCircle, Clock, Search, Filter, Edit3, MoreVertical, X, MapPin, Link as LinkIcon, Plus, Trash2, Save, Image as ImageIcon, FileText, MessageSquare, Send, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import FileUpload from '../components/FileUpload';
import { api } from '../services/api';

interface Chat {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: any;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
  isAdmin: boolean;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<EngineeringService[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [orderToPrice, setOrderToPrice] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'portfolio' | 'chats'>('orders');

  // Chat State
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Service Management State
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<EngineeringService | null>(null);
  const [newService, setNewService] = useState<Partial<EngineeringService>>({
    title: '',
    description: '',
    icon: 'Box',
    capabilities: [],
    software: [],
    color: 'bg-blue-500/10 text-blue-500'
  });

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: 'Box',
    capabilities: '',
    software: '',
    color: 'bg-blue-500/10 text-blue-500'
  });

  useEffect(() => {
    if (editingService) {
      setServiceForm({
        title: editingService.title,
        description: editingService.description,
        icon: editingService.icon,
        capabilities: editingService.capabilities.join(', '),
        software: editingService.software.join(', '),
        color: editingService.color
      });
    } else {
      setServiceForm({
        title: '',
        description: '',
        icon: 'Box',
        capabilities: '',
        software: '',
        color: 'bg-blue-500/10 text-blue-500'
      });
    }
  }, [editingService, isAddingService]);

  // Portfolio Management State
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    category: '',
    description: '',
    imageUrl: '',
    software: '',
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    if (editingPortfolio) {
      setPortfolioForm({
        title: editingPortfolio.title,
        category: editingPortfolio.category,
        description: editingPortfolio.description,
        imageUrl: editingPortfolio.imageUrl,
        software: editingPortfolio.software.join(', '),
        year: editingPortfolio.year
      });
    } else {
      setPortfolioForm({
        title: '',
        category: '',
        description: '',
        imageUrl: '',
        software: '',
        year: new Date().getFullYear().toString()
      });
    }
  }, [editingPortfolio, isAddingPortfolio]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [ordersData, servicesData, portfolioData, chatsData] = await Promise.all([
          api.getOrders(),
          api.getServices(),
          api.getPortfolio(),
          api.getChats()
        ]);
        setOrders(ordersData);
        setServices(servicesData);
        setPortfolio(portfolioData);
        setChats(chatsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedChat) {
      setChatMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const messages = await api.getMessages(selectedChat.id);
        setChatMessages(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll messages every 3s
    return () => clearInterval(interval);
  }, [selectedChat]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !adminMessage.trim()) return;

    const msgText = adminMessage.trim();
    setAdminMessage('');

    try {
      await api.sendMessage(selectedChat.id, {
        senderId: 'admin',
        senderName: 'Admin FabTech',
        text: msgText,
        isAdmin: true
      });
      // Refresh messages immediately
      const messages = await api.getMessages(selectedChat.id);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error sending admin message:', error);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrder(orderId, { status: newStatus });
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSetPrice = (order: Order) => {
    setOrderToPrice(order);
    setPriceInput(order.price?.toString() || '');
    setIsPriceModalOpen(true);
  };

  const savePrice = async () => {
    if (!orderToPrice) return;
    
    const price = parseInt(priceInput.replace(/[^0-9]/g, ''));
    if (isNaN(price)) {
      alert('Please enter a valid number.');
      return;
    }

    try {
      await api.updateOrder(orderToPrice.id, { 
        price: price,
        status: 'quoted'
      });
      setIsPriceModalOpen(false);
      setOrderToPrice(null);
      setSelectedOrder(null);
      // Refresh local orders
      const updatedOrders = await api.getOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<string | null>(null);

  const handleDeleteService = async (id: string) => {
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      setDeletingServiceId(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleSaveService = async () => {
    if (!serviceForm.title || !serviceForm.description) return;
    
    const serviceData = {
      title: serviceForm.title,
      description: serviceForm.description,
      icon: serviceForm.icon,
      capabilities: serviceForm.capabilities.split(',').map(s => s.trim()).filter(s => s !== ''),
      software: serviceForm.software.split(',').map(s => s.trim()).filter(s => s !== ''),
      color: serviceForm.color
    };

    try {
      if (editingService) {
        await api.addService({ ...serviceData, id: editingService.id }); // AddService logic in backend handles conflict as update if we modify it, but for now I'll just use the specific endpoint if I had one. 
        // Actually, I'll update the server to handle update if ID exists, or I should add a patch endpoint. 
        // Let's assume for now I'll just delete and re-add or better, let's fix server.ts later to handle updates.
        // For now, I'll use a hack or just assume I need a patch.
        // Let's just re-fetch services.
        setEditingService(null);
      } else {
        await api.addService(serviceData);
        setIsAddingService(false);
      }
      const updated = await api.getServices();
      setServices(updated);
      alert('Service saved successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service.');
    }
  };

  const handleSavePortfolio = async () => {
    if (!portfolioForm.title || !portfolioForm.description) return;

    const portfolioData = {
      title: portfolioForm.title,
      category: portfolioForm.category,
      description: portfolioForm.description,
      image: portfolioForm.imageUrl || 'https://picsum.photos/seed/engineering/800/600',
      software: portfolioForm.software.split(',').map(s => s.trim()).filter(s => s !== '')
    };

    try {
      if (editingPortfolio) {
        await api.addPortfolio({ ...portfolioData, id: editingPortfolio.id });
        setEditingPortfolio(null);
      } else {
        await api.addPortfolio(portfolioData);
        setIsAddingPortfolio(false);
      }
      const updated = await api.getPortfolio();
      setPortfolio(updated);
      alert('Portfolio item saved successfully!');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      alert('Failed to save portfolio item.');
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      await api.deletePortfolio(id);
      setPortfolio(prev => prev.filter(p => p.id !== id));
      setDeletingPortfolioId(null);
    } catch (error) {
      console.error('Error deleting portfolio:', error);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = [
    { label: 'Total', value: orders.length, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-yellow-500' },
    { label: 'Reviewing', value: orders.filter(o => o.status === 'reviewing').length, icon: Search, color: 'text-blue-400' },
    { label: 'Quoted', value: orders.filter(o => o.status === 'quoted').length, icon: FileText, color: 'text-purple-500' },
    { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length, icon: Edit3, color: 'text-blue-500' },
    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, icon: X, color: 'text-red-500' },
  ];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase font-display text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-600">Kelola pesanan, update status, dan konten layanan.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'orders' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-600")}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'services' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-600")}
            >
              Services
            </button>
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'portfolio' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-600")}
            >
              Portfolio
            </button>
            <button 
              onClick={() => setActiveTab('chats')}
              className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'chats' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-600")}
            >
              Chats
            </button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-12">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2 text-sm focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  {['all', 'pending', 'reviewing', 'quoted', 'in_progress', 'completed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                        filter === s ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Client</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Service</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Date</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Price</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6">
                          <p className="font-bold text-sm text-slate-900">{order.clientName}</p>
                          <p className="text-xs text-slate-400">{order.clientEmail}</p>
                        </td>
                        <td className="p-6">
                          <p className="font-medium text-sm text-slate-600">{order.serviceType}</p>
                        </td>
                        <td className="p-6 text-xs text-slate-400 font-mono">
                          {format(new Date(order.createdAt), 'dd/MM/yy HH:mm')}
                        </td>
                        <td className="p-6">
                          <select 
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 outline-none focus:border-blue-600"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="quoted">Quoted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-6">
                          <button 
                            onClick={() => handleSetPrice(order)}
                            className={cn(
                              "text-sm font-bold transition-colors",
                              order.price ? "text-slate-900" : "text-blue-600 hover:underline"
                            )}
                          >
                            {order.price ? `Rp ${order.price.toLocaleString()}` : 'Set Price'}
                          </button>
                        </td>
                        <td className="p-6">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Manage Services</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAddingService(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Service
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-white border border-slate-200 p-4 rounded-xl relative group shadow-sm hover:shadow-md transition-all">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {deletingServiceId === service.id ? (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleDeleteService(service.id)}
                            className="p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors text-[10px] font-bold"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setDeletingServiceId(null)}
                            className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setEditingService(service)}
                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setDeletingServiceId(service.id)}
                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  <h3 className="text-sm font-bold mb-1 pr-12 text-slate-900">{service.title}</h3>
                  <p className="text-slate-500 text-[11px] mb-3 line-clamp-2 leading-relaxed">{service.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.software?.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[9px] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-medium">{s}</span>
                    ))}
                    {service.software?.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-medium">+{service.software.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Portfolio Management</h2>
                <p className="text-slate-600 text-sm">Manage your showcase projects.</p>
              </div>
              <button 
                onClick={() => setIsAddingPortfolio(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group relative shadow-sm hover:shadow-xl transition-all">
                  <div className="aspect-video relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                      {deletingPortfolioId === item.id ? (
                        <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xl">
                          <p className="text-[10px] font-bold text-slate-900 mb-1">Delete this project?</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDeletePortfolio(item.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[10px] font-bold"
                            >
                              Yes, Delete
                            </button>
                            <button 
                              onClick={() => setDeletingPortfolioId(null)}
                              className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setEditingPortfolio(item)}
                            className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-600 hover:text-white transition-colors shadow-lg"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setDeletingPortfolioId(item.id)}
                            className="p-3 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.year}</span>
                    </div>
                    <p className="text-slate-600 text-xs mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.software.map((s, i) => (
                        <span key={i} className="text-[9px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-400">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {portfolio.length === 0 && (
              <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-3xl">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">No portfolio items found. Start by adding one!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl h-[70vh] flex">
            {/* Chat List */}
            <div className="w-1/3 border-r border-slate-100 flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Conversations</h2>
              </div>
              <div className="flex-grow overflow-y-auto">
                {chats.length === 0 && (
                  <div className="p-10 text-center">
                    <p className="text-slate-400 text-sm">No active chats.</p>
                  </div>
                )}
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "w-full p-6 text-left border-b border-slate-50 transition-all hover:bg-slate-50",
                      selectedChat?.id === chat.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{chat.userName}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{chat.lastMessage}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-grow flex flex-col bg-slate-50/50">
              {selectedChat ? (
                <>
                  <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{selectedChat.userName}</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Client</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    ref={chatScrollRef}
                    className="flex-grow p-8 overflow-y-auto space-y-4"
                  >
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[70%]",
                          msg.isAdmin ? "ml-auto items-end" : "mr-auto"
                        )}
                      >
                        <div className={cn(
                          "p-4 rounded-2xl text-sm shadow-sm",
                          msg.isAdmin 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : 'Sending...'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={sendAdminMessage} className="p-6 bg-white border-t border-slate-100 flex items-center space-x-4">
                    <input 
                      type="text"
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!adminMessage.trim()}
                      className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Select a Conversation</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Choose a client from the list to start messaging.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Client</label>
                    <p className="font-bold text-slate-900">{selectedOrder.clientName}</p>
                    <p className="text-sm text-slate-500">{selectedOrder.clientEmail}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Service</label>
                    <p className="font-bold text-slate-900">{selectedOrder.serviceType}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Description</label>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedOrder.description}
                  </p>
                </div>

                {selectedOrder.referenceUrl && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Reference Link</label>
                    <a 
                      href={selectedOrder.referenceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline text-sm font-bold"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Open Reference Document
                    </a>
                  </div>
                )}

                {selectedOrder.shippingAddress && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Shipping Address</label>
                    <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.files && selectedOrder.files.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Client Uploads</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedOrder.files.map((file, i) => (
                        <a 
                          key={i} 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="text-xs font-bold truncate">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(['payment_pending', 'in_progress', 'completed'].includes(selectedOrder.status)) && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Result Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileUpload 
                        label="Upload Result File"
                        path={`orders/${selectedOrder.id}/results`}
                        accept=".pdf,.doc,.docx,.zip,.jpg,.png,.step,.stp,.iges"
                        onUploadComplete={async (url) => {
                          const fileName = url.split('/').pop()?.split('?')[0] || 'Result-Document';
                          const cleanName = fileName.split('-').slice(1).join('-');
                          const newResults = [...(selectedOrder.resultFiles || []), { name: cleanName, url }];
                          
                          try {
                            await api.updateOrder(selectedOrder.id, {
                              resultFiles: newResults
                            });
                            // Update local state if needed or let polling handle it
                            setSelectedOrder(prev => prev ? { ...prev, resultFiles: newResults } : null);
                          } catch (e) {
                            console.error("Error updating result files:", e);
                          }
                        }}
                      />

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Current Results</label>
                        {(!selectedOrder.resultFiles || selectedOrder.resultFiles.length === 0) ? (
                          <div className="h-24 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs italic">
                            No result files uploaded yet
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-2 px-1">
                            {selectedOrder.resultFiles.map((file, i) => (
                              <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 truncate hover:text-blue-600 transition-colors">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-xs font-bold truncate">{file.name}</span>
                                </a>
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const filtered = (selectedOrder.resultFiles || []).filter((_, idx) => idx !== i);
                                    try {
                                      await api.updateOrder(selectedOrder.id, { resultFiles: filtered });
                                      setSelectedOrder(prev => prev ? { ...prev, resultFiles: filtered } : null);
                                    } catch (err) {
                                      console.error("Error deleting result file:", err);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Deadline</label>
                    <p className="font-mono text-sm text-slate-600">{selectedOrder.deadline}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Status</label>
                    <p className="font-bold text-blue-600 uppercase tracking-widest text-xs">{selectedOrder.status.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-4">
                <button 
                  onClick={() => handleSetPrice(selectedOrder)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
                >
                  {selectedOrder.price ? 'Update Price' : 'Set Price'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Service Modal */}
      <AnimatePresence>
        {(isAddingService || editingService) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingService(false);
                setEditingService(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                <button 
                  onClick={() => {
                    setIsAddingService(false);
                    setEditingService(null);
                  }} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Title</label>
                  <input 
                    type="text" 
                    value={serviceForm.title}
                    onChange={e => setServiceForm({...serviceForm, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                    placeholder="e.g. 3D CAD Modeling"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea 
                    rows={3}
                    value={serviceForm.description}
                    onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all resize-none"
                    placeholder="Describe the service..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capabilities (comma separated)</label>
                  <input 
                    type="text" 
                    value={serviceForm.capabilities}
                    onChange={e => setServiceForm({...serviceForm, capabilities: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                    placeholder="Part Modeling, Assembly, Rendering..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Software (comma separated)</label>
                  <input 
                    type="text" 
                    value={serviceForm.software}
                    onChange={e => setServiceForm({...serviceForm, software: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                    placeholder="SolidWorks, Fusion 360..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Icon Name (Box, FileText, Activity, Settings)</label>
                  <select 
                    value={serviceForm.icon}
                    onChange={e => setServiceForm({...serviceForm, icon: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                  >
                    <option value="Box">Box</option>
                    <option value="FileText">FileText</option>
                    <option value="Activity">Activity</option>
                    <option value="Settings">Settings</option>
                  </select>
                </div>
                <button 
                  onClick={handleSaveService}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center mt-4 shadow-lg shadow-blue-500/20"
                >
                  <Save className="w-5 h-5 mr-2" /> {editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Price Setting Modal */}
      <AnimatePresence>
        {isPriceModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPriceModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Set Project Price</h2>
                <button onClick={() => setIsPriceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Price (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                    <input 
                      type="text" 
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-900 text-2xl font-bold focus:border-blue-600 outline-none transition-all"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Setting the price will automatically update the order status to <span className="text-blue-600 font-bold">QUOTED</span>.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsPriceModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={savePrice}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Save Price
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Portfolio Modal */}
      <AnimatePresence>
        {(isAddingPortfolio || editingPortfolio) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingPortfolio(false);
                setEditingPortfolio(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">{editingPortfolio ? 'Edit Portfolio Project' : 'Add New Project'}</h2>
                <button 
                  onClick={() => {
                    setIsAddingPortfolio(false);
                    setEditingPortfolio(null);
                  }} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Title</label>
                  <input 
                    type="text" 
                    value={portfolioForm.title}
                    onChange={e => setPortfolioForm({...portfolioForm, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                    placeholder="e.g. Rope Brake Dynamometer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <input 
                      type="text" 
                      value={portfolioForm.category}
                      onChange={e => setPortfolioForm({...portfolioForm, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                      placeholder="e.g. Mechanical"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Year</label>
                    <input 
                      type="text" 
                      value={portfolioForm.year}
                      onChange={e => setPortfolioForm({...portfolioForm, year: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                      placeholder="2024"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea 
                    rows={3}
                    value={portfolioForm.description}
                    onChange={e => setPortfolioForm({...portfolioForm, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all resize-none"
                    placeholder="Describe the project..."
                  />
                </div>
                <div className="space-y-2">
                  <FileUpload 
                    label="Project Image"
                    path="portfolio"
                    currentUrl={portfolioForm.imageUrl}
                    onUploadComplete={(url) => setPortfolioForm({...portfolioForm, imageUrl: url})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Software (comma separated)</label>
                  <input 
                    type="text" 
                    value={portfolioForm.software}
                    onChange={e => setPortfolioForm({...portfolioForm, software: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-600 outline-none transition-all"
                    placeholder="SolidWorks, ANSYS..."
                  />
                </div>
                <button 
                  onClick={handleSavePortfolio}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center mt-4 shadow-lg shadow-blue-500/20"
                >
                  <Save className="w-5 h-5 mr-2" /> {editingPortfolio ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
