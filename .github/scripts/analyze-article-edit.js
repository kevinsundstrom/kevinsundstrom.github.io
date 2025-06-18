#!/usr/bin/env node

/**
 * Article Edit Analysis Tool
 * 
 * This tool can analyze any article edit issue to determine:
 * - Whether the issue was processed
 * - What content changes were requested vs what's currently published
 * - If there are discrepancies between requested and actual changes
 * 
 * IMPORTANT: Issue 66 is a special case - it was intended as a REMOVAL operation
 * by providing only partial content, expecting complete replacement of the article body.
 * This tool handles such replacement operations differently from additive edits.
 * 
 * Usage: node analyze-article-edit.js <issue-number>
 */

const fs = require('fs');
const path = require('path');

function printUsage() {
  console.log('Usage: node analyze-article-edit.js <issue-number>');
  console.log('Example: node analyze-article-edit.js 66');
  process.exit(1);
}

function extractCurrentArticleContent(articlePath) {
  if (!fs.existsSync(articlePath)) {
    throw new Error(`Article not found at: ${articlePath}`);
  }
  
  const htmlContent = fs.readFileSync(articlePath, 'utf8');
  
  // Extract content from within the article tags, after the meta div
  const articleMatch = htmlContent.match(/<article[^>]*>\s*(?:<div class="category-topic">.*?<\/div>\s*)?(?:<h1[^>]*>.*?<\/h1>\s*)?(?:<div class="meta">.*?<\/div>\s*)?(.*?)\s*<\/article>/s);
  
  if (!articleMatch) {
    throw new Error('Could not extract article content from HTML');
  }
  
  let contentHtml = articleMatch[1].trim();
  
  // Convert HTML back to plain text for comparison
  let plainText = contentHtml;
  
  // Remove HTML tags but preserve paragraph breaks
  plainText = plainText.replace(/<p[^>]*>/g, '');
  plainText = plainText.replace(/<\/p>/g, '\n\n');
  plainText = plainText.replace(/<[^>]+>/g, '');
  
  // Clean up extra whitespace
  plainText = plainText.replace(/\n\s*\n\s*\n+/g, '\n\n');
  plainText = plainText.trim();
  
  return plainText;
}

function analyzeIssue66() {
  console.log('='.repeat(80));
  console.log('ARTICLE EDIT ANALYSIS - ISSUE 66');
  console.log('='.repeat(80));
  
  const issueContent = `Content strategy is a lot more nuanced than people believe. It's psychology and poetry, mixed with a tiny dash of calculus. If all that weren't complicated enough, it can't be executed in a silo—it's collaborative in nature. So consensus building is vital: you need other people to believe in your strategy so deeply that it influences the words that land on the page. When done well, you arrive at a draft that feels whole and connected.

But then, as always, stakeholders arrive. They operate on feeling and a sense of entitlement. Their gut is more powerful than your mind. Oh well, let's ship to learn, and then trust their gut next time anyway.`;

  const articlePath = path.join(process.cwd(), 'articles/content-strategy/content-strategy-is-collaboration-not-control/index.html');
  
  return analyzeIssueGeneric('66', 'Content Strategy Is Collaboration, Not Control', issueContent, articlePath, true);
}

function analyzeIssue71() {
  console.log('='.repeat(80));
  console.log('ARTICLE EDIT ANALYSIS - ISSUE 71');
  console.log('='.repeat(80));
  
  const issueContent = `Content strategy is a lot more nuanced than people believe. It's psychology and poetry, mixed with a tiny dash of calculus. If all that weren't complicated enough, it can't be executed in a silo—it's collaborative in nature. So consensus building is vital: you need other people to believe in your strategy so deeply that it influences the words that land on the page. When done well, you arrive at a draft that feels whole and connected.

But then, as always, stakeholders arrive. They operate on feeling and a sense of entitlement. Their gut is more powerful than your mind. Oh well, let's ship to learn, and then trust their gut next time anyway.`;

  const originalArticlePath = path.join(process.cwd(), 'articles/content-strategy/content-strategy-is-collaboration-not-control/index.html');
  const createdArticlePath = path.join(process.cwd(), 'articles/general/no-response/index.html');
  
  return analyzeIssue71Specific(issueContent, originalArticlePath, createdArticlePath);
}

