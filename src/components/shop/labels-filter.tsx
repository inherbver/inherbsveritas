/**
 * @file Composant filtre par labels - Semaine 4 MVP
 * @description Filtre par labels HerbisVeritas avec cases à cocher
 */

'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HERBIS_VERITAS_LABELS } from '@/lib/filters/filter-types'
import type { LabelsFilterProps, ProductLabel } from '@/lib/filters/filter-types'

export function LabelsFilter({ 
  selectedLabels = [], 
  onLabelsChange,
  className 
}: LabelsFilterProps) {
  const t = useTranslations('shop.filters')

  const handleLabelToggle = (labelKey: ProductLabel) => {
    const newLabels = selectedLabels.includes(labelKey)
      ? selectedLabels.filter(l => l !== labelKey)
      : [...selectedLabels, labelKey]
    onLabelsChange?.(newLabels)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('labels.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {HERBIS_VERITAS_LABELS.map(({ key, label, description }) => (
            <label 
              key={key}
              className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLabels.includes(key)}
                onChange={() => handleLabelToggle(key)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </div>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}