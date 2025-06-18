#!/usr/bin/env node

/**
 * Manual Processing Script for Issue #74
 * 
 * This script manually processes issue #74 that failed to trigger through 
 * the normal GitHub Actions workflow automation.
 * 
 * It will:
 * 1. Parse the issue content
 * 2. Update the article
 * 3. Update indexes
 * 4. Show what changes were made
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 MANUAL PROCESSING: Issue #74');
console.log('='.repeat(60));

// Set up environment variables to simulate GitHub Actions context
process.env.ISSUE_NUMBER = '74';
process.env.ISSUE_TITLE = '[Edit] Content Strategy Is Collaboration, Not Control';
process.env.ISSUE_BODY = `### Article URL

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

_No response_`;

async function runStep(stepName, scriptPath, passData = false) {
  console.log(`\n📋 STEP: ${stepName}`);
  console.log('-'.repeat(40));
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`, {
      cwd: process.cwd(),
      env: process.env
    });
    
    if (stdout) {
      console.log(stdout);
      
      // If this is the parsing step, capture the article data
      if (passData && stepName.includes('Parse')) {
        // Extract the JSON from the output - look for the "Updated article data:" line
        const lines = stdout.split('\n');
        const dataLineIndex = lines.findIndex(line => line.includes('Updated article data:'));
        if (dataLineIndex !== -1 && dataLineIndex + 1 < lines.length) {
          // The JSON should be on the next line
          let jsonStart = dataLineIndex + 1;
          let jsonStr = '';
          for (let i = jsonStart; i < lines.length; i++) {
            if (lines[i].trim().startsWith('{')) {
              // Start collecting JSON
              let braceCount = 0;
              for (let j = i; j < lines.length; j++) {
                const line = lines[j];
                jsonStr += line + '\n';
                
                // Count braces to know when JSON ends
                for (const char of line) {
                  if (char === '{') braceCount++;
                  if (char === '}') braceCount--;
                }
                
                if (braceCount === 0 && jsonStr.includes('}')) {
                  break;
                }
              }
              break;
            }
          }
          
          if (jsonStr.trim()) {
            try {
              const parsedData = JSON.parse(jsonStr.trim());
              process.env.ARTICLE_DATA = JSON.stringify(parsedData);
              console.log('✅ Article data captured for next step');
            } catch (e) {
              console.log('⚠️ Could not parse article data from output');
            }
          }
        }
      }
    }
    if (stderr) {
      console.error('⚠️ Warnings:', stderr);
    }
    
    console.log('✅ Step completed successfully');
    return true;
  } catch (error) {
    console.error(`❌ Step failed: ${error.message}`);
    return false;
  }
}

async function showBeforeAfter() {
  console.log('\n📊 BEFORE/AFTER COMPARISON');
  console.log('-'.repeat(40));
  
  const articlePath = path.join(process.cwd(), 'articles/content-strategy/content-strategy-is-collaboration-not-control/index.html');
  
  if (fs.existsSync(articlePath)) {
    const content = fs.readFileSync(articlePath, 'utf8');
    const articleMatch = content.match(/<article[^>]*>\s*(?:<div class="category-topic">.*?<\/div>\s*)?(?:<h1[^>]*>.*?<\/h1>\s*)?(?:<div class="meta">.*?<\/div>\s*)?(.*?)\s*<\/article>/s);
    
    if (articleMatch) {
      let contentHtml = articleMatch[1].trim();
      let plainText = contentHtml.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '\n\n').replace(/<[^>]+>/g, '');
      plainText = plainText.replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
      
      console.log('📄 UPDATED ARTICLE CONTENT:');
      console.log(plainText);
      
      // Check if it matches expected content
      const expectedContent = `Content strategy is a lot more nuanced than people believe. It's psychology and poetry, mixed with a tiny dash of calculus. If all that weren't complicated enough, it can't be executed in a silo—it's collaborative in nature. So consensus building is vital: you need other people to believe in your strategy so deeply that it influences the words that land on the page. When done well, you arrive at a draft that feels whole and connected.

But then, as always, stakeholders arrive. They operate on feeling and a sense of entitlement. Their gut is more powerful than your mind. Oh well, let's ship to learn, and then trust their gut next time anyway.`;

      const contentNormalized = plainText.trim().replace(/\s+/g, ' ');
      const expectedNormalized = expectedContent.trim().replace(/\s+/g, ' ');
      
      if (contentNormalized === expectedNormalized) {
        console.log('\n✅ SUCCESS: Article content matches issue #74 request exactly!');
        console.log('   The third paragraph has been successfully removed.');
      } else if (contentNormalized.includes(expectedNormalized)) {
        console.log('\n⚠️ PARTIAL: Article contains requested content but has additional content.');
      } else {
        console.log('\n❌ MISMATCH: Article content does not match the request.');
      }
    }
  }
}

async function main() {
  console.log('Starting manual processing of issue #74...\n');
  
  let success = true;
  
  // Step 1: Parse the edit issue
  success = await runStep('Parse Edit Issue', '.github/scripts/parse-edit-issue.js', true) && success;
  
  // Step 2: Update the article
  if (success) {
    success = await runStep('Update Article', '.github/scripts/update-article.js') && success;
  }
  
  // Step 3: Update indexes
  if (success) {
    success = await runStep('Update Indexes', '.github/scripts/update-indexes.js') && success;
  }
  
  // Step 4: Show results
  await showBeforeAfter();
  
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 MANUAL PROCESSING COMPLETED SUCCESSFULLY!');
    console.log('\n📋 SUMMARY:');
    console.log('- Issue #74 has been processed manually');
    console.log('- Article content updated to remove third paragraph');
    console.log('- Article indexes updated');
    console.log('- Changes ready for commit');
    console.log('\n💡 NEXT STEPS:');
    console.log('- Review the changes with `git diff`');
    console.log('- Commit the changes if satisfied');
    console.log('- Investigate workflow reliability for future issues');
  } else {
    console.log('❌ MANUAL PROCESSING FAILED');
    console.log('Please check the errors above and try individual steps manually.');
  }
}

// Run the script
main().catch(error => {
  console.error('💥 FATAL ERROR:', error.message);
  process.exit(1);
});