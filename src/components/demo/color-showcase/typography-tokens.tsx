/**
 * Composant TypographyTokens pour démonstrer la typologie et l'espacement
 */

export const TypographyTokens = () => {
  return (
    <div className="space-y-8">
      {/* Typography Scale */}
      <div className="space-y-4">
        <h4 className="font-semibold">Tailles fluides (clamp responsive)</h4>
        <div className="space-y-2">
          <div className="text-xs">text-xs • Taille XS fluide (12-14px)</div>
          <div className="text-sm">text-sm • Taille SM fluide (14-15px)</div>
          <div className="text-base">text-base • Taille MD/body fluide (16-18px)</div>
          <div className="text-lg">text-lg • Taille LG fluide (18-22px)</div>
          <div className="text-xl">text-xl • Taille XL fluide (22-28px)</div>
          <div className="text-2xl">text-2xl • Taille 2XL fluide (28-36px)</div>
          <div className="text-3xl">text-3xl • Taille 3XL fluide (36-48px)</div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="space-y-4">
        <h4 className="font-semibold">Poids de police</h4>
        <div className="space-y-2">
          <div className="font-regular">font-regular • Poids regular (400)</div>
          <div className="font-medium">font-medium • Poids medium (500)</div>
          <div className="font-semibold">font-semibold • Poids semibold (600)</div>
          <div className="font-bold">font-bold • Poids bold (700)</div>
        </div>
      </div>

      {/* Spacing Scale */}
      <div className="space-y-4">
        <h4 className="font-semibold">Échelle d&apos;espacement (4px base)</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="bg-hv-primary w-2xs h-4 rounded"></div>
            <span>w-2xs • 4px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-hv-primary w-xs h-4 rounded"></div>
            <span>w-xs • 8px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-hv-primary w-sm h-4 rounded"></div>
            <span>w-sm • 12px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-hv-primary w-md h-4 rounded"></div>
            <span>w-md • 16px</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-hv-primary w-lg h-4 rounded"></div>
            <span>w-lg • 20px</span>
          </div>
        </div>
      </div>
    </div>
  );
};