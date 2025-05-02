// No need for dotenv since we're using a mock payment system
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const payments = require('./payments');
const emailService = require('./emailService');
const crypto = require('crypto'); // For password encryption

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Explicitly set trust proxy for Render
app.set('trust proxy', true);

// Add security middleware
app.use((req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' https://images.unsplash.com https://source.unsplash.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline';");
  next();
});

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

// Helper function for password encryption
function encryptPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// Helper function for password verification
function verifyPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === hash;
}

// Generate reset token
function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
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
    image: '/api/placeholder/600/400',
    location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
  },
  {
    id: '2',
    name: 'Clean Rivers',
    description: 'Working to restore and protect rivers in developing countries to provide sustainable water sources for local communities and preserve the natural ecosystem for future generations.',
    goalAmount: 20000,
    raisedAmount: 5000,
    image: '/api/placeholder/600/400',
    location: { lat: 8.9806, lng: 38.7578, name: 'Addis Ababa, Ethiopia' },
  },
  {
    id: '3',
    name: 'Water Wells',
    description: 'Building sustainable wells in drought-prone areas to provide reliable access to clean drinking water year-round for communities facing severe water scarcity and health challenges.',
    goalAmount: 20000,
    raisedAmount: 13000,
    image: '/api/placeholder/600/400',
    location: { lat: -1.2921, lng: 36.8219, name: 'Nairobi, Kenya' },
  }
];
const donations = [];
const resetTokens = []; // To store password reset tokens

// API Routes
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = users.find(u => u.id.toString() === token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  req.user = user;
  next();
};

// Projects
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
    
    // Convert dollars to cents for Stripe
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
    const userId = req.headers.authorization?.split(' ')[1];
    
    if (!paymentMethodId || !amount || !projectId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Convert dollars to cents for Stripe
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
        projectName: project.name,
        createdAt: new Date(),
        userId: userId || null
      };
      
      donations.push(donation);
      
      // Update project raised amount
      project.raisedAmount += parseFloat(amount);
      
      // Send confirmation email to donor
      try {
        const emailResult = await emailService.sendDonationConfirmation(
          email,
          name,
          amount,
          project.name
        );
        
        console.log('Email sending result:', emailResult);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // We don't want to fail the payment if email fails
      }
      
      // Save donation to user's profile if they're logged in
      if (userId) {
        const user = users.find(u => u.id.toString() === userId);
        if (user) {
          if (!user.donations) {
            user.donations = [];
          }
          user.donations.push(donation.id);
        }
      }
      
      res.status(200).json({ 
        success: true, 
        donation,
        message: 'Thank you for your donation! A confirmation email has been sent to your email address.' 
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

app.get('/api/payment/config', (req, res) => {
  res.json({
    publishableKey: 'mock_pk_test_key'
  });
});

// Donations
app.post('/api/donations', (req, res) => {
  try {
    const { amount, paymentMethod, nameOnCard, email, projectId } = req.body;
    const userId = req.headers.authorization?.split(' ')[1];
    
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
      createdAt: new Date(),
      userId: userId || null
    };
    
    donations.push(donation);
    
    // Update project raised amount if projectId provided
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.raisedAmount += parseFloat(amount);
        donation.projectId = projectId;
        donation.projectName = project.name;
        
        // Send confirmation email
        try {
          emailService.sendDonationConfirmation(
            email,
            nameOnCard,
            amount,
            project.name
          ).then(result => {
            console.log('Email sending result:', result);
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }
    }
    
    // Save donation to user's profile if they're logged in
    if (userId) {
      const user = users.find(u => u.id.toString() === userId);
      if (user) {
        if (!user.donations) {
          user.donations = [];
        }
        user.donations.push(donation.id);
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

// Get user donations
app.get('/api/user/donations', authenticateUser, (req, res) => {
  try {
    const userDonations = donations.filter(d => d.userId === req.user.id.toString());
    res.json(userDonations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Authentication (with password encryption)
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
    
    // Encrypt password
    const { salt, hash } = encryptPassword(password);
    
    // Create user with encrypted password
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      username,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date(),
      donations: []
    };
    
    users.push(user);
    
    // Create token
    const token = user.id;
    
    res.status(201).json({ 
      token, 
      userId: user.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
      }
    });
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
    
    // Validate password with encryption
    const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = user.id;
    
    res.json({ 
      token, 
      userId: user.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User profile
app.get('/api/user/profile', authenticateUser, (req, res) => {
  try {
    const user = req.user;
    
    // Don't send sensitive information
    const userProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    };
    
    res.json(userProfile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Password reset request
app.post('/api/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      // For security reasons, don't reveal that email doesn't exist
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    
    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // Token valid for 1 hour
    
    // Store reset token
    resetTokens.push({
      userId: user.id,
      token: resetToken,
      expiry: resetExpiry
    });
    
    // In a real app, send email with reset link
    // For our mock, just log it
    console.log(`Password reset link for ${email}: /reset-password?token=${resetToken}`);
    
    res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with token
app.post('/api/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // Find reset token
    const resetData = resetTokens.find(r => r.token === token && r.expiry > new Date());
    if (!resetData) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Find user
    const user = users.find(u => u.id.toString() === resetData.userId.toString());
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Update password
    const { salt, hash } = encryptPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    
    // Remove used token
    const tokenIndex = resetTokens.findIndex(r => r.token === token);
    if (tokenIndex !== -1) {
      resetTokens.splice(tokenIndex, 1);
    }
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save credit card information for future use (mock - in a real app use a secure vault)
app.post('/api/user/payment-methods', authenticateUser, (req, res) => {
  try {
    const { cardNumber, expiryDate, nameOnCard } = req.body;
    
    // In a real application, you would encrypt this or better, use a token-based approach with a payment provider
    // Here we're simulating saved payment methods
    
    // Only store last 4 digits for security
    const last4 = cardNumber.slice(-4);
    
    const paymentMethod = {
      id: 'pm_' + Date.now(),
      type: 'card',
      card: {
        last4,
        brand: 'visa', // Mock value
        exp_month: expiryDate.split('/')[0],
        exp_year: expiryDate.split('/')[1],
      },
      billing_details: {
        name: nameOnCard
      },
      created: new Date()
    };
    
    // Add to user
    if (!req.user.paymentMethods) {
      req.user.paymentMethods = [];
    }
    
    req.user.paymentMethods.push(paymentMethod);
    
    res.status(201).json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        last4,
        brand: paymentMethod.card.brand,
        expiry: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
        name: paymentMethod.billing_details.name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get saved payment methods
app.get('/api/user/payment-methods', authenticateUser, (req, res) => {
  try {
    const paymentMethods = req.user.paymentMethods || [];
    
    // Format for client response
    const formattedMethods = paymentMethods.map(pm => ({
      id: pm.id,
      last4: pm.card.last4,
      brand: pm.card.brand,
      expiry: `${pm.card.exp_month}/${pm.card.exp_year}`,
      name: pm.billing_details.name
    }));
    
    res.json(formattedMethods);
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
