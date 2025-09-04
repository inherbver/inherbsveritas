// Composant pour afficher l'échelle des couleurs neutres HerbisVeritas
export function NeutralScale() {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 10 }, (_, i) => {
        const shade = i === 0 ? 50 : i * 100;
        const isLight = shade <= 300;
        const textColor = isLight ? 'text-gray-800' : 'text-white';
        const borderClass = shade === 50 ? 'border' : '';
        
        return (
          <div
            key={shade}
            className={`bg-hv-neutral-${shade} ${borderClass} p-4 rounded text-center text-xs ${textColor}`}
          >
            {shade}
          </div>
        );
      })}
    </div>
  );
}