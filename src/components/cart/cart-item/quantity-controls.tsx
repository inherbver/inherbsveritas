/**
 * QuantityControls - Contrôles quantité réutilisables
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'
import { type QuantityControlsProps } from './types'

export function QuantityControls({ 
  quantity, 
  onUpdateQuantity, 
  isUpdating = false,
  maxQuantity = 99,
  minQuantity = 1
}: QuantityControlsProps) {
  const [localQuantity, setLocalQuantity] = React.useState(quantity.toString())

  // Sync local quantity avec props
  React.useEffect(() => {
    setLocalQuantity(quantity.toString())
  }, [quantity])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= minQuantity && newQuantity <= maxQuantity) {
      onUpdateQuantity(newQuantity)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuantity(value)
  }

  const handleInputBlur = () => {
    const numericValue = parseInt(localQuantity, 10)
    if (!isNaN(numericValue)) {
      handleQuantityChange(Math.max(minQuantity, Math.min(maxQuantity, numericValue)))
    } else {
      setLocalQuantity(quantity.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
  }

  const canDecrease = quantity > minQuantity
  const canIncrease = quantity < maxQuantity

  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuantityChange(quantity - 1)}
        disabled={!canDecrease || isUpdating}
        className="h-8 w-8 p-0 hover:bg-background"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        type="text"
        value={localQuantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={isUpdating}
        className="w-12 h-8 text-center border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-offset-0"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuantityChange(quantity + 1)}
        disabled={!canIncrease || isUpdating}
        className="h-8 w-8 p-0 hover:bg-background"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}