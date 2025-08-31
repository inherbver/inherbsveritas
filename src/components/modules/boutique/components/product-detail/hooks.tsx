/**
 * Product Detail Hooks
 * 
 * Custom hooks for product detail functionality
 */

import * as React from "react"

// Hook pour auto-scroll des onglets avec Intersection Observer
export function useTabAutoScroll() {
  const [activeTab, setActiveTab] = React.useState('description')
  
  React.useEffect(() => {
    const sections = [
      { id: 'description', element: document.getElementById('description') },
      { id: 'properties', element: document.getElementById('properties') },
      { id: 'composition', element: document.getElementById('composition') },
      { id: 'usage', element: document.getElementById('usage') }
    ].filter(section => section.element)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = sections.find(s => s.element === entry.target)
            if (section) {
              setActiveTab(section.id)
            }
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    sections.forEach(section => {
      if (section.element) observer.observe(section.element)
    })

    return () => observer.disconnect()
  }, [])

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    // Scroll vers la section avec offset pour sticky nav
    const element = document.getElementById(tabId)
    if (element) {
      const offset = 100 // Hauteur de la navigation sticky
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  return { activeTab, setActiveTab, handleTabClick }
}