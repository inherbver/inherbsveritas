/**
 * Logique de validation pour SignupForm
 */

export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface FormErrors {
  [key: string]: string;
}

export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};
  
  // Validation email
  if (!formData.email) {
    errors['email'] = 'Email requis';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors['email'] = 'Format email invalide';
  }
  
  // Validation mot de passe
  if (!formData.password) {
    errors['password'] = 'Mot de passe requis';
  } else if (formData.password.length < 8) {
    errors['password'] = 'Mot de passe trop court (min. 8 caractères)';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors['password'] = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
  }
  
  // Validation confirmation mot de passe
  if (!formData.confirmPassword) {
    errors['confirmPassword'] = 'Confirmation requise';
  } else if (formData.password !== formData.confirmPassword) {
    errors['confirmPassword'] = 'Les mots de passe ne correspondent pas';
  }
  
  // Validation prénom
  if (!formData.firstName) {
    errors['firstName'] = 'Prénom requis';
  } else if (formData.firstName.length < 2) {
    errors['firstName'] = 'Prénom trop court (min. 2 caractères)';
  }
  
  // Validation nom
  if (!formData.lastName) {
    errors['lastName'] = 'Nom requis';
  } else if (formData.lastName.length < 2) {
    errors['lastName'] = 'Nom trop court (min. 2 caractères)';
  }
  
  return errors;
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  
  // Mappage direct avec default failsafe
  if (score <= 1) return { score, label: 'Très faible', color: 'red' };
  if (score <= 2) return { score, label: 'Faible', color: 'orange' };
  if (score <= 3) return { score, label: 'Moyen', color: 'yellow' };
  if (score <= 4) return { score, label: 'Fort', color: 'blue' };
  return { score, label: 'Très fort', color: 'green' };
};