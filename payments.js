// Mock payment system for class project
console.log('Using mock payment system for demonstration purposes');

/**
 * Create a payment intent for a donation (mock)
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {object} metadata - Additional metadata about the donation
 * @returns {Promise<Object>} - Mock PaymentIntent object
 */
async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  try {
    // Generate a fake client secret
    const clientSecret = `mock_pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`Mock payment intent created for ${amount/100} ${currency}`);
    
    return {
      id: `mock_pi_${Date.now()}`,
      client_secret: clientSecret,
      amount,
      currency,
      metadata,
      status: 'requires_confirmation'
    };
  } catch (error) {
    console.error('Error creating mock payment intent:', error);
    throw error;
  }
}

/**
 * Process a donation payment (mock)
 * @param {string} paymentMethodId - ID of the payment method
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {object} metadata - Additional metadata about the donation
 * @returns {Promise<Object>} - Payment confirmation
 */
async function processDonation(paymentMethodId, amount, currency = 'usd', metadata = {}) {
  try {
    // Simulate a payment process
    console.log(`Processing mock donation of ${amount/100} ${currency} for ${metadata.projectName || 'unknown project'}`);
    
    // Simulate random success (90% success rate)
    const isSuccessful = Math.random() < 0.9;
    
    if (!isSuccessful) {
      throw new Error('Payment declined (mock)');
    }
    
    return {
      success: true,
      paymentIntentId: `mock_pi_${Date.now()}`,
      status: 'succeeded'
    };
  } catch (error) {
    console.error('Error processing mock donation:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Retrieve payment details (mock)
 * @param {string} paymentIntentId - ID of the payment intent
 * @returns {Promise<Object>} - Payment details
 */
async function getPaymentDetails(paymentIntentId) {
  try {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 2500,
      currency: 'usd',
      created: Date.now(),
      metadata: {}
    };
  } catch (error) {
    console.error('Error retrieving mock payment details:', error);
    throw error;
  }
}

module.exports = {
  createPaymentIntent,
  processDonation,
  getPaymentDetails,
}; 