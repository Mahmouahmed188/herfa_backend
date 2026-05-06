const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const DB_FILE = './users.json';

// Middleware
app.use(express.json());
app.use(cors());

// Helper functions for "Database" (simple JSON file)
const getUsers = () => {
  if (!fs.existsSync(DB_FILE)) return [];
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
};

// --- Endpoints ---

// 1. Register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '24h' });

    res.status(201).json({
      user: { id: newUser.id, email: newUser.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// 2. Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

    res.json({
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// 3. Get Me (Get Current User)
app.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Auth Backend running on http://localhost:${PORT}`);
});
