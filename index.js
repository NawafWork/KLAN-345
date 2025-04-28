const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-mongodb-connection-string';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const donationSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  nameOnCard: String,
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  image: { type: String, default: '/default-project.jpg' },
  createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Donation = mongoose.model('Donation', donationSchema);
const Project = mongoose.model('Project', projectSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API Routes
// User Authentication
app.post('/api/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({ token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Donations
app.post('/api/donations', async (req, res) => {
  try {
    const { amount, paymentMethod, nameOnCard, email, projectId } = req.body;
    
    // Validation
    if (!amount || !paymentMethod || !email) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Create donation
    const donation = new Donation({
      amount,
      paymentMethod,
      nameOnCard,
      email,
      userId: req.user ? req.user.id : null
    });
    
    await donation.save();
    
    // Update project raised amount if projectId provided
    if (projectId) {
      await Project.findByIdAndUpdate(
        projectId,
        { $inc: { raisedAmount: amount } }
      );
    }
    
    res.status(201).json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize default projects if none exist
const initializeProjects = async () => {
  const count = await Project.countDocuments();
  if (count === 0) {
    const defaultProjects = [
      {
        name: 'Splash',
        description: 'Splash is at the forefront of a growing movement to ensure that children in urban poverty have the resources they need for healthy development.',
        goalAmount: 15000,
        raisedAmount: 0,
        image: '/api/placeholder/600/400'
      },
      {
        name: 'Clean Rivers',
        description: 'Working to restore and protect rivers in developing countries to provide sustainable water sources for local communities.',
        goalAmount: 20000,
        raisedAmount: 5000,
        image: '/api/placeholder/600/400'
      },
      {
        name: 'Water Wells',
        description: 'Building sustainable wells in drought-prone areas to provide reliable access to clean drinking water year-round.',
        goalAmount: 20000,
        raisedAmount: 13000,
        image: '/api/placeholder/600/400'
      }
    ];
    
    await Project.insertMany(defaultProjects);
    console.log('Default projects initialized');
  }
};

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeProjects();
});
