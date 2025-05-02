// Email service for sending donation confirmations
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.log('Nodemailer not available, using mock email service');
  nodemailer = null;
}

// Mock transporter implementation when nodemailer isn't available
const mockTransporter = {
  sendMail: (options) => {
    return Promise.resolve({
      messageId: `mock_${Date.now()}@mockmail.com`
    });
  }
};

// Create a transporter - either real or mock
const transporter = nodemailer ? nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal.password'
  }
}) : mockTransporter;

// For production, create a console fallback if the email service is unavailable
const sendMail = async (mailOptions) => {
  try {
    console.log('Attempting to send email...');
    
    // Log the email information for the class project
    console.log('Email information:');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    
    // For the class project, we'll just mock the email sending
    // Uncomment the following line to actually send emails with a configured SMTP server
    // const info = await transporter.sendMail(mailOptions);
    
    // Mock successful response
    return { 
      success: true, 
      messageId: `mock_${Date.now()}@charity-water.com` 
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Send a donation confirmation email
 * @param {string} email - Recipient email
 * @param {string} name - Donor name
 * @param {number} amount - Donation amount
 * @param {string} projectName - Name of the project donated to
 * @returns {Promise<Object>} - Email sending result
 */
async function sendDonationConfirmation(email, name, amount, projectName) {
  const mailOptions = {
    from: '"Charity Water" <donations@charity-water.org>',
    to: email,
    subject: 'Thank You for Your Donation to Charity Water!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://via.placeholder.com/150x80?text=Charity+Water" alt="Charity Water Logo" style="max-width: 150px;">
        </div>
        
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Thank You for Your Donation, ${name}!</h2>
        
        <p>Your generous contribution of <strong>$${amount}</strong> to <strong>${projectName}</strong> will help provide clean and safe drinking water to communities in need.</p>
        
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Donation Details:</h3>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Transaction ID:</strong> CHW-${Date.now().toString().substring(5)}</p>
        </div>
        
        <p>Your donation will make a real difference in the lives of those who lack access to clean water. Here's how your contribution will help:</p>
        
        <ul style="margin-bottom: 20px;">
          <li>Provide safe drinking water to families</li>
          <li>Reduce waterborne diseases in vulnerable communities</li>
          <li>Allow children to attend school instead of walking hours to collect water</li>
          <li>Improve overall community health and welfare</li>
        </ul>
        
        <p>We'll keep you updated on the progress of the ${projectName} project and how your donation is being put to work.</p>
        
        <p>If you have any questions about your donation or would like to learn more about our projects, please don't hesitate to contact us at <a href="mailto:support@charity-water.org" style="color: #4caf50;">support@charity-water.org</a>.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>With gratitude,</p>
          <p><strong>The Charity Water Team</strong></p>
        </div>
      </div>
    `
  };
  
  return await sendMail(mailOptions);
}

module.exports = {
  sendDonationConfirmation
}; 