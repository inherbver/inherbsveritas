/**
 * API Routes Categories - CRUD Admin MVP Semaine 3
 * TDD Implementation with Zod validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categoriesService } from '@/lib/categories/categories-service'
import { z } from 'zod'

// Validation schemas
const CreateCategorySchema = z.object({
  slug: z.string().min(1).max(100),
  parent_id: z.string().uuid().nullable().optional(),
  i18n: z.object({
    fr: z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(500).optional()
    }),
    en: z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(500).optional()
    })
  }),
  image_url: z.string().url().optional(),
  sort_order: z.number().int().min(0),
  is_active: z.boolean().optional()
})

const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: z.string().uuid()
})

/**
 * GET /api/categories - Liste categories actives avec hiérarchie
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const parentId = searchParams.get('parentId')
    const buildTree = searchParams.get('tree') === 'true'

    let result

    if (parentId !== null) {
      // Get categories by parent
      result = await categoriesService.getCategoriesByParent(parentId)
    } else {
      // Get all categories
      result = await categoriesService.getCategories(includeInactive)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    let categories = result.data!

    // Build tree structure if requested
    if (buildTree && categories.length > 0) {
      const tree = categoriesService.buildCategoryTree(categories)
      return NextResponse.json(tree)
    }

    return NextResponse.json(categories)

  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories - Créer nouvelle catégorie (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Admin role check (simplified for MVP)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'dev'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = CreateCategorySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      )
    }

    // Create category
    const result = await categoriesService.createCategory(validation.data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })

  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}