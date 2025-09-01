// Categories CRUD Service - Phase GREEN TDD
// Implémentation pour faire passer tests Red

import { createClient } from '@/lib/supabase/server';
import { Category, CategoryTree } from '@/types/herbis-veritas';

export interface CreateCategoryData {
  slug: string;
  parent_id?: string | null;
  i18n: {
    fr: { name: string; description?: string };
    en: { name: string; description?: string };
  };
  image_url?: string;
  sort_order: number;
  is_active?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

// Service result type pattern
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Categories CRUD Service Implementation
 * Phase GREEN: Fait passer les tests TDD Red
 */
export class CategoriesService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryData): Promise<ServiceResult<Category>> {
    try {
      // Validation business rules
      const validation = this.validateCategoryData(data);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }

      // Check slug uniqueness
      const slugCheck = await this.checkSlugUniqueness(data.slug);
      if (!slugCheck) {
        return { success: false, error: 'Slug already exists' };
      }

      // Insert category
      const { data: newCategory, error } = await this.supabase
        .from('categories')
        .insert({
          slug: data.slug,
          parent_id: data.parent_id || null,
          i18n: data.i18n,
          image_url: data.image_url,
          sort_order: data.sort_order,
          is_active: data.is_active ?? true,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating category:', error);
        return { success: false, error: 'Database error' };
      }

      return { success: true, data: newCategory };
    } catch (error) {
      console.error('Service error creating category:', error);
      return { success: false, error: 'Internal service error' };
    }
  }

  /**
   * Get all active categories
   */
  async getCategories(includeInactive = false): Promise<ServiceResult<Category[]>> {
    try {
      let query = this.supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data: categories, error } = await query;

      if (error) {
        console.error('Database error fetching categories:', error);
        return { success: false, error: 'Database error' };
      }

      return { success: true, data: categories || [] };
    } catch (error) {
      console.error('Service error fetching categories:', error);
      return { success: false, error: 'Internal service error' };
    }
  }

  /**
   * Get categories by parent_id for hierarchy building
   */
  async getCategoriesByParent(parentId: string | null): Promise<ServiceResult<Category[]>> {
    try {
      const query = this.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      const { data: categories, error } = parentId 
        ? await query.eq('parent_id', parentId)
        : await query.is('parent_id', null);

      if (error) {
        console.error('Database error fetching categories by parent:', error);
        return { success: false, error: 'Database error' };
      }

      return { success: true, data: categories || [] };
    } catch (error) {
      console.error('Service error fetching categories by parent:', error);
      return { success: false, error: 'Internal service error' };
    }
  }

  /**
   * Get single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ServiceResult<Category | null>> {
    try {
      const { data: category, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return { success: true, data: null };
        }
        console.error('Database error fetching category by slug:', error);
        return { success: false, error: 'Database error' };
      }

      return { success: true, data: category };
    } catch (error) {
      console.error('Service error fetching category by slug:', error);
      return { success: false, error: 'Internal service error' };
    }
  }

  /**
   * Update category
   */
  async updateCategory(data: UpdateCategoryData): Promise<ServiceResult<Category>> {
    try {
      // Validation
      if (!data.id) {
        return { success: false, error: 'Category ID is required' };
      }

      // Prevent circular references if updating parent_id
      if (data.parent_id) {
        const circularCheck = await this.checkCircularReference(data.id, data.parent_id);
        if (!circularCheck) {
          return { success: false, error: 'Circular reference detected' };
        }
      }

      const updateData: any = {};
      if (data.slug) updateData.slug = data.slug;
      if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;
      if (data.i18n) updateData.i18n = data.i18n;
      if (data.image_url !== undefined) updateData.image_url = data.image_url;
      if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      // Add updated_at
      updateData.updated_at = new Date().toISOString();

      const { data: updatedCategory, error } = await this.supabase
        .from('categories')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('Database error updating category:', error);
        return { success: false, error: 'Database error' };
      }

      return { success: true, data: updatedCategory };
    } catch (error) {
      console.error('Service error updating category:', error);
      return { success: false, error: 'Internal service error' };
    }
  }

  /**
   * Soft delete category
   */
  async deleteCategory(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Check if category has children
      const childrenCheck = await this.supabase
        .from('categories')
        .select('id')
        .eq('parent_id', id)
        .eq('is_active', true);

      if (childrenCheck.data && childrenCheck.data.length > 0) {
        return { success: false, error: 'Cannot delete category with active children' };
      }

      // Check if category has products
      const productsCheck = await this.supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .eq('is_active', true);

      if (productsCheck.data && productsCheck.data.length > 0) {
        return { success: false, error: 'Cannot delete category with active products' };
      }

      // Soft delete
      const { error } = await this.supabase
        .from('categories')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Database error deleting category:', error);
        return { success: false, error: 'Database error' };
      }

      return { success: true, data: true };
    } catch (error) {
      console.error('Service error deleting category:', error);
      return { success: false, error: 'Internal service error' };
    }
  }

  /**
   * Build category tree from flat array
   */
  buildCategoryTree(categories: Category[]): CategoryTree[] {
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    // First pass: create all nodes
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        level: 0,
        children: []
      });
    });

    // Second pass: build hierarchy and set levels
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          node.level = parent.level + 1;
          parent.children!.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Sort by sort_order at each level
    const sortChildren = (nodes: CategoryTree[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootCategories);
    return rootCategories;
  }

  /**
   * Private validation methods
   */
  private validateCategoryData(data: CreateCategoryData): ServiceResult<boolean> {
    if (!data.slug || data.slug.trim() === '') {
      return { success: false, error: 'Slug is required' };
    }

    if (!data.i18n?.fr?.name || data.i18n.fr.name.trim() === '') {
      return { success: false, error: 'French name is required' };
    }

    if (!data.i18n?.en?.name || data.i18n.en.name.trim() === '') {
      return { success: false, error: 'English name is required' };
    }

    if (typeof data.sort_order !== 'number') {
      return { success: false, error: 'Sort order must be a number' };
    }

    return { success: true, data: true };
  }

  private async checkSlugUniqueness(slug: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .limit(1);

      if (error) {
        console.error('Error checking slug uniqueness:', error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Service error checking slug uniqueness:', error);
      return false;
    }
  }

  private async checkCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
    try {
      // Get all descendants of current category
      const descendants = await this.getAllDescendants(categoryId);
      
      // Check if newParentId is among descendants
      return !descendants.includes(newParentId);
    } catch (error) {
      console.error('Error checking circular reference:', error);
      return false;
    }
  }

  private async getAllDescendants(categoryId: string): Promise<string[]> {
    const descendants: string[] = [];
    const queue = [categoryId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      const { data: children } = await this.supabase
        .from('categories')
        .select('id')
        .eq('parent_id', currentId);

      if (children) {
        children.forEach(child => {
          descendants.push(child.id);
          queue.push(child.id);
        });
      }
    }

    return descendants;
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService();