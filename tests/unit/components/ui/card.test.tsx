import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default card classes', () => {
      render(<Card data-testid="card">Card</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Card</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class', 'rounded-lg');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Card ref={ref}>Card</Card>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe('CardHeader', () => {
    it('renders header content', () => {
      render(
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      );
      
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies header classes', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('applies custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header', 'flex');
    });
  });

  describe('CardTitle', () => {
    it('renders title text', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('applies title classes', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('renders title with correct styling', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-2xl', 'font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('renders description text', () => {
      render(<CardDescription>Card description</CardDescription>);
      expect(screen.getByText('Card description')).toBeInTheDocument();
    });

    it('applies description classes', () => {
      render(<CardDescription data-testid="description">Description</CardDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('renders description with correct styling', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('renders content', () => {
      render(
        <CardContent>
          <p>Main content</p>
        </CardContent>
      );
      
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });

    it('applies content classes', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('applies custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content', 'p-6');
    });
  });

  describe('CardFooter', () => {
    it('renders footer content', () => {
      render(
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies footer classes', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });
  });

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Product Card</CardTitle>
            <CardDescription>A beautiful product description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Product details and information</p>
          </CardContent>
          <CardFooter>
            <button>Add to Cart</button>
          </CardFooter>
        </Card>
      );

      const card = screen.getByTestId('complete-card');
      expect(card).toBeInTheDocument();
      
      expect(screen.getByText('Product Card')).toBeInTheDocument();
      expect(screen.getByText('A beautiful product description')).toBeInTheDocument();
      expect(screen.getByText('Product details and information')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Add to Cart');
    });

    it('works without optional components', () => {
      render(
        <Card>
          <CardContent>
            <p>Simple card content</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Simple card content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <Card aria-label="Product card" role="article" data-testid="card">
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-label', 'Product card');
      expect(card).toHaveAttribute('role', 'article');
    });

    it('maintains proper card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Main Title')).toBeInTheDocument();
    });
  });
});