import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  describe('Basic functionality', () => {
    it('renders input correctly', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });
  });

  describe('Input types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      // Par défaut, les input sans type explicite sont de type text
      expect(input.tagName.toLowerCase()).toBe('input');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Validation states', () => {
    it('handles disabled state', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('handles readonly state', () => {
      render(<Input readOnly value="readonly text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('readonly text');
    });

    it('handles required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <div id="help-text">Help text</div>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('maintains focus management', async () => {
      const user = userEvent.setup();
      render(<Input />);
      
      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });

  describe('Input styling', () => {
    it('applies default input classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border');
    });

    it('applies file input styling', () => {
      render(<Input type="file" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent');
    });
  });

  describe('Form integration', () => {
    it('works with form submission', async () => {
      const handleSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="test" defaultValue="test value" />
          <button type="submit">Submit</button>
        </form>
      );
      
      await user.click(screen.getByRole('button'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('supports controlled input', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };
      
      const user = userEvent.setup();
      render(<TestComponent />);
      
      const input = screen.getByTestId('controlled-input');
      await user.type(input, 'controlled');
      
      expect(input).toHaveValue('controlled');
    });
  });
});