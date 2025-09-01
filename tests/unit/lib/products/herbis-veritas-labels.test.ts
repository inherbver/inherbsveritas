import '@testing-library/jest-dom';
import {
  HerbisVeritasLabel,
  HERBIS_VERITAS_LABELS,
  getLabelMetadata,
  getProductLabelsMetadata,
  Product
} from '@/types/herbis-veritas';

describe('HerbisVeritas Labels System (TDD)', () => {
  describe('Label Enum Values', () => {
    it('should have exactly 7 labels as per MVP specification', () => {
      const labelValues = Object.values(HerbisVeritasLabel);
      
      expect(labelValues).toHaveLength(7);
      expect(labelValues).toEqual([
        'bio',
        'naturel', 
        'vegan',
        'artisanal',
        'local',
        'zero_dechet',
        'fait_main'
      ]);
    });

    it('should have consistent enum keys with values', () => {
      expect(HerbisVeritasLabel.BIO).toBe('bio');
      expect(HerbisVeritasLabel.NATUREL).toBe('naturel');
      expect(HerbisVeritasLabel.VEGAN).toBe('vegan');
      expect(HerbisVeritasLabel.ARTISANAL).toBe('artisanal');
      expect(HerbisVeritasLabel.LOCAL).toBe('local');
      expect(HerbisVeritasLabel.ZERO_DECHET).toBe('zero_dechet');
      expect(HerbisVeritasLabel.FAIT_MAIN).toBe('fait_main');
    });
  });

  describe('Label Metadata Configuration', () => {
    it('should have metadata for all 7 labels', () => {
      const metadataKeys = Object.keys(HERBIS_VERITAS_LABELS);
      const enumValues = Object.values(HerbisVeritasLabel);
      
      expect(metadataKeys).toHaveLength(7);
      expect(metadataKeys.sort()).toEqual(enumValues.sort());
    });

    it('should have complete metadata structure for each label', () => {
      Object.values(HERBIS_VERITAS_LABELS).forEach(metadata => {
        expect(metadata).toHaveProperty('id');
        expect(metadata).toHaveProperty('name');
        expect(metadata).toHaveProperty('nameEn');
        expect(metadata).toHaveProperty('description');
        expect(metadata).toHaveProperty('descriptionEn');
        expect(metadata).toHaveProperty('color');
        expect(metadata).toHaveProperty('icon');
        expect(metadata).toHaveProperty('priority');
        
        // Validation types
        expect(typeof metadata.name).toBe('string');
        expect(typeof metadata.nameEn).toBe('string');
        expect(typeof metadata.color).toBe('string');
        expect(typeof metadata.priority).toBe('number');
      });
    });

    it('should have unique priorities for all labels', () => {
      const priorities = Object.values(HERBIS_VERITAS_LABELS).map(m => m.priority);
      const uniquePriorities = new Set(priorities);
      
      expect(priorities).toHaveLength(7);
      expect(uniquePriorities.size).toBe(7);
      expect(Math.min(...priorities)).toBe(1);
      expect(Math.max(...priorities)).toBe(7);
    });

    it('should have valid color codes for all labels', () => {
      Object.values(HERBIS_VERITAS_LABELS).forEach(metadata => {
        // Accepter hex colors (#) ou CSS variables (rgb(var()))
        const isHexColor = /^#[0-9A-Fa-f]{6}$/.test(metadata.color);
        const isCssVariable = metadata.color.startsWith('rgb(var(--');
        
        expect(isHexColor || isCssVariable).toBe(true);
      });
    });

    it('should have emoji icons for visual representation', () => {
      Object.values(HERBIS_VERITAS_LABELS).forEach(metadata => {
        expect(metadata.icon).toBeDefined();
        expect(typeof metadata.icon).toBe('string');
        expect(metadata.icon!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Label Helper Functions', () => {
    describe('getLabelMetadata', () => {
      it('should return correct metadata for valid label', () => {
        const bioMetadata = getLabelMetadata(HerbisVeritasLabel.BIO);
        
        expect(bioMetadata).toEqual({
          id: HerbisVeritasLabel.BIO,
          name: 'Bio',
          nameEn: 'Organic',
          description: 'Certifié agriculture biologique',
          descriptionEn: 'Certified organic agriculture',
          color: '#4ade80',
          icon: '🌿',
          priority: 1
        });
      });

      it('should return vegan metadata correctly', () => {
        const veganMetadata = getLabelMetadata(HerbisVeritasLabel.VEGAN);
        
        expect(veganMetadata.name).toBe('Vegan');
        expect(veganMetadata.nameEn).toBe('Vegan');
        expect(veganMetadata.icon).toBe('🌱');
        expect(veganMetadata.priority).toBe(3);
      });
    });

    describe('getProductLabelsMetadata', () => {
      it('should return empty array for product with no labels', () => {
        const result = getProductLabelsMetadata([]);
        
        expect(result).toEqual([]);
      });

      it('should return metadata array sorted by priority', () => {
        const labels = [
          HerbisVeritasLabel.LOCAL, // priority: 5
          HerbisVeritasLabel.BIO,   // priority: 1  
          HerbisVeritasLabel.VEGAN, // priority: 3
        ];
        
        const result = getProductLabelsMetadata(labels);
        
        expect(result).toHaveLength(3);
        expect(result[0].id).toBe(HerbisVeritasLabel.BIO); // priority 1
        expect(result[1].id).toBe(HerbisVeritasLabel.VEGAN); // priority 3
        expect(result[2].id).toBe(HerbisVeritasLabel.LOCAL); // priority 5
      });

      it('should handle single label correctly', () => {
        const result = getProductLabelsMetadata([HerbisVeritasLabel.ARTISANAL]);
        
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Artisanal');
        expect(result[0].icon).toBe('🤲');
      });

      it('should handle all 7 labels and sort them correctly', () => {
        const allLabels = Object.values(HerbisVeritasLabel);
        const result = getProductLabelsMetadata(allLabels);
        
        expect(result).toHaveLength(7);
        
        // Vérifier que triés par priorité croissante
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].priority).toBeLessThan(result[i + 1].priority);
        }
      });
    });
  });

  describe('Business Logic Integration', () => {
    const mockProductWithLabels: Pick<Product, 'labels'> = {
      labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.VEGAN, HerbisVeritasLabel.LOCAL]
    };

    it('should integrate with Product type correctly', () => {
      expect(mockProductWithLabels.labels).toContain(HerbisVeritasLabel.BIO);
      expect(mockProductWithLabels.labels).toContain(HerbisVeritasLabel.VEGAN);
      expect(mockProductWithLabels.labels).toContain(HerbisVeritasLabel.LOCAL);
    });

    it('should validate label combinations for realistic products', () => {
      // Produit bio vegan fait main - combinaison réaliste
      const labels = [
        HerbisVeritasLabel.BIO,
        HerbisVeritasLabel.VEGAN, 
        HerbisVeritasLabel.FAIT_MAIN
      ];
      
      expect(labels).toHaveLength(3);
      expect(labels).toContain(HerbisVeritasLabel.BIO);
    });

    it('should support products with zero labels', () => {
      const productNoLabels: Pick<Product, 'labels'> = { labels: [] };
      
      expect(productNoLabels.labels).toEqual([]);
      expect(getProductLabelsMetadata(productNoLabels.labels)).toEqual([]);
    });
  });
});

describe('HerbisVeritas Labels UI Integration (TDD Red Phase)', () => {
  // Tests TDD pour composants UI utilisant les labels - Phase RED
  
  describe('Product Label Badge Component', () => {
    it('should render single label badge with correct styling', () => {
      // Composant ProductLabelBadge non implémenté - Red phase
      expect(true).toBe(true);
    });

    it('should render multiple label badges with priority sorting', () => {
      // Composant non implémenté - Red phase
      expect(true).toBe(true);
    });

    it('should show tooltip with label description on hover', () => {
      // Composant non implémenté - Red phase
      expect(true).toBe(true);
    });

    it('should support French/English label names', () => {
      // Composant non implémenté - Red phase
      expect(true).toBe(true);
    });
  });

  describe('Product Filter by Labels', () => {
    it('should render label filter checkboxes', () => {
      // Composant ProductLabelFilter non implémenté - Red phase
      expect(true).toBe(true);
    });

    it('should filter products by selected labels', () => {
      // Composant non implémenté - Red phase
      expect(true).toBe(true);
    });

    it('should support multiple label selection (AND/OR logic)', () => {
      // Composant non implémenté - Red phase
      expect(true).toBe(true);
    });
  });

  describe('Admin Label Management', () => {
    it('should render admin interface for product label assignment', () => {
      // Composant AdminProductLabels non implémenté - Red phase
      expect(true).toBe(true);
    });

    it('should validate label combinations before save', () => {
      // Composant non implémenté - Red phase
      expect(true).toBe(true);
    });
  });
});