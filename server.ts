import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Database from "better-sqlite3";
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer config for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Database Configuration
const DB_TYPE = process.env.DB_TYPE || "sqlite"; // Default to sqlite for preview

let db: any;
let isMySQL = false;

async function initDB() {
  if (DB_TYPE === "mysql" && process.env.DB_HOST) {
    console.log("Connecting to MySQL...");
    try {
      db = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      isMySQL = true;
      console.log("MySQL connected.");
    } catch (err) {
      console.error("MySQL connection failed, falling back to SQLite:", err);
      setupSQLite();
    }
  } else {
    setupSQLite();
  }
}

function setupSQLite() {
  console.log("Using SQLite...");
  db = new Database("database.sqlite");
  isMySQL = false;

  // Initialize SQLite Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      displayName TEXT,
      photoURL TEXT,
      role TEXT DEFAULT 'client',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      lastMessage TEXT,
      lastMessageAt DATETIME,
      FOREIGN KEY (userId) REFERENCES users(uid)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      senderId TEXT,
      senderName TEXT,
      text TEXT,
      isAdmin BOOLEAN,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chatId) REFERENCES chats(id)
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      icon TEXT,
      capabilities TEXT,
      software TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      title TEXT,
      category TEXT,
      image TEXT,
      description TEXT,
      software TEXT,
      year TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      clientUid TEXT,
      clientName TEXT,
      clientEmail TEXT,
      serviceType TEXT,
      description TEXT,
      deadline TEXT,
      shippingAddress TEXT,
      referenceUrl TEXT,
      status TEXT DEFAULT 'pending',
      price INTEGER,
      files TEXT,
      resultFiles TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientUid) REFERENCES users(uid)
    );
  `);

  // Simple migrations for SQLite
  try { db.exec("ALTER TABLE orders RENAME COLUMN uid TO clientUid"); } catch (e) {}
  try { db.exec("ALTER TABLE chats RENAME COLUMN clientUid TO userId"); } catch (e) {}
  try { db.exec("ALTER TABLE chats RENAME COLUMN clientName TO userName"); } catch (e) {}
  try { db.exec("ALTER TABLE portfolio ADD COLUMN software TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE portfolio ADD COLUMN year TEXT"); } catch (e) {}
}

// Wrapper for DB queries to handle both SQLite and MySQL
async function query(sql: string, params: any[] = []) {
  if (isMySQL) {
    // MySQL uses '?' but it's consistent with better-sqlite3 for standard params
    const [rows] = await db.execute(sql, params);
    return rows;
  } else {
    // better-sqlite3
    if (sql.trim().toLowerCase().startsWith("select")) {
      return db.prepare(sql).all(...params);
    } else {
      return db.prepare(sql).run(...params);
    }
  }
}

async function queryOne(sql: string, params: any[] = []) {
  const result = await query(sql, params);
  return isMySQL ? result[0] : result; // SQLite select one is handled differently in better-sqlite3 prepare().get()
}
// Note: Adjusted queryOne for better compatibility
async function dbGet(sql: string, params: any[] = []) {
  if (isMySQL) {
    const [rows] = await db.execute(sql, params);
    return rows[0];
  } else {
    return db.prepare(sql).get(...params);
  }
}
async function dbAll(sql: string, params: any[] = []) {
  if (isMySQL) {
    const [rows] = await db.execute(sql, params);
    return rows;
  } else {
    return db.prepare(sql).all(...params);
  }
}
async function dbRun(sql: string, params: any[] = []) {
  if (isMySQL) {
    return await db.execute(sql, params);
  } else {
    return db.prepare(sql).run(...params);
  }
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  // API ROUTES

  // Users
  app.post("/api/users/sync", async (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;
    try {
      if (isMySQL) {
        await dbRun(`
          INSERT INTO users (uid, email, displayName, photoURL)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            displayName = VALUES(displayName),
            photoURL = VALUES(photoURL)
        `, [uid, email, displayName, photoURL]);
      } else {
        await dbRun(`
          INSERT INTO users (uid, email, displayName, photoURL)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(uid) DO UPDATE SET
            displayName = excluded.displayName,
            photoURL = excluded.photoURL
        `, [uid, email, displayName, photoURL]);
      }
      
      const user = await dbGet("SELECT * FROM users WHERE uid = ?", [uid]);
      res.json(user);
    } catch (err) {
      console.error("Sync error:", err);
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  app.get("/api/users/:uid", async (req, res) => {
    const user = await dbGet("SELECT * FROM users WHERE uid = ?", [req.params.uid]);
    res.json(user || { error: "User not found" });
  });

  // Services
  app.get("/api/services", async (req, res) => {
    const services = await dbAll("SELECT * FROM services");
    res.json(services.map((s: any) => ({
      ...s,
      capabilities: typeof s.capabilities === 'string' ? JSON.parse(s.capabilities || "[]") : s.capabilities,
      software: typeof s.software === 'string' ? JSON.parse(s.software || "[]") : s.software
    })));
  });

  app.post("/api/services", async (req, res) => {
    const { title, description, icon, capabilities, software, color } = req.body;
    const id = uuidv4();
    await dbRun("INSERT INTO services (id, title, description, icon, capabilities, software, color) VALUES (?, ?, ?, ?, ?, ?, ?)", [
      id, title, description, icon, JSON.stringify(capabilities), JSON.stringify(software), color
    ]);
    res.json({ id, success: true });
  });

  app.delete("/api/services/:id", async (req, res) => {
    await dbRun("DELETE FROM services WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Portfolio
  app.get("/api/portfolio", async (req, res) => {
    const portfolio = await dbAll("SELECT * FROM portfolio");
    res.json(portfolio.map((p: any) => ({
      ...p,
      imageUrl: p.image, // Map 'image' to 'imageUrl' for frontend consistency
      software: typeof p.software === 'string' ? JSON.parse(p.software || "[]") : (p.software || []),
      year: p.year || new Date().getFullYear().toString()
    })));
  });

  app.post("/api/portfolio", async (req, res) => {
    const { title, category, image, description, software, year } = req.body;
    const id = uuidv4();
    await dbRun("INSERT INTO portfolio (id, title, category, image, description, software, year) VALUES (?, ?, ?, ?, ?, ?, ?)", [
      id, title, category, image, description, JSON.stringify(software || []), year || new Date().getFullYear().toString()
    ]);
    res.json({ id, success: true });
  });

  app.delete("/api/portfolio/:id", async (req, res) => {
    await dbRun("DELETE FROM portfolio WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    const { uid } = req.query;
    let orders;
    if (uid) {
      orders = await dbAll("SELECT * FROM orders WHERE clientUid = ? ORDER BY createdAt DESC", [uid]);
    } else {
      orders = await dbAll("SELECT * FROM orders ORDER BY createdAt DESC");
    }
    res.json(orders.map((o: any) => ({
      ...o,
      files: typeof o.files === 'string' ? JSON.parse(o.files || "[]") : o.files,
      resultFiles: typeof o.resultFiles === 'string' ? JSON.parse(o.resultFiles || "[]") : o.resultFiles
    })));
  });

  app.post("/api/orders", async (req, res) => {
    const id = uuidv4();
    const { uid, clientName, clientEmail, serviceType, description, deadline, shippingAddress, referenceUrl, files } = req.body;
    await dbRun(`
      INSERT INTO orders (id, clientUid, clientName, clientEmail, serviceType, description, deadline, shippingAddress, referenceUrl, files)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, uid, clientName, clientEmail, serviceType, description, deadline, shippingAddress, referenceUrl, JSON.stringify(files || [])]);
    res.json({ id, success: true });
  });

  app.patch("/api/orders/:id", async (req, res) => {
    const updates = req.body;
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(", ");
    const values = Object.values(updates).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
    
    // SQLite uses CURRENT_TIMESTAMP, MySQL works with it too
    await dbRun(`UPDATE orders SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [...values, req.params.id]);
    res.json({ success: true });
  });

  // Chats
  app.get("/api/chats", async (req, res) => {
    const chats = await dbAll("SELECT * FROM chats ORDER BY lastMessageAt DESC");
    res.json(chats);
  });

  app.get("/api/chats/:id/messages", async (req, res) => {
    const messages = await dbAll("SELECT * FROM chat_messages WHERE chatId = ? ORDER BY createdAt ASC", [req.params.id]);
    res.json(messages);
  });

  app.post("/api/chats/:id/messages", async (req, res) => {
    const { senderId, senderName, text, isAdmin } = req.body;
    const msgId = uuidv4();
    await dbRun("INSERT INTO chat_messages (id, chatId, senderId, senderName, text, isAdmin) VALUES (?, ?, ?, ?, ?, ?)", [
      msgId, req.params.id, senderId, senderName, text, isAdmin ? 1 : 0
    ]);
    
    // Update chat head
    if (isMySQL) {
      await dbRun(`
        INSERT INTO chats (id, userId, userName, lastMessage, lastMessageAt)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
          lastMessage = VALUES(lastMessage),
          lastMessageAt = CURRENT_TIMESTAMP
      `, [req.params.id, senderId, senderName, text]);
    } else {
      await dbRun(`
        INSERT INTO chats (id, userId, userName, lastMessage, lastMessageAt)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          lastMessage = excluded.lastMessage,
          lastMessageAt = CURRENT_TIMESTAMP
      `, [req.params.id, senderId, senderName, text]);
    }

    res.json({ id: msgId, success: true });
  });

  // File Upload API
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  });

  // Admin DB View (for user convenience)
  app.get("/api/admin/db", async (req, res) => {
    const tables = ['users', 'services', 'portfolio', 'orders', 'chats', 'chat_messages'];
    const data: any = {};
    for (const table of tables) {
      data[table] = await dbAll(`SELECT * FROM ${table}`);
    }
    res.json(data);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
