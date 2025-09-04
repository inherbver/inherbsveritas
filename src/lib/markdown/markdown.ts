// TEMPORAIRE: Version stub pour permettre le build
// TODO: Réimplémenter avec gray-matter quand installé

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  content: string;
  [key: string]: any;
}

export function getPostSlugs(): string[] {
  // TODO: Implémentation réelle
  return [];
}

export function getPostBySlug(slug: string): Post | null {
  // TODO: Implémentation réelle
  console.log('Post fetching not implemented for:', slug);
  return null;
}

export function getAllPosts(): Post[] {
  // TODO: Implémentation réelle
  return [];
}