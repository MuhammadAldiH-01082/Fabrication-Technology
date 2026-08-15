const API_URL = ''; // Same origin

export const api = {
  // Users
  syncUser: async (userData: { uid: string, email: string | null, displayName: string | null, photoURL: string | null }) => {
    const res = await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },
  getUser: async (uid: string) => {
    const res = await fetch(`/api/users/${uid}`);
    return res.json();
  },

  // Services
  getServices: async () => {
    const res = await fetch('/api/services');
    return res.json();
  },
  addService: async (service: any) => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    return res.json();
  },
  deleteService: async (id: string) => {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Portfolio
  getPortfolio: async () => {
    const res = await fetch('/api/portfolio');
    return res.json();
  },
  addPortfolio: async (item: any) => {
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  },
  deletePortfolio: async (id: string) => {
    const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Orders
  getOrders: async (uid?: string) => {
    const url = uid ? `/api/orders?uid=${uid}` : '/api/orders';
    const res = await fetch(url);
    return res.json();
  },
  createOrder: async (order: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return res.json();
  },
  updateOrder: async (id: string, updates: any) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Chats
  getChats: async () => {
    const res = await fetch('/api/chats');
    return res.json();
  },
  getMessages: async (chatId: string) => {
    const res = await fetch(`/api/chats/${chatId}/messages`);
    return res.json();
  },
  sendMessage: async (chatId: string, message: any) => {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return res.json();
  }
};
