import {
  HerbisVeritasLabel,
  HERBIS_VERITAS_LABELS,
  getLabelMetadata,
  getProductLabelsMetadata,
  calculateCartTotal,
  validateProductStock,
  isProductLowStock,
  getLocalizedCategory,
  getLocalizedProduct
} from '@/types/herbis-veritas';

describe('HerbisVeritas Business Logic', () => {
  describe('Labels System', () => {
    it('has all 7 labels defined according to MVP', () => {
      expect(Object.keys(HerbisVeritasLabel)).toHaveLength(7);
      expect(Object.keys(HERBIS_VERITAS_LABELS)).toHaveLength(7);
      
      // Vérifier les 7 labels MVP
      expect(HerbisVeritasLabel.BIO).toBe('bio');
      expect(HerbisVeritasLabel.NATUREL).toBe('naturel');
      expect(HerbisVeritasLabel.VEGAN).toBe('vegan');
      expect(HerbisVeritasLabel.ARTISANAL).toBe('artisanal');
      expect(HerbisVeritasLabel.LOCAL).toBe('local');
      expect(HerbisVeritasLabel.ZERO_DECHET).toBe('zero_dechet');
      expect(HerbisVeritasLabel.FAIT_MAIN).toBe('fait_main');
    });

    it('has correct label metadata structure', () => {
      const bioLabel = HERBIS_VERITAS_LABELS[HerbisVeritasLabel.BIO];
      
      expect(bioLabel).toEqual({
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

    it('has correct priority ordering', () => {
      const priorities = Object.values(HERBIS_VERITAS_LABELS).map(label => label.priority);
      const sortedPriorities = [...priorities].sort((a, b) => a - b);
      
      expect(priorities).toEqual(sortedPriorities);
      expect(priorities).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('getLabelMetadata returns correct metadata', () => {
      const metadata = getLabelMetadata(HerbisVeritasLabel.VEGAN);
      
      expect(metadata.name).toBe('Vegan');
      expect(metadata.nameEn).toBe('Vegan');
      expect(metadata.icon).toBe('🌱');
      expect(metadata.priority).toBe(3);
    });

    it('getProductLabelsMetadata sorts by priority', () => {
      const labels = [
        HerbisVeritasLabel.LOCAL,      // priority: 5
        HerbisVeritasLabel.BIO,        // priority: 1
        HerbisVeritasLabel.ARTISANAL   // priority: 4
      ];
      
      const metadata = getProductLabelsMetadata(labels);
      
      expect(metadata).toHaveLength(3);
      expect(metadata[0].priority).toBe(1); // BIO first
      expect(metadata[1].priority).toBe(4); // ARTISANAL second
      expect(metadata[2].priority).toBe(5); // LOCAL last
    });
  });

  describe('Cart Calculations', () => {
    const mockCartItems = [
      { product_id: '1', quantity: 2, price: 10.00 },
      { product_id: '2', quantity: 1, price: 25.00 },
      { product_id: '3', quantity: 3, price: 8.50 }
    ];

    it('calculates cart totals correctly', () => {
      const totals = calculateCartTotal(mockCartItems);
      
      // Subtotal: (2*10) + (1*25) + (3*8.5) = 20 + 25 + 25.5 = 70.5
      expect(totals.subtotal).toBe(70.5);
      
      // TVA 20%: 70.5 * 0.2 = 14.1
      expect(totals.tva).toBeCloseTo(14.1, 2);
      
      // Total: 70.5 + 14.1 = 84.6
      expect(totals.total).toBeCloseTo(84.6, 2);
    });

    it('calculates zero for empty cart', () => {
      const totals = calculateCartTotal([]);
      
      expect(totals.subtotal).toBe(0);
      expect(totals.tva).toBe(0);
      expect(totals.total).toBe(0);
    });

    it('handles single item correctly', () => {
      const singleItem = [{ product_id: '1', quantity: 1, price: 100.00 }];
      const totals = calculateCartTotal(singleItem);
      
      expect(totals.subtotal).toBe(100);
      expect(totals.tva).toBe(20); // 20%
      expect(totals.total).toBe(120);
    });
  });

  describe('Product Validation', () => {
    const mockProduct = {
      id: 'prod-1',
      sku: 'TEST-001',
      category_id: 'cat-1',
      i18n: {
        fr: { name: 'Test Product', description: 'Description' },
        en: { name: 'Test Product', description: 'Description' }
      },
      price: 15.00,
      stock_quantity: 5,
      low_stock_threshold: 2,
      inci_list: [],
      labels: [],
      images: [],
      is_active: true,
      is_featured: false,
      created_at: '2025-01-28T10:00:00Z',
      updated_at: '2025-01-28T10:00:00Z'
    };

    it('validates stock correctly', () => {
      expect(validateProductStock(mockProduct, 3)).toBe(true);
      expect(validateProductStock(mockProduct, 5)).toBe(true);
      expect(validateProductStock(mockProduct, 6)).toBe(false); // Plus que stock
      expect(validateProductStock(mockProduct, 0)).toBe(true);  // Quantité 0 OK
    });

    it('rejects inactive products', () => {
      const inactiveProduct = { ...mockProduct, is_active: false };
      expect(validateProductStock(inactiveProduct, 1)).toBe(false);
    });

    it('detects low stock correctly', () => {
      expect(isProductLowStock(mockProduct)).toBe(false); // 5 > 2

      const lowStockProduct = { ...mockProduct, stock_quantity: 2 };
      expect(isProductLowStock(lowStockProduct)).toBe(true); // 2 <= 2

      const veryLowStockProduct = { ...mockProduct, stock_quantity: 1 };
      expect(isProductLowStock(veryLowStockProduct)).toBe(true); // 1 <= 2
    });
  });

  describe('i18n Helpers', () => {
    const mockCategory = {
      id: 'cat-1',
      slug: 'test-category',
      parent_id: null,
      i18n: {
        fr: {
          name: 'Catégorie Test',
          description: 'Description française'
        },
        en: {
          name: 'Test Category',
          description: 'English description'
        }
      },
      sort_order: 1,
      is_active: true,
      created_at: '2025-01-28T10:00:00Z',
      updated_at: '2025-01-28T10:00:00Z'
    };

    const mockProduct = {
      id: 'prod-1',
      sku: 'TEST-001',
      category_id: 'cat-1',
      i18n: {
        fr: {
          name: 'Produit Test',
          description: 'Description française détaillée'
        },
        en: {
          name: 'Test Product',
          description: 'Detailed english description'
        }
      },
      price: 15.00,
      stock_quantity: 10,
      low_stock_threshold: 2,
      inci_list: [],
      labels: [],
      images: [],
      is_active: true,
      is_featured: false,
      created_at: '2025-01-28T10:00:00Z',
      updated_at: '2025-01-28T10:00:00Z'
    };

    it('returns correct French localization by default', () => {
      const categoryFr = getLocalizedCategory(mockCategory);
      expect(categoryFr.name).toBe('Catégorie Test');
      expect(categoryFr.description).toBe('Description française');

      const productFr = getLocalizedProduct(mockProduct);
      expect(productFr.name).toBe('Produit Test');
      expect(productFr.description).toBe('Description française détaillée');
    });

    it('returns correct English localization when specified', () => {
      const categoryEn = getLocalizedCategory(mockCategory, 'en');
      expect(categoryEn.name).toBe('Test Category');
      expect(categoryEn.description).toBe('English description');

      const productEn = getLocalizedProduct(mockProduct, 'en');
      expect(productEn.name).toBe('Test Product');
      expect(productEn.description).toBe('Detailed english description');
    });

    it('handles explicit French locale', () => {
      const categoryFr = getLocalizedCategory(mockCategory, 'fr');
      expect(categoryFr.name).toBe('Catégorie Test');

      const productFr = getLocalizedProduct(mockProduct, 'fr');
      expect(productFr.name).toBe('Produit Test');
    });
  });

  describe('TypeScript Type Safety', () => {
    it('enforces correct label enum values', () => {
      const validLabels: HerbisVeritasLabel[] = [
        HerbisVeritasLabel.BIO,
        HerbisVeritasLabel.VEGAN
      ];
      
      expect(validLabels).toContain('bio');
      expect(validLabels).toContain('vegan');
    });

    it('has correct i18n structure types', () => {
      const categoryI18n = {
        fr: { name: 'Test', description: 'Test desc' },
        en: { name: 'Test', description: 'Test desc' }
      };
      
      expect(categoryI18n.fr.name).toBeDefined();
      expect(categoryI18n.en.name).toBeDefined();
    });
  });
});