// TEMPORAIRE: Version stub pour permettre le build
// TODO: Réimplémenter avec Supabase client corrigé

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: any;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export async function addToCart(_productId: string, _quantity: number): Promise<Cart> {
  // TODO: Implémentation réelle
  throw new Error('Not implemented - use server actions instead');
}

export async function updateCartItem(_productId: string, _quantity: number): Promise<Cart> {
  // TODO: Implémentation réelle
  throw new Error('Not implemented - use server actions instead');
}

export async function removeFromCart(_productId: string): Promise<Cart> {
  // TODO: Implémentation réelle
  throw new Error('Not implemented - use server actions instead');
}

export async function getCart(): Promise<Cart> {
  // TODO: Implémentation réelle
  return {
    id: 'temp',
    items: [],
    total: 0
  };
}