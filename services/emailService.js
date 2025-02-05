require('dotenv').config();

const axios = require('axios');

const sendVerificationEmail = async (email, code) => {
  try {
    const response = await axios.post(
      `https://api.brevo.com/v3/smtp/email`,
      {
        sender: { name: 'Daily Earn', email: 'no-reply@dailyearn.com' }, 
        to: [{ email }],
        subject: 'Your Withdrawal Verification Code',
        htmlContent: `<p>Your verification code for withdrawal is: <strong>${code}</strong></p>`,
      },
      {
        headers: {
          'api-key': process.env.EMAIL_API_KEY, // Use the API key from the .env file
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = {
  sendVerificationEmail,
};
