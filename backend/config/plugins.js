module.exports = ({ env }) => ({
  email: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.zoho.in'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: 'no-reply@managedorg.io',
          pass: 'Sreyo@91',
        },
      },
      settings: {
        defaultFrom: 'no-reply@managedorg.io',
        defaultReplyTo: 'no-reply@managedorg.io',
      },
  },
});