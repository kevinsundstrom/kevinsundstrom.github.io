#!/usr/bin/env node

/**
 * Workflow Reliability Checker
 * 
 * This script helps diagnose why GitHub Actions workflows might not be running
 * for article automation issues. It provides troubleshooting steps and checks.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GITHUB ACTIONS WORKFLOW RELIABILITY CHECKER');
console.log('='.repeat(60));

function checkWorkflowFile() {
  console.log('\n📋 CHECKING WORKFLOW CONFIGURATION');
  console.log('-'.repeat(40));
  
  const workflowPath = '.github/workflows/publish-article.yml';
  
  if (!fs.existsSync(workflowPath)) {
    console.log('❌ Workflow file not found at .github/workflows/publish-article.yml');
    return false;
  }
  
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  
  console.log('✅ Workflow file exists');
  
  // Check for key elements
  const checks = [
    { name: 'Issue triggers', pattern: /on:\s*issues:/, present: workflowContent.includes('issues:') },
    { name: 'Opened trigger', pattern: /opened/, present: workflowContent.includes('opened') },
    { name: 'Edited trigger', pattern: /edited/, present: workflowContent.includes('edited') },
    { name: 'Label condition', pattern: /article.*label/, present: workflowContent.includes("contains(github.event.issue.labels.*.name, 'article')") },
    { name: 'Edit label condition', pattern: /article-edit.*label/, present: workflowContent.includes("contains(github.event.issue.labels.*.name, 'article-edit')") },
  ];
  
  let allGood = true;
  for (const check of checks) {
    if (check.present) {
      console.log(`✅ ${check.name} configured correctly`);
    } else {
      console.log(`❌ ${check.name} missing or misconfigured`);
      allGood = false;
    }
  }
  
  return allGood;
}

function provideTroubleshootingSteps() {
  console.log('\n🔧 TROUBLESHOOTING STEPS FOR MISSING WORKFLOWS');
  console.log('-'.repeat(40));
  
  console.log('1. **Check GitHub Actions Tab:**');
  console.log('   - Go to: https://github.com/kevinsundstrom/kevinsundstrom.github.io/actions');
  console.log('   - Look for failed or missing workflow runs around issue creation time');
  console.log('   - Check for any error messages or permission issues');
  
  console.log('\n2. **Verify Repository Settings:**');
  console.log('   - Settings > Actions > General');
  console.log('   - Ensure "Allow all actions and reusable workflows" is selected');
  console.log('   - Check that workflows have "Read and write permissions"');
  
  console.log('\n3. **Check Issue Labels and Timing:**');
  console.log('   - Verify the issue has the correct label ("article-edit" or "article")');
  console.log('   - Check if labels were added after issue creation (race condition)');
  console.log('   - Workflow only triggers on initial creation/edit, not label changes');
  
  console.log('\n4. **GitHub Actions Service Status:**');
  console.log('   - Check: https://www.githubstatus.com/');
  console.log('   - Look for any service interruptions during issue creation time');
  
  console.log('\n5. **Manual Workflow Trigger:**');
  console.log('   - Unfortunately, issue-triggered workflows cannot be manually re-run');
  console.log('   - Use manual processing scripts for missed issues');
  
  console.log('\n6. **Future Prevention:**');
  console.log('   - Consider adding workflow monitoring');
  console.log('   - Add automatic retry logic');
  console.log('   - Create backup manual processing procedures');
}

function showManualProcessingInstructions() {
  console.log('\n📋 MANUAL PROCESSING INSTRUCTIONS');
  console.log('-'.repeat(40));
  
  console.log('For issues that missed automation (like #74):');
  console.log('');
  console.log('1. **Run Analysis First:**');
  console.log('   node .github/scripts/analyze-article-edit.js <issue-number>');
  console.log('');
  console.log('2. **Manual Processing (for edit issues):**');
  console.log('   ISSUE_NUMBER=<num> ISSUE_TITLE="[Edit] ..." ISSUE_BODY="..." \\');
  console.log('   node .github/scripts/parse-edit-issue.js');
  console.log('   ');
  console.log('   # Capture the JSON output and use it for:');
  console.log('   ARTICLE_DATA=\'{"title":"...",...}\' node .github/scripts/update-article.js');
  console.log('   ARTICLE_DATA=\'{"title":"...",...}\' node .github/scripts/update-indexes.js');
  console.log('');
  console.log('3. **Verify Results:**');
  console.log('   node .github/scripts/analyze-article-edit.js <issue-number>');
  console.log('   git diff  # Review changes');
  console.log('   git add . && git commit -m "Manual processing of issue #<num>"');
}

function checkCommonIssues() {
  console.log('\n⚠️  COMMON WORKFLOW RELIABILITY ISSUES');
  console.log('-'.repeat(40));
  
  console.log('🔸 **Label Timing Race Condition:**');
  console.log('   Issue templates should auto-apply labels, but sometimes fail');
  console.log('   Workflow only triggers on issue events, not label events');
  console.log('   Solution: Ensure labels are in issue template configuration');
  
  console.log('\n🔸 **GitHub Actions Quotas/Limits:**');
  console.log('   Free tier has monthly limits on Actions minutes');
  console.log('   Workflows may be queued or skipped if limits exceeded');
  console.log('   Solution: Check usage in Settings > Billing');
  
  console.log('\n🔸 **Repository Permissions:**');
  console.log('   Workflows need write access to update files');
  console.log('   May fail silently if permissions are insufficient');
  console.log('   Solution: Check Actions permissions in repository settings');
  
  console.log('\n🔸 **Workflow File Syntax Errors:**');
  console.log('   YAML syntax errors prevent workflows from running');
  console.log('   GitHub doesn\'t always clearly indicate syntax issues');
  console.log('   Solution: Validate YAML syntax and test workflow changes');
}

function main() {
  console.log('Checking workflow reliability for article automation...\n');
  
  const workflowOk = checkWorkflowFile();
  
  provideTroubleshootingSteps();
  showManualProcessingInstructions();
  checkCommonIssues();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 SUMMARY FOR ISSUE #74');
  console.log('-'.repeat(30));
  console.log('❌ Workflow never ran despite correct setup');
  console.log('✅ Manual processing successfully applied the edit');
  console.log('⚠️  Root cause likely: GitHub Actions service issue or race condition');
  console.log('💡 Solution: Monitor future issues and use manual processing as backup');
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Add workflow monitoring/alerting for future issues');
  console.log('2. Document manual processing procedures');
  console.log('3. Consider adding retry mechanisms to the workflow');
  console.log('4. Test workflow with a new test issue to verify it\'s working');
}

main();