/**
 * Logique de validation pour SignupForm avec Zod
 */

import { z } from 'zod'

export const signupFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Format email invalide'),
  password: z
    .string()
    .min(8, 'Mot de passe trop court (min. 8 caractères)')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirmation requise'),
  firstName: z
    .string()
    .min(2, 'Prénom trop court (min. 2 caractères)')
    .max(50, 'Prénom trop long (max. 50 caractères)'),
  lastName: z
    .string()
    .min(2, 'Nom trop court (min. 2 caractères)')
    .max(50, 'Nom trop long (max. 50 caractères)')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

export type FormData = z.infer<typeof signupFormSchema>

export interface FormErrors {
  [key: string]: string;
}

export const validateForm = (formData: FormData): FormErrors => {
  try {
    signupFormSchema.parse(formData)
    return {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormErrors = {}
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message
        }
      })
      return errors
    }
    return { form: 'Erreur de validation inattendue' }
  }
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