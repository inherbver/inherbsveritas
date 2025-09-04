// TEMPORAIRE: Version stub pour permettre le build
// TODO: Réimplémenter avec nodemailer quand installé

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (data: EmailPayload) => {
  // TODO: Implémentation réelle avec nodemailer
  console.log('Email sending not implemented:', data.to, data.subject);
  return { success: false, error: 'Email service not implemented' };
};