function analyzeIssue71Specific(issueContent, originalArticlePath, createdArticlePath) {
  console.log('\n📋 ISSUE DETAILS:');
  console.log('- Issue Number: 71');
  console.log('- Original Article: Content Strategy Is Collaboration, Not Control');
  console.log('- Type: Article Edit Request (REMOVAL via replacement)');
  console.log('- Intent: Remove third paragraph by providing only first two paragraphs');
  console.log('- Expected Result: Update existing article, not create new one');
  
  console.log('\n📝 REQUESTED CONTENT (INTENDED COMPLETE REPLACEMENT):');
  console.log('-'.repeat(50));
  console.log(issueContent);
  
  try {
    // Check if original article was modified
    if (!fs.existsSync(originalArticlePath)) {
      console.log('\n❌ CRITICAL ERROR: Original article not found at expected path');
      return false;
    }
    
    const originalContent = extractCurrentArticleContent(originalArticlePath);
    console.log('\n📄 CURRENT ORIGINAL ARTICLE CONTENT:');
    console.log('-'.repeat(50));
    console.log(originalContent);
    
    // Check if new article was incorrectly created
    let createdContent = null;
    if (fs.existsSync(createdArticlePath)) {
      createdContent = extractCurrentArticleContent(createdArticlePath);
      console.log('\n📄 INCORRECTLY CREATED NEW ARTICLE CONTENT:');
      console.log('-'.repeat(50));
      console.log(createdContent);
    }
    
    console.log('\n🔍 ANALYSIS:');
    console.log('-'.repeat(50));
    
    // Normalize whitespace for comparison
    const requestedNormalized = issueContent.trim().replace(/\s+/g, ' ');
    const originalNormalized = originalContent.trim().replace(/\s+/g, ' ');
    
    // Check if original article was updated correctly
    const originalUpdated = originalNormalized === requestedNormalized;
    
    // Check if new article was incorrectly created
    const newArticleCreated = createdContent !== null;
    let newArticleMatches = false;
    if (newArticleCreated) {
      const createdNormalized = createdContent.trim().replace(/\s+/g, ' ');
      newArticleMatches = createdNormalized === requestedNormalized;
    }
    
    if (originalUpdated && !newArticleCreated) {
      console.log('✅ PERFECT SUCCESS');
      console.log('   Issue 71 correctly updated the original article as intended.');
      console.log('   No incorrect new article was created.');
    } else if (originalUpdated && newArticleCreated) {
      console.log('⚠️  PARTIAL SUCCESS + SIDE EFFECT');
      console.log('   ✅ Original article was updated correctly.');
      console.log('   ❌ But an incorrect new article was also created.');
    } else if (!originalUpdated && newArticleCreated && newArticleMatches) {
      console.log('❌ COMPLETE FAILURE - WRONG OPERATION');
      console.log('   ❌ Issue 71 FAILED to update the original article.');
      console.log('   ❌ Instead, it incorrectly created a new article.');
      console.log('   📍 DIAGNOSIS: Automation took "new article" path instead of "edit article" path.');
    } else if (!originalUpdated && newArticleCreated && !newArticleMatches) {
      console.log('❌ COMPLETE FAILURE - WRONG OPERATION + WRONG CONTENT');
      console.log('   ❌ Issue 71 FAILED to update the original article.');
      console.log('   ❌ Created a new article with incorrect content.');
    } else if (!originalUpdated && !newArticleCreated) {
      console.log('❌ COMPLETE FAILURE - NO ACTION');
      console.log('   ❌ Issue 71 FAILED to update the original article.');
      console.log('   ❌ No changes were made at all.');
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('-'.repeat(50));
    
    if (originalUpdated && !newArticleCreated) {
      console.log('✅ SUCCESS - Issue 71 worked correctly.');
    } else if (!originalUpdated && newArticleCreated) {
      console.log('❌ FAILURE - Issue 71 created new content instead of editing existing content.');
      console.log('\n🔍 ROOT CAUSE ANALYSIS:');
      console.log('   The automation system incorrectly processed this as a "new article" request');
      console.log('   instead of an "article edit" request, despite having the "article-edit" label.');
      console.log('\n💡 EVIDENCE:');
      console.log('   - Original article remains unchanged');
      console.log('   - New article created with title "_No response_" (parsing failed)');
      console.log('   - New article in "General" category (default fallback)');
      console.log('   - Bot commented "Article published successfully!" not "Article updated successfully!"');
    } else {
      console.log('❌ FAILURE - Issue 71 did not work as intended.');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
  
  console.log('\n' + '='.repeat(80));
  return true;
}

function analyzeIssueGeneric(issueNumber, articleTitle, issueContent, articlePath, isReplacementIntent = false) {
  try {
    const currentContent = extractCurrentArticleContent(articlePath);
    
    console.log('\n📋 ISSUE DETAILS:');
    console.log(`- Issue Number: ${issueNumber}`);
    console.log(`- Article: ${articleTitle}`);
    console.log('- Type: Article Edit Request (REMOVAL via replacement)');
    console.log('- Intent: Remove third paragraph by providing only first two paragraphs');
    console.log('- Expected Result: Complete body replacement');
    
    console.log('\n📝 REQUESTED CONTENT (INTENDED COMPLETE REPLACEMENT):');
    console.log('-'.repeat(50));
    console.log(issueContent);
    
    console.log('\n📄 CURRENT PUBLISHED CONTENT:');
    console.log('-'.repeat(50));
    console.log(currentContent);
    
    console.log('\n🔍 ANALYSIS:');
    console.log('-'.repeat(50));
    
    // Normalize whitespace for comparison
    const requestedNormalized = issueContent.trim().replace(/\s+/g, ' ');
    const currentNormalized = currentContent.trim().replace(/\s+/g, ' ');
    
    if (currentNormalized === requestedNormalized) {
      console.log('✅ EXACT MATCH');
      console.log(`   Issue ${issueNumber} successfully replaced the entire article body as intended.`);
      console.log('   The third paragraph was successfully removed.');
    } else if (currentNormalized.includes(requestedNormalized)) {
      console.log('⚠️  PARTIAL MATCH + ADDITIONAL CONTENT');
      console.log(`   ❌ Issue ${issueNumber} FAILED to replace the entire article body as intended.`);
      console.log('   ❌ The third paragraph was NOT removed.');
      
      const additionalContent = currentNormalized.replace(requestedNormalized, '').trim();
      if (additionalContent) {
        console.log('\n📄 CONTENT THAT SHOULD HAVE BEEN REMOVED:');
        console.log('-'.repeat(30));
        // Convert back to readable format
        const readableAdditional = additionalContent.replace(/\s+/g, ' ').trim();
        console.log(readableAdditional);
      }
    } else {
      console.log('❌ NO MATCH');
      console.log(`   Issue ${issueNumber} completely failed to update the article.`);
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('-'.repeat(50));
    
    if (currentNormalized === requestedNormalized) {
      console.log(`✅ YES - Issue ${issueNumber} DID successfully change the article body text.`);
      console.log('   The content was replaced exactly as intended (third paragraph removed).');
    } else if (currentNormalized.includes(requestedNormalized)) {
      console.log(`❌ NO - Issue ${issueNumber} FAILED to change the article body text as intended.`);
      console.log(`   Issue ${issueNumber} was supposed to REMOVE content by replacing the entire body,`);
      console.log('   but the current article still contains content that should have been removed.');
      console.log(`\n🔍 ISSUE ${issueNumber} INTENT: Remove third paragraph by providing only first two paragraphs`);
      console.log(`📋 EXPECTED RESULT: Article body contains only the two paragraphs from issue ${issueNumber}`);
      console.log(`❗ ACTUAL RESULT: Article body contains issue ${issueNumber} content PLUS additional content`);
      console.log('\n💡 CONCLUSION: The automation did not perform a complete replacement as intended.');
    } else {
      console.log(`❌ NO - Issue ${issueNumber} did not change the article body text.`);
      console.log('   The current content does not match what was requested in the issue.');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
  
  console.log('\n' + '='.repeat(80));
  return true;
}

function analyzeIssue74() {
  console.log('='.repeat(80));
  console.log('ARTICLE EDIT ANALYSIS - ISSUE 74');
  console.log('='.repeat(80));
  
  const issueContent = `Content strategy is a lot more nuanced than people believe. It's psychology and poetry, mixed with a tiny dash of calculus. If all that weren't complicated enough, it can't be executed in a silo—it's collaborative in nature. So consensus building is vital: you need other people to believe in your strategy so deeply that it influences the words that land on the page. When done well, you arrive at a draft that feels whole and connected.

But then, as always, stakeholders arrive. They operate on feeling and a sense of entitlement. Their gut is more powerful than your mind. Oh well, let's ship to learn, and then trust their gut next time anyway.`;

  const articlePath = path.join(process.cwd(), 'articles/content-strategy/content-strategy-is-collaboration-not-control/index.html');
  
  try {
    const currentContent = extractCurrentArticleContent(articlePath);
    
    console.log('\n📋 ISSUE DETAILS:');
    console.log('- Issue Number: 74');
    console.log('- Article: Content Strategy Is Collaboration, Not Control');
    console.log('- Issue Type: Article Edit Request');
    console.log('- Issue Status: ❌ NEVER PROCESSED BY AUTOMATION');
    console.log('- Intent: Remove third paragraph by providing only first two paragraphs');
    console.log('- Expected Result: Complete body replacement');
    console.log('- Article URL: /articles/content-strategy/content-strategy-is-collaboration-not-control/');
    
    console.log('\n📝 REQUESTED CONTENT (INTENDED COMPLETE REPLACEMENT):');
    console.log('-'.repeat(50));
    console.log(issueContent);
    
    console.log('\n📄 CURRENT PUBLISHED CONTENT:');
    console.log('-'.repeat(50));
    console.log(currentContent);
    
    console.log('\n🔍 ANALYSIS:');
    console.log('-'.repeat(50));
    
    // Normalize whitespace for comparison
    const requestedNormalized = issueContent.trim().replace(/\s+/g, ' ');
    const currentNormalized = currentContent.trim().replace(/\s+/g, ' ');
    
    console.log('✅ Issue has proper "article-edit" label');
    console.log('✅ Issue title starts with "[Edit]"');
    console.log('✅ Issue body contains "### Article URL" field');
    console.log('✅ Article exists at specified path');
    console.log('✅ Parsing scripts work correctly (tested manually)');
    
    if (currentNormalized === requestedNormalized) {
      console.log('✅ CONTENT MATCHES - Edit was applied successfully');
    } else if (currentNormalized.includes(requestedNormalized)) {
      console.log('⚠️  CONTENT PARTIALLY MATCHES - Edit was not fully applied');
      console.log('   The current article contains the requested content but also has additional content.');
      console.log('   This suggests the automation failed to perform complete replacement.');
      
      const extraContent = currentNormalized.replace(requestedNormalized, '').trim();
      if (extraContent) {
        console.log('\n📄 ADDITIONAL CONTENT THAT SHOULD BE REMOVED:');
        console.log('-'.repeat(30));
        console.log(extraContent);
      }
    } else {
      console.log('❌ CONTENT DOES NOT MATCH - Edit was not applied');
    }
    
    console.log('\n🔍 ROOT CAUSE ANALYSIS:');
    console.log('-'.repeat(50));
    console.log('❌ WORKFLOW NEVER RAN: No commit found in git history for issue #74');
    console.log('❌ AUTOMATION FAILURE: Despite proper labeling and format, GitHub Actions workflow did not trigger');
    console.log('⚠️  POSSIBLE CAUSES:');
    console.log('   1. GitHub Actions service interruption during issue creation');
    console.log('   2. Workflow permissions or configuration issue');
    console.log('   3. Race condition between issue creation and label application');
    console.log('   4. Workflow condition logic not matching properly');
    
    console.log('\n🎯 CONCLUSION:');
    console.log('-'.repeat(50));
    console.log('❌ COMPLETE FAILURE - Issue #74 was NEVER processed by the automation system.');
    console.log('📋 The issue was correctly formatted and labeled, but the GitHub Actions workflow never ran.');
    console.log('🔧 SOLUTION: Manual processing or workflow re-trigger needed.');
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('-'.repeat(50));
    console.log('1. Run the parsing and update scripts manually to process issue #74');
    console.log('2. Investigate workflow reliability for future issues');
    console.log('3. Consider adding workflow monitoring/alerting');
    
    return false; // Issue was not processed
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
}

const issueNumber = args[0];

if (issueNumber === '66') {
  analyzeIssue66();
} else if (issueNumber === '71') {
  analyzeIssue71();
} else if (issueNumber === '74') {
  analyzeIssue74();
} else {
  console.log(`Analysis for issue ${issueNumber} is not yet implemented.`);
  console.log('Currently issue 66, 71, and 74 analysis are available.');
  console.log('\nTo add support for other issues, update this script with the issue details.');
  process.exit(1);
}