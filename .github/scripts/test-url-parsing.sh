#!/bin/bash

# Test script to verify the article edit functionality works correctly
# This tests the URL parsing fix for issue #63

echo "Testing article edit URL parsing..."

cd "$(dirname "$0")/../.."

# Test 1: Full URL parsing
echo "Test 1: Full URL parsing"
TEST_BODY='### Article URL

https://kevinsundstrom.com/articles/content-strategy/content-strategy-is-collaboration-not-control/

### New Article Title (Optional)

_No response_

### New Article Content (Optional)

Test content update

### New Author Name (Optional)

_No response_'

ISSUE_BODY="$TEST_BODY" ISSUE_TITLE='[Edit] Test Article' ISSUE_NUMBER='test' node .github/scripts/parse-edit-issue.js > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Full URL parsing works"
else
    echo "❌ Full URL parsing failed"
    exit 1
fi

# Test 2: Slug-only parsing
echo "Test 2: Slug-only parsing"
TEST_BODY2='### Article URL

content-strategy-is-collaboration-not-control

### New Article Title (Optional)

_No response_

### New Article Content (Optional)

Test content update

### New Author Name (Optional)

_No response_'

ISSUE_BODY="$TEST_BODY2" ISSUE_TITLE='[Edit] Test Article' ISSUE_NUMBER='test' node .github/scripts/parse-edit-issue.js > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Slug-only parsing works"
else
    echo "❌ Slug-only parsing failed"
    exit 1
fi

echo "🎉 All tests passed!"