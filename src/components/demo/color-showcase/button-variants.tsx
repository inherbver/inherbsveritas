/**
 * Composant ButtonVariants pour démonstrer les variants de boutons
 */
import { Button } from '@/components/ui/button'

export const ButtonVariants = () => {
  return (
    <div className="space-y-6">
      {/* HerbisVeritas Variants */}
      <div className="space-y-3">
        <h4 className="font-medium">HerbisVeritas Variants</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="hv-primary">Primary</Button>
          <Button variant="hv-secondary">Secondary</Button>
          <Button variant="hv-accent">Accent</Button>
          <Button variant="hv-primary-outline">Primary Outline</Button>
          <Button variant="hv-primary-ghost">Primary Ghost</Button>
        </div>
      </div>

      {/* Standard Variants */}
      <div className="space-y-3">
        <h4 className="font-medium">Standard Variants</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Semantic Variants */}
      <div className="space-y-3">
        <h4 className="font-medium">Semantic Variants</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="hv-success">Success</Button>
          <Button variant="hv-warning">Warning</Button>
          <Button variant="hv-error">Error</Button>
          <Button variant="hv-info">Info</Button>
        </div>
      </div>
    </div>
  );
};