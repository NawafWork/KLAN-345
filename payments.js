try {
  require('dotenv').config();
} catch (error) {
  console.log('No .env file found, using environment variables');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent for a donation
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {object} metadata - Additional metadata about the donation
 * @returns {Promise<Object>} - Stripe PaymentIntent object
 */
async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      payment_method_types: ['card'],
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Process a donation payment
 * @param {string} paymentMethodId - ID of the payment method
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {object} metadata - Additional metadata about the donation
 * @returns {Promise<Object>} - Payment confirmation
 */
async function processDonation(paymentMethodId, amount, currency = 'usd', metadata = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      metadata,
      confirm: true,
      confirmation_method: 'manual',
      description: `Donation for ${metadata.projectName || 'Charity Water Project'}`,
    });
    
    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error('Error processing donation:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Retrieve payment details
 * @param {string} paymentIntentId - ID of the payment intent
 * @returns {Promise<Object>} - Payment details
 */
async function getPaymentDetails(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment details:', error);
    throw error;
  }
}

module.exports = {
  createPaymentIntent,
  processDonation,
  getPaymentDetails,
}; 