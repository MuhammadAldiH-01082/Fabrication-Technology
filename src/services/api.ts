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

const DEFAULT_SERVICES = [
  {
    id: 'cad-modeling',
    title: '3D CAD Modeling',
    description: 'Desain 3D parametrik presisi tinggi untuk komponen mekanik, mold, die, dan perakitan kompleks.',
    icon: 'Box',
    capabilities: ["Solid Modeling & Complex Surfacing", "Sheet Metal & Weldments Design", "Assembly & Kinematic Motion Simulation", "Reverse Engineering from 3D Scan"],
    software: ["Autodesk Inventor", "SolidWorks", "Fusion 360", "Siemens NX"],
    color: 'blue'
  },
  {
    id: 'engineering-drawing',
    title: '2D Engineering Drawing',
    description: 'Pembuatan gambar kerja standar industri (ISO/ASME) lengkap dengan GD&T, toleransi, dan BOM.',
    icon: 'FileText',
    capabilities: ["Manufacturing & Shop Drawings", "GD&T & Tolerance Stack-up Analysis", "Bill of Materials (BOM) & Cut Lists", "Exploded View & Assembly Manuals"],
    software: ["AutoCAD", "SolidWorks 2D", "Autodesk Inventor", "DraftSight"],
    color: 'indigo'
  },
  {
    id: 'simulation-analysis',
    title: 'Mechanical Simulation & FEA',
    description: 'Analisis kekuatan struktur, tegangan, deformasi, termal, dan dinamika fluida (CFD) untuk optimasi desain.',
    icon: 'Activity',
    capabilities: ["Finite Element Analysis (FEA)", "Computational Fluid Dynamics (CFD)", "Thermal & Heat Transfer Analysis", "Fatigue & Durability Life Estimation"],
    software: ["Ansys Mechanical", "SolidWorks Simulation", "Autodesk CFD", "Abaqus"],
    color: 'cyan'
  },
  {
    id: 'fabrication-prototyping',
    title: 'Prototype Fabrication',
    description: 'Realisasi fisik prototipe menggunakan teknologi CNC, 3D printing, sheet metal, dan perakitan presisi.',
    icon: 'Settings',
    capabilities: ["3D Printing (FDM, SLA, SLS)", "CNC Milling & Turning (3-5 Axis)", "Laser Cutting & Sheet Metal Bending", "Assembly, Testing & Quality Verification"],
    software: ["Cura / PrusaSlicer", "Mastercam / Fusion CAM", "LaserGRBL", "Mach3 / LinuxCNC"],
    color: 'emerald'
  }
];

const DEFAULT_PORTFOLIO = [
  {
    id: 'custom-drone-frame',
    title: 'Custom Carbon Drone Airframe',
    category: 'Aerospace & Robotics',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800',
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800',
    description: 'Desain struktur rangka drone serat karbon ultra-ringan dengan optimasi aerodinamika dan kekakuan torsional tinggi.',
    software: ["SolidWorks", "Ansys FEA"],
    year: '2024'
  },
  {
    id: 'robotic-gripper-arm',
    title: 'Adaptive Robotic Gripper',
    category: 'Industrial Automation',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    description: 'Mekanisme gripper adaptif multi-link untuk lini perakitan komponen sensitif otomotif.',
    software: ["Autodesk Inventor", "Cura 3D"],
    year: '2024'
  },
  {
    id: 'industrial-gearbox',
    title: 'High-Torque Industrial Gearbox',
    category: 'Machinery & Power Trans',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    description: 'Housing transmisi daya beban berat dengan sistem pendingin oli internal dan analisis termal CFD.',
    software: ["Siemens NX", "Ansys Mechanical"],
    year: '2023'
  }
];

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
      const data = await parseResponse(res, DEFAULT_SERVICES);
      return (data && data.length > 0) ? data : DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
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
      const data = await parseResponse(res, DEFAULT_PORTFOLIO);
      return (data && data.length > 0) ? data : DEFAULT_PORTFOLIO;
    } catch {
      return DEFAULT_PORTFOLIO;
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
