"use client";

import { useEffect } from "react";

export default function ScrollUp() {
  useEffect(() => {
    // Protection hydratation - vérifier que window existe
    if (typeof window !== 'undefined') {
      window.document.scrollingElement?.scrollTo(0, 0);
    }
  }, []);

  return null;
}
