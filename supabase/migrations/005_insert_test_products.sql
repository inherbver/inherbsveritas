-- Migration: Insertion de 9 produits de test pour la boutique HerbisVeritas
-- Date: 2025-01-28
-- Objectif: Créer des données variées pour tester l'affichage de 9 product cards

INSERT INTO products (
    slug,
    category_id,
    name,
    description_short,
    description_long,
    price,
    stock,
    unit,
    image_url,
    inci_list,
    labels,
    is_new
) VALUES
-- Produit 1: Savon à la lavande
(
    'savon-lavande-artisanal',
    '4133e9e1-960d-4232-b2b9-e4e8090c3035',
    'Savon Artisanal à la Lavande',
    'Savon surgras enrichi à l''huile essentielle de lavande de Provence',
    'Savon traditionnel fabriqué selon les méthodes artisanales occitanes. Enrichi à 8% en beurre de karité bio et huile d''olive première pression. La lavande vraie utilisée provient de nos champs partenaires du plateau de Valensole.',
    12.90,
    25,
    'pièce',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_1.webp',
    ARRAY['Sodium Olivate', 'Aqua', 'Butyrospermum Parkii Butter', 'Lavandula Angustifolia Oil', 'Linalool', 'Limonene'],
    ARRAY['bio', 'recolte_main', 'partenariat_producteurs']::product_label[],
    true
),
-- Produit 2: Huile essentielle d'eucalyptus
(
    'huile-essentielle-eucalyptus-radiata',
    '2459ad65-120e-4076-84ae-d83966d98b37',
    'Huile Essentielle Eucalyptus Radiata',
    'Huile essentielle pure d''eucalyptus radiata, récolte 2024',
    'Eucalyptus radiata distillé dans nos ateliers à partir de feuilles fraîches récoltées en Occitanie. Cette huile essentielle aux propriétés respiratoires exceptionnelles est idéale pour la diffusion atmosphérique et les soins wellness.',
    18.50,
    15,
    '10ml',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_2.webp',
    ARRAY['Eucalyptus Radiata Leaf Oil'],
    ARRAY['bio', 'origine_occitanie', 'essence_precieuse']::product_label[],
    false
),
-- Produit 3: Crème visage au miel
(
    'creme-visage-miel-propolis',
    '98f531d5-e128-428f-999e-5e4946b4ab4b',
    'Crème Visage Miel & Propolis',
    'Soin nourrissant au miel de châtaignier et propolis des Cévennes',
    'Crème onctueuse formulée avec du miel de châtaignier récolté dans les Cévennes et de la propolis purifiée. Enrichie en huile de jojoba et beurre de karité, elle nourrit en profondeur les peaux sèches tout en respectant l''équilibre cutané naturel.',
    28.00,
    12,
    '50ml',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_3.webp',
    ARRAY['Aqua', 'Butyrospermum Parkii Butter', 'Simmondsia Chinensis Oil', 'Mel', 'Propolis Extract', 'Tocopherol', 'Linalool'],
    ARRAY['bio', 'partenariat_producteurs', 'rituel_bien_etre']::product_label[],
    true
),
-- Produit 4: Déodorant solide
(
    'deodorant-solide-palmarosa',
    '98f531d5-e128-428f-999e-5e4946b4ab4b',
    'Déodorant Solide Palmarosa',
    'Protection 24h aux huiles essentielles de palmarosa et tea tree',
    'Déodorant solide ultra-efficace formulé sans sels d''aluminium. Les huiles essentielles de palmarosa et tea tree offrent une protection antibactérienne naturelle tandis que l''amidon de maïs absorbe l''humidité pour un confort optimal.',
    9.50,
    30,
    'stick 75g',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_4.webp',
    ARRAY['Cocos Nucifera Oil', 'Butyrospermum Parkii Butter', 'Zea Mays Starch', 'Cymbopogon Martinii Oil', 'Melaleuca Alternifolia Oil'],
    ARRAY['bio', 'recolte_main']::product_label[],
    false
),
-- Produit 5: Tisane digestive
(
    'tisane-digestive-occitane',
    '2459ad65-120e-4076-84ae-d83966d98b37',
    'Tisane Digestive d''Occitanie',
    'Mélange de plantes digestives: verveine, tilleul, mélisse',
    'Tisane composée de plantes aromatiques sélectionnées et séchées selon les traditions occitanes. La verveine citronnée, le tilleul et la mélisse s''associent pour créer une infusion douce aux vertus apaisantes et digestives.',
    14.20,
    20,
    'sachet 50g',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_5.webp',
    null,
    ARRAY['bio', 'origine_occitanie', 'rituel_bien_etre']::product_label[],
    false
),
-- Produit 6: Baume réparateur
(
    'baume-reparateur-calendula',
    '98f531d5-e128-428f-999e-5e4946b4ab4b',
    'Baume Réparateur au Calendula',
    'Soin intensif aux macérats de calendula et millepertuis',
    'Baume concentré aux propriétés cicatrisantes et apaisantes. Le macérat de calendula associé au millepertuis forme un soin d''exception pour les peaux abîmées, gerçures et petites blessures. Sa texture riche pénètre rapidement sans laisser de film gras.',
    16.80,
    18,
    '30ml',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_6.webp',
    ARRAY['Helianthus Annuus Oil', 'Cera Alba', 'Calendula Officinalis Extract', 'Hypericum Perforatum Extract', 'Tocopherol'],
    ARRAY['bio', 'recolte_main', 'partenariat_producteurs']::product_label[],
    true
),
-- Produit 7: Huile de massage
(
    'huile-massage-detente-lavande',
    '98f531d5-e128-428f-999e-5e4946b4ab4b',
    'Huile de Massage Détente',
    'Synergie relaxante lavande vraie, petit grain et ylang-ylang',
    'Huile de massage aux propriétés relaxantes exceptionnelles. Cette synergie d''huiles essentielles de Provence dans une base d''huile de tournesol bio offre un moment de détente absolue. Parfaite pour les massages du soir et la préparation au sommeil.',
    24.90,
    8,
    '100ml',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_1.webp',
    ARRAY['Helianthus Annuus Oil', 'Lavandula Angustifolia Oil', 'Citrus Aurantium Leaf Oil', 'Cananga Odorata Oil', 'Linalool', 'Limonene', 'Geraniol'],
    ARRAY['bio', 'origine_occitanie', 'rituel_bien_etre']::product_label[],
    false
),
-- Produit 8: Shampoing solide
(
    'shampoing-solide-cheveux-gras',
    '4133e9e1-960d-4232-b2b9-e4e8090c3035',
    'Shampoing Solide Cheveux Gras',
    'Formule purifiante à l''argile verte et huiles essentielles',
    'Shampoing solide spécialement formulé pour les cheveux gras. L''argile verte illite absorbe l''excès de sébum tandis que les huiles essentielles de romarin et tea tree purifient le cuir chevelu. Une formulation concentrée équivalente à 2 flacons de shampoing liquide.',
    11.40,
    22,
    'galet 60g',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_2.webp',
    ARRAY['Sodium Cocoyl Glutamate', 'Illite', 'Rosmarinus Officinalis Oil', 'Melaleuca Alternifolia Oil', 'Limonene'],
    ARRAY['bio', 'origine_occitanie']::product_label[],
    true
),
-- Produit 9: Bougie parfumée
(
    'bougie-parfumee-figuier-provence',
    '98f531d5-e128-428f-999e-5e4946b4ab4b',
    'Bougie Parfumée Figuier de Provence',
    'Cire végétale parfumée aux notes vertes et lactées du figuier',
    'Bougie artisanale coulée dans nos ateliers à partir de cire de soja bio. Le parfum développé exclusivement pour HerbisVeritas évoque les figuiers centenaires de Provence avec ses notes vertes de feuilles et l''onctuosité du fruit mûr. Mèche en coton bio pour une combustion propre.',
    32.00,
    6,
    'pot 200g',
    'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_3.webp',
    ARRAY['Soja Wax', 'Parfum Figuier Provence', 'Cotton Wick'],
    ARRAY['bio', 'origine_occitanie', 'rituel_bien_etre', 'essence_precieuse']::product_label[],
    true
);