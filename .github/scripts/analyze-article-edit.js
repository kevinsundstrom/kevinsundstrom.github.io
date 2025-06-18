#!/usr/bin/env node

/**
 * Article Edit Analysis Tool
 * 
 * This tool can analyze any article edit issue to determine:
 * - Whether the issue was processed
 * - What content changes were requested vs what's currently published
 * - If there are discrepancies between requested and actual changes
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
  
  try {
    const currentContent = extractCurrentArticleContent(articlePath);
    
    console.log('\n📋 ISSUE DETAILS:');
    console.log('- Issue Number: 66');
    console.log('- Article: Content Strategy Is Collaboration, Not Control');
    console.log('- Type: Article Edit Request');
    console.log('- Field Changed: Article Content');
    
    console.log('\n📝 REQUESTED CONTENT:');
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
      console.log('   The current content exactly matches what was requested in issue 66.');
    } else if (currentNormalized.includes(requestedNormalized)) {
      console.log('⚠️  PARTIAL MATCH + ADDITIONAL CONTENT');
      console.log('   The requested content is present, but there is additional content.');
      
      const additionalContent = currentNormalized.replace(requestedNormalized, '').trim();
      if (additionalContent) {
        console.log('\n📄 ADDITIONAL CONTENT FOUND:');
        console.log('-'.repeat(30));
        // Convert back to readable format
        const readableAdditional = additionalContent.replace(/\s+/g, ' ').trim();
        console.log(readableAdditional);
      }
    } else {
      console.log('❌ NO MATCH');
      console.log('   The current content does not contain the requested content.');
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('-'.repeat(50));
    
    if (currentNormalized.includes(requestedNormalized)) {
      console.log('✅ YES - Issue 66 DID change the article body text.');
      console.log('   The content specified in issue 66 is present in the current article.');
      
      if (currentNormalized !== requestedNormalized) {
        console.log('\n⚠️  ADDITIONAL FINDINGS:');
        console.log('   • There is extra content beyond what was requested in issue 66');
        console.log('   • This could indicate:');
        console.log('     - Manual editing after automated processing');
        console.log('     - Multiple edit requests processed');
        console.log('     - Automation preserving existing content');
      }
    } else {
      console.log('❌ INCONCLUSIVE - The current content does not match the issue 66 request.');
      console.log('   This could indicate the issue was not processed or there were errors.');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
  
  console.log('\n' + '='.repeat(80));
  return true;
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
}

const issueNumber = args[0];

if (issueNumber === '66') {
  analyzeIssue66();
} else {
  console.log(`Analysis for issue ${issueNumber} is not yet implemented.`);
  console.log('Currently only issue 66 analysis is available.');
  console.log('\nTo add support for other issues, update this script with the issue details.');
  process.exit(1);
}