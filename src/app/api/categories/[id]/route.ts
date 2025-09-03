/**
 * API Routes Categories [id] - CRUD Admin MVP
 * Individual category operations with admin auth
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categoriesService } from '@/lib/categories/categories-service'
import { z } from 'zod'

const UpdateCategorySchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  i18n: z.object({
    fr: z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().max(500).optional()
    }).optional(),
    en: z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().max(500).optional()
    }).optional()
  }).optional(),
  image_url: z.string().url().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional()
})

/**
 * Helper function for admin auth check
 */
async function checkAdminAuth() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'dev'].includes(profile.role)) {
    return { authorized: false, error: 'Forbidden - Admin access required', status: 403 }
  }

  return { authorized: true, user, profile }
}

/**
 * GET /api/categories/[id] - Get single category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate UUID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(category)

  } catch (error) {
    console.error('Category GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/categories/[id] - Update category (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const authResult = await checkAdminAuth()
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = params

    // Validate UUID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = UpdateCategorySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      )
    }

    // Update category
    const result = await categoriesService.updateCategory({
      ...validation.data,
      id
    })

    if (!result.success) {
      if (result.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)

  } catch (error) {
    console.error('Category PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories/[id] - Soft delete category (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const authResult = await checkAdminAuth()
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = params

    // Validate UUID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      )
    }

    // Delete category (soft delete)
    const result = await categoriesService.deleteCategory(id)

    if (!result.success) {
      if (result.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      if (result.error?.includes('children')) {
        return NextResponse.json(
          { error: 'Cannot delete category with active children' },
          { status: 409 }
        )
      }
      if (result.error?.includes('products')) {
        return NextResponse.json(
          { error: 'Cannot delete category with active products' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Category DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}