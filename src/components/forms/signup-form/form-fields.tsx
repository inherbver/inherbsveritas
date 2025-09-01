/**
 * Champs de formulaire pour SignupForm
 */

import { Input, Label } from './temporary-ui';
import { FormData, FormErrors } from './form-validation';

interface FormFieldsProps {
  formData: FormData;
  formErrors: FormErrors;
  handleInputChange: (field: keyof FormData, value: string) => void;
}

export const FormFields = ({ formData, formErrors, handleInputChange }: FormFieldsProps) => {
  return (
    <>
      {/* Nom et Prénom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstName" required>
            Prénom
          </Label>
          <Input
            id="signup-firstName"
            type="text"
            placeholder="Jean"
            value={formData.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('firstName', e.target.value)
            }
            error={formErrors.firstName}
            required
            autoComplete="given-name"
          />
          {formErrors.firstName && (
            <p className="text-sm text-red-600">{formErrors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-lastName" required>
            Nom
          </Label>
          <Input
            id="signup-lastName"
            type="text"
            placeholder="Dupont"
            value={formData.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('lastName', e.target.value)
            }
            error={formErrors.lastName}
            required
            autoComplete="family-name"
          />
          {formErrors.lastName && (
            <p className="text-sm text-red-600">{formErrors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="signup-email" required>
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleInputChange('email', e.target.value)
          }
          error={formErrors.email}
          required
          autoComplete="email"
        />
        {formErrors.email && (
          <p className="text-sm text-red-600">{formErrors.email}</p>
        )}
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="signup-password" required>
          Mot de passe
        </Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleInputChange('password', e.target.value)
          }
          error={formErrors.password}
          required
          autoComplete="new-password"
        />
        {formErrors.password && (
          <p className="text-sm text-red-600">{formErrors.password}</p>
        )}
        <p className="text-xs text-gray-600">
          Au moins 8 caractères avec majuscule, minuscule et chiffre
        </p>
      </div>

      {/* Confirmation mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="signup-confirmPassword" required>
          Confirmer le mot de passe
        </Label>
        <Input
          id="signup-confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleInputChange('confirmPassword', e.target.value)
          }
          error={formErrors.confirmPassword}
          required
          autoComplete="new-password"
        />
        {formErrors.confirmPassword && (
          <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>
        )}
      </div>
    </>
  );
};