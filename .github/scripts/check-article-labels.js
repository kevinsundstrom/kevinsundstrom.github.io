#!/usr/bin/env node

/**
 * Manual script to check for article issues that are missing required labels
 * This script can be run to debug why specific issues (like #66) didn't get auto-labeled
 */

// Mock data for issue #66 to test detection
const issue66 = {
  number: 66,
  title: "[Edit] Content Strategy Is Collaboration, Not Control",
  body: `### Article URL

/articles/content-strategy/content-strategy-is-collaboration-not-control/

### New Article Title (Optional)

_No response_

### New Article Content (Optional)

Content strategy is a lot more nuanced than people believe. It's psychology and poetry, mixed with a tiny dash of calculus. If all that weren't complicated enough, it can't be executed in a silo—it's collaborative in nature. So consensus building is vital: you need other people to believe in your strategy so deeply that it influences the words that land on the page. When done well, you arrive at a draft that feels whole and connected.

But then, as always, stakeholders arrive. They operate on feeling and a sense of entitlement. Their gut is more powerful than your mind. Oh well, let's ship to learn, and then trust their gut next time anyway.

### New Author Name (Optional)

_No response_

### New SEO Title (Optional)

_No response_

### New SEO Description (Optional)

_No response_

### New SEO Keywords (Optional)

_No response_

### New Category/Topic (Optional)

_No response_

### Edit Notes (Optional)

_No response_`,
  labels: [] // Assume no labels for testing
};

function checkArticleLabels(issue) {
  const title = issue.title.toLowerCase();
  const body = issue.body || '';
  
  console.log(`\n🔍 Checking Issue #${issue.number}: ${issue.title}`);
  console.log(`Title (lowercase): ${title}`);
  console.log(`Body length: ${body.length} characters`);
  
  // Check current labels
  const hasArticleLabel = issue.labels.some(label => 
    label.name === 'article' || label.name === 'article-edit'
  );
  
  console.log(`Current labels: ${issue.labels.map(l => l.name).join(', ') || 'none'}`);
  console.log(`Has article label: ${hasArticleLabel}`);
  
  // Detection logic from auto-label-issues.yml
  const isArticleIssue = title.includes('[article]') || body.includes('### Article Title');
  const isEditIssue = title.includes('[edit]') || body.includes('### Article URL');
  
  console.log(`\n🔍 Detection Tests:`);
  console.log(`  Title includes '[article]': ${title.includes('[article]')}`);
  console.log(`  Body includes '### Article Title': ${body.includes('### Article Title')}`);
  console.log(`  → isArticleIssue: ${isArticleIssue}`);
  console.log(`  Title includes '[edit]': ${title.includes('[edit]')}`);
  console.log(`  Body includes '### Article URL': ${body.includes('### Article URL')}`);
  console.log(`  → isEditIssue: ${isEditIssue}`);
  
  const shouldBeLabeled = !hasArticleLabel && (isArticleIssue || isEditIssue);
  
  console.log(`\n📋 Results:`);
  console.log(`  Should be auto-labeled: ${shouldBeLabeled}`);
  
  if (shouldBeLabeled) {
    const labelToAdd = isEditIssue ? 'article-edit' : 'article';
    const additionalLabel = isEditIssue ? 'content-update' : 'content-submission';
    
    console.log(`  ✅ SHOULD GET LABELS: "${labelToAdd}", "${additionalLabel}"`);
    console.log(`  📝 Issue type: ${isEditIssue ? 'Article Edit' : 'New Article'}`);
    
    return {
      needsLabels: true,
      labels: [labelToAdd, additionalLabel],
      type: isEditIssue ? 'edit' : 'new'
    };
  } else if (hasArticleLabel) {
    console.log(`  ✅ Already has correct labels`);
    return { needsLabels: false, reason: 'already-labeled' };
  } else {
    console.log(`  ❌ Not detected as article issue`);
    return { needsLabels: false, reason: 'not-detected' };
  }
}

function generateSolutionSteps(result, issueNumber) {
  console.log(`\n🛠️  Solution for Issue #${issueNumber}:`);
  
  if (result.needsLabels) {
    console.log(`1. Add the following labels to issue #${issueNumber}:`);
    result.labels.forEach(label => {
      console.log(`   - "${label}"`);
    });
    console.log(`2. The auto-labeling workflow should have detected this.`);
    console.log(`3. Once labeled, the publish-article.yml workflow will process the ${result.type} request.`);
    
    console.log(`\n📝 Manual steps to fix:`);
    console.log(`1. Go to: https://github.com/kevinsundstrom/kevinsundstrom.github.io/issues/${issueNumber}`);
    console.log(`2. Click on the gear icon next to "Labels" on the right side`);
    console.log(`3. Select the "${result.labels[0]}" label`);
    console.log(`4. The workflow should automatically run and process the article`);
  } else if (result.reason === 'already-labeled') {
    console.log(`Issue already has correct labels. Check GitHub Actions for workflow runs.`);
  } else {
    console.log(`Issue was not detected as an article issue. Review the content format.`);
  }
}

// Test with issue #66 data
console.log('='.repeat(60));
console.log('🐛 Debugging Article Labeling for Issue #66');
console.log('='.repeat(60));

const result = checkArticleLabels(issue66);
generateSolutionSteps(result, 66);

console.log('\n' + '='.repeat(60));
console.log('📋 Summary');
console.log('='.repeat(60));
console.log('Issue #66 should be detected by auto-labeling but may have been missed.');
console.log('The detection logic is working correctly in this test.');
console.log('The issue likely needs manual labeling to trigger the workflow.');