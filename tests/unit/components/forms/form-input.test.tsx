import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FormInput } from '@/components/forms/form-input'
import { AUTH_MESSAGES } from '@/lib/messages/auth-messages'

// Mock validation function
const mockValidateEmail = jest.fn()

describe('FormInput with AuthMessage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('renders input with placeholder', () => {
      render(<FormInput placeholder="Enter email" />)
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    })

    it('calls onChange when value changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<FormInput onChange={handleChange} />)
      
      await user.type(screen.getByRole('textbox'), 'test')
      
      expect(handleChange).toHaveBeenCalledTimes(4) // 't', 'e', 's', 't'
    })
  })

  describe('Validation with AuthMessage', () => {
    it('shows error message when validation fails', async () => {
      const user = userEvent.setup()
      mockValidateEmail.mockReturnValue(AUTH_MESSAGES.validation.emailInvalid)
      
      render(
        <FormInput 
          type="email" 
          validation={mockValidateEmail}
          placeholder="Email"
        />
      )
      
      await user.type(screen.getByRole('textbox'), 'invalid-email')
      await user.tab() // Trigger blur
      
      await waitFor(() => {
        expect(screen.getByText('Email invalide')).toBeInTheDocument()
      })
    })

    it('clears error when validation passes', async () => {
      const user = userEvent.setup()
      mockValidateEmail
        .mockReturnValueOnce(AUTH_MESSAGES.validation.emailInvalid)
        .mockReturnValueOnce(null)
      
      render(<FormInput validation={mockValidateEmail} />)
      
      const input = screen.getByRole('textbox')
      
      // First: invalid input
      await user.type(input, 'invalid')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Email invalide')).toBeInTheDocument()
      })
      
      // Second: valid input
      await user.clear(input)
      await user.type(input, 'valid@test.com')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Email invalide')).not.toBeInTheDocument()
      })
    })

    it('does not show error when showError is false', async () => {
      const user = userEvent.setup()
      mockValidateEmail.mockReturnValue(AUTH_MESSAGES.validation.emailInvalid)
      
      render(
        <FormInput 
          validation={mockValidateEmail}
          showError={false}
        />
      )
      
      await user.type(screen.getByRole('textbox'), 'invalid')
      await user.tab()
      
      // Wait to ensure no error appears
      await waitFor(() => {
        expect(screen.queryByText('Email invalide')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('Error display patterns', () => {
    it('shows error with correct styling', async () => {
      const user = userEvent.setup()
      mockValidateEmail.mockReturnValue({
        type: 'error',
        key: 'validation.emailInvalid'
      })
      
      render(<FormInput validation={mockValidateEmail} />)
      
      await user.type(screen.getByRole('textbox'), 'invalid')
      await user.tab()
      
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toBeInTheDocument()
        expect(errorAlert).toHaveClass('alert-error')
      })
    })

    it('supports different message types', async () => {
      const user = userEvent.setup()
      mockValidateEmail.mockReturnValue({
        type: 'warning',
        key: 'validation.passwordWeak'
      })
      
      render(<FormInput type="password" validation={mockValidateEmail} />)
      
      await user.type(screen.getByRole('textbox'), 'weak')
      await user.tab()
      
      await waitFor(() => {
        const warningAlert = screen.getByRole('alert')
        expect(warningAlert).toHaveClass('alert-warning')
      })
    })
  })
})