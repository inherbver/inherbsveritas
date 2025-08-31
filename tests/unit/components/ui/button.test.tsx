import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/button'

describe('Button Component MVP → V2', () => {
  describe('Basic functionality (MVP)', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies custom className', () => {
      render(<Button className="custom-class">Test</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('Loading state (MVP)', () => {
    it('shows loading state correctly', () => {
      render(<Button loading>Loading</Button>)
      
      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('disables button when loading', () => {
      render(<Button loading onClick={jest.fn()}>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Variants (V2 ready)', () => {
    it.each(['primary', 'secondary', 'ghost', 'danger'])(
      'supports %s variant',
      (variant) => {
        render(<Button variant={variant as any}>Test</Button>)
        expect(screen.getByRole('button')).toHaveClass(`btn-${variant}`)
      }
    )

    it('defaults to primary variant', () => {
      render(<Button>Default</Button>)
      expect(screen.getByRole('button')).toHaveClass('btn-primary')
    })
  })

  describe('Sizes (V2 ready)', () => {
    it.each(['sm', 'md', 'lg'])('supports %s size', (size) => {
      render(<Button size={size as any}>Test</Button>)
      expect(screen.getByRole('button')).toHaveClass(`btn-${size}`)
    })

    it('defaults to md size', () => {
      render(<Button>Default</Button>)
      expect(screen.getByRole('button')).toHaveClass('btn-md')
    })
  })

  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Button>Accessible</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument()
    })

    it('maintains focus management', async () => {
      const user = userEvent.setup()
      render(<Button>Focus me</Button>)
      
      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()
    })
  })
})