// No need for dotenv since we're using a mock payment system
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const payments = require('./payments');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Explicitly set trust proxy for Render
app.set('trust proxy', true);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error occurred' });
});

// Serve static frontend files from backend/build directory
try {
  app.use(express.static(path.join(__dirname, 'backend', 'build')));
  console.log(`Static directory path: ${path.join(__dirname, 'backend', 'build')}`);
} catch (error) {
  console.error('Error setting up static files:', error);
}

// In-memory data storage (instead of MongoDB)
const users = [];
const projects = [
  {
    id: '1',
    name: 'Splash',
    description: 'Splash is at the forefront of a growing movement to ensure that children in urban poverty have the resources they need for healthy development and proper education through clean water sources.',
    goalAmount: 15000,
    raisedAmount: 0,
    image: '/api/placeholder/600/400'
  },
  {
    id: '2',
    name: 'Clean Rivers',
    description: 'Working to restore and protect rivers in developing countries to provide sustainable water sources for local communities and preserve the natural ecosystem for future generations.',
    goalAmount: 20000,
    raisedAmount: 5000,
    image: '/api/placeholder/600/400'
  },
  {
    id: '3',
    name: 'Water Wells',
    description: 'Building sustainable wells in drought-prone areas to provide reliable access to clean drinking water year-round for communities facing severe water scarcity and health challenges.',
    goalAmount: 20000,
    raisedAmount: 13000,
    image: '/api/placeholder/600/400'
  }
];
const donations = [];

// API Routes
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  res.json(project);
});

// Payment endpoints
app.post('/api/payment/create-intent', async (req, res) => {
  try {
    const { amount, projectId } = req.body;
    
    if (!amount || !projectId) {
      return res.status(400).json({ message: 'Amount and projectId are required' });
    }
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Convert dollars to cents for payment system
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    const paymentIntent = await payments.createPaymentIntent(amountInCents, 'usd', {
      projectId,
      projectName: project.name
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amountInCents,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

app.post('/api/payment/process', async (req, res) => {
  try {
    const { paymentMethodId, amount, projectId, email, name } = req.body;
    
    if (!paymentMethodId || !amount || !projectId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Convert dollars to cents for payment system
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    const result = await payments.processDonation(paymentMethodId, amountInCents, 'usd', {
      projectId,
      projectName: project.name,
      donorEmail: email,
      donorName: name
    });
    
    if (result.success) {
      // Create donation record
      const donation = {
        id: Date.now().toString(),
        amount,
        paymentIntentId: result.paymentIntentId,
        email,
        name,
        projectId,
        createdAt: new Date()
      };
      
      donations.push(donation);
      
      // Update project raised amount
      project.raisedAmount += parseFloat(amount);
      
      res.status(200).json({ 
        success: true, 
        donation,
        message: 'Thank you for your donation!' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment failed', 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

// Donations
app.post('/api/donations', (req, res) => {
  try {
    const { amount, paymentMethod, nameOnCard, email, projectId } = req.body;
    
    // Validation
    if (!amount || !paymentMethod || !email) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Create donation
    const donation = {
      id: Date.now().toString(),
      amount,
      paymentMethod,
      nameOnCard,
      email,
      createdAt: new Date()
    };
    
    donations.push(donation);
    
    // Update project raised amount if projectId provided
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.raisedAmount += parseFloat(amount);
      }
    }
    
    res.status(201).json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donations
app.get('/api/donations', (req, res) => {
  res.json(donations);
});

// User Authentication (simplified)
app.post('/api/signup', (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user (no password hashing in this simplified version)
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      username,
      password,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Create simple token
    const token = user.id;
    
    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password (no hashing in this simplified version)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create simple token
    const token = user.id;
    
    res.json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fallback: serve frontend for any other route
app.get('*', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'backend', 'build', 'index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error serving application');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Using in-memory storage (no MongoDB connection required)');
}); 