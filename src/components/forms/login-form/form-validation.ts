/**
 * Logique de validation pour LoginForm avec Zod
 */

import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Format email invalide'),
  password: z
    .string()
    .min(6, 'Mot de passe trop court (min. 6 caractères)')
})

export type LoginFormData = z.infer<typeof loginFormSchema>

export interface FormErrors {
  [key: string]: string
}

export const validateLoginForm = (formData: LoginFormData): FormErrors => {
  try {
    loginFormSchema.parse(formData)
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
}