#!/bin/bash

# Article Cleanup Script
# This script cleans up article indexes after articles have been manually deleted

echo "🧹 Starting article indexes cleanup..."
echo ""

# Change to the repository root directory
cd "$(dirname "$0")/../.."

# Run the cleanup script
node .github/scripts/cleanup-indexes.js

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "What was cleaned up:"
echo "- Removed stale article references from main articles index"
echo "- Updated category article counts"
echo "- Fixed category pages to show correct articles"
echo "- Removed or updated empty category directories"
echo ""
echo "You can now commit these changes to fix the 404 issues."