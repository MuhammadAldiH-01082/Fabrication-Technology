async function parseResponse<T = any>(res: Response, fallback: T): Promise<T> {
  try {
    if (!res.ok) {
      console.warn(`API returned status ${res.status} for ${res.url}`);
      return fallback;
    }
    const text = await res.text();
    if (!text || text.trim() === '') {
      return fallback;
    }
    return JSON.parse(text);
  } catch (err) {
    console.warn(`Failed to parse response from ${res.url}:`, err);
    return fallback;
  }
}

export const api = {
  // Users
  syncUser: async (userData: { uid: string, email: string | null, displayName: string | null, photoURL: string | null }) => {
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await parseResponse(res, null);
    } catch {
      return null;
    }
  },
  getUser: async (uid: string) => {
    try {
      const res = await fetch(`/api/users/${uid}`);
      return await parseResponse(res, null);
    } catch {
      return null;
    }
  },

  // Services
  getServices: async () => {
    try {
      const res = await fetch('/api/services');
      return await parseResponse(res, []);
    } catch {
      return [];
    }
  },
  addService: async (service: any) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      return await parseResponse(res, { success: false });
    } catch {
      return { success: false };
    }
  },
  deleteService: async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      return await parseResponse(res, { success: false });
    } catch {
      return { success: false };
    }
  },

  // Portfolio
  getPortfolio: async () => {
    try {
      const res = await fetch('/api/portfolio');
      return await parseResponse(res, []);
    } catch {
      return [];
    }
  },
  addPortfolio: async (item: any) => {
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      return await parseResponse(res, { success: false });
    } catch {
      return { success: false };
    }
  },
  deletePortfolio: async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      return await parseResponse(res, { success: false });
    } catch {
      return { success: false };
    }
  },

  // Orders
  getOrders: async (uid?: string) => {
    try {
      const url = uid ? `/api/orders?uid=${uid}` : '/api/orders';
      const res = await fetch(url);
      return await parseResponse(res, []);
    } catch {
      return [];
    }
  },
  createOrder: async (order: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return await parseResponse(res, { success: false });
    } catch {
      return { success: false };
    }
  },
  updateOrder: async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await parseResponse(res, { success: false });
    } catch {
      return { success: false };
    }
  },

  // Chats
  getChats: async () => {
    try {
      const res = await fetch('/api/chats');
      return await parseResponse(res, []);
    } catch {
      return [];
    }
  },
  getMessages: async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      return await parseResponse(res, []);
    } catch {
      return [];
    }
  },
  sendMessage: async (chatId: string, message: any) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      return await parseResponse(res, { success: false });
    } catch {
      return { success: false };
    }
  }
};
