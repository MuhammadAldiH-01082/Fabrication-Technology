-- Database Schema for MySQL (Laragon / Localhost)
-- Create this database in your MySQL server (e.g., named 'engineering_db')

CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  displayName VARCHAR(255),
  photoURL TEXT,
  role VARCHAR(50) DEFAULT 'client',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  icon VARCHAR(255),
  capabilities TEXT, -- Store as JSON string
  software TEXT,     -- Store as JSON string
  color VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS portfolio (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  category VARCHAR(255),
  image TEXT,
  description TEXT,
  software TEXT,     -- Store as JSON string
  year VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  clientUid VARCHAR(255),
  clientName VARCHAR(255),
  clientEmail VARCHAR(255),
  serviceType VARCHAR(255),
  description TEXT,
  deadline VARCHAR(255),
  shippingAddress TEXT,
  referenceUrl TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  price INT,
  files TEXT,         -- Store as JSON string
  resultFiles TEXT,   -- Store as JSON string
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clientUid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS chats (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255),
  userName VARCHAR(255),
  lastMessage TEXT,
  lastMessageAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  chatId VARCHAR(255),
  senderId VARCHAR(255),
  senderName VARCHAR(255),
  text TEXT,
  isAdmin BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chatId) REFERENCES chats(id)
);
