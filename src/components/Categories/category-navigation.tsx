'use client'

/**
 * CategoryNavigation - Placeholder pour navigation categories
 * Migration depuis Categories/category-navigation.tsx
 */

import * as React from "react"

export interface CategoryNavigationProps {
  className?: string
}

export interface CategoryBreadcrumbProps {
  className?: string
}

export interface CategoryFilterProps {
  className?: string
}

export function CategoryNavigation({ className }: CategoryNavigationProps) {
  return (
    <nav className={className}>
      <p>Category Navigation - Coming Soon</p>
    </nav>
  )
}

export function CategoryBreadcrumb({ className }: CategoryBreadcrumbProps) {
  return (
    <nav className={className}>
      <p>Category Breadcrumb - Coming Soon</p>
    </nav>
  )
}

export function CategoryFilter({ className }: CategoryFilterProps) {
  return (
    <div className={className}>
      <p>Category Filter - Coming Soon</p>
    </div>
  )
}