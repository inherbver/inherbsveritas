#!/bin/bash

# Solutions Cache Jest (basées sur documentation officielle)

echo "🧹 Clearing Jest Cache..."

# Option 1: Clear cache et exit
jest --clearCache

echo "✅ Jest cache cleared"

# Option 2: Alternative - run sans cache (pour debug)
echo "🧪 Alternative: Run tests without cache:"
echo "npm run test:integration -- --no-cache --testPathPattern='orders-workflow'"