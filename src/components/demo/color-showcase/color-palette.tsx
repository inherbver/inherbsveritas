/**
 * Composant ColorPalette pour afficher une gamme de couleurs
 */

interface ColorSwatchProps {
  shade: string;
  label: string;
  isDefault?: boolean;
}

const ColorSwatch = ({ shade, label, isDefault }: ColorSwatchProps) => {
  const isLight = ['50', '100', '200', '300'].includes(shade);
  const textColor = isLight ? 'text-gray-800' : 'text-white';
  const fontWeight = isDefault ? 'font-bold' : '';
  
  return (
    <div className={`bg-${shade} p-3 rounded text-center text-xs ${textColor} ${fontWeight}`}>
      {label}
    </div>
  );
};

interface ColorPaletteProps {
  colorName: string;
  colorPrefix: string;
  icon: string;
  description: string;
}

export const ColorPalette = ({ colorName, colorPrefix, icon, description }: ColorPaletteProps) => {
  const shades = [
    { shade: 50, label: '50' },
    { shade: 100, label: '100' },
    { shade: 200, label: '200' },
    { shade: 300, label: '300' },
    { shade: 400, label: '400' },
    { shade: 500, label: '500 DEFAULT', isDefault: true },
    { shade: 600, label: '600' },
    { shade: 700, label: '700' },
    { shade: 800, label: '800' },
    { shade: 900, label: '900' },
  ];

  return (
    <div className="space-y-3">
      <h3 className={`font-semibold text-${colorPrefix}`}>
        {icon} {colorName} - {description}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {shades.map(({ shade, label, isDefault }) => (
          <ColorSwatch
            key={shade}
            shade={`${colorPrefix}-${shade}`}
            label={label}
            {...(isDefault !== undefined && { isDefault })}
          />
        ))}
      </div>
    </div>
  );
};