const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Email Gmail
        pass: process.env.EMAIL_PASS,  // Password aplikasi Gmail
    },
});

const sendResetPasswordEmail = async (email, resetLink) => {
    const msg = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: 'Reset Password',
        html: `
            <h1>Reset Password</h1>
            <p>Hi,</p>
            <p>Kami menerima permintaan untuk mereset password Anda. Klik link di bawah untuk melanjutkan:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Link ini berlaku selama 1 jam.</p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        `,
    };

    try {
        await transporter.sendMail(msg);
        console.log('Reset password email sent');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};

module.exports = sendResetPasswordEmail;