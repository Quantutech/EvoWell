import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Critical Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    // Basic Auth Simulation (assuming mock auth for tests)
    await page.goto('/#/login');
    await page.fill('input[type="email"]', 'admin@evowell.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*admin/);
  });

  // Journey 1: Navigation & Dashboard Overview
  test('should navigate through dashboard sections and view real-time stats', async ({ page }) => {
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Providers')).toBeVisible();
    
    // Test Sidebar Scroll and Accordion
    await page.click('text=User Management'); // Toggle accordion
    await page.click('text=Practitioners');
    await expect(page.locator('text=Practitioner Directory')).toBeVisible();
  });

  // Journey 2: User Lifecycle Management
  test('should search, filter, and edit a practitioner', async ({ page }) => {
    await page.goto('/#/admin?tab=providers');
    
    // Search
    await page.fill('input[placeholder*="search"]', 'Jones');
    await expect(page.locator('text=Dr. Indiana Jones')).toBeVisible();
    
    // Inline Edit Role
    await page.click('text=Provider'); // Click the role cell
    await page.selectOption('select', 'ADMIN');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  // Journey 3: Content Workflow & Publishing
  test('should create a blog draft and move it through workflow', async ({ page }) => {
    await page.goto('/#/admin?tab=blogs');
    await page.click('text=Write Post');
    
    // Tiptap Editor Interaction
    await page.fill('[contenteditable="true"]', 'Experimental therapy for chronic anxiety.');
    
    // Check SEO Score
    await expect(page.locator('text=SEO Optimizer')).toBeVisible();
    await expect(page.locator('text=/100')).toBeVisible();
    
    // Workflow Transition
    await page.click('text=DRAFT'); // Open status selector
    await page.click('text=INTERNAL_REVIEW');
    await expect(page.locator('text=Internal Review')).toBeVisible();
  });

  // Journey 4: Bulk Operations
  test('should perform bulk status update and verify undo', async ({ page }) => {
    await page.goto('/#/admin?tab=users');
    
    // Select multiple rows
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();
    
    // Execute Bulk Action
    await page.selectOption('select:has-text("Bulk Actions")', 'status');
    // Note: prompt handling might be needed if using window.prompt
    
    await expect(page.locator('text=Processing Bulk Action')).toBeVisible();
    await expect(page.locator('text=Undo Last Action')).toBeVisible();
    
    // Test Undo
    await page.click('text=Undo Last Action');
    await expect(page.locator('text=reverted successfully')).toBeVisible();
  });

  // Journey 5: Global Search & Shortcuts
  test('should use global command palette for quick navigation', async ({ page }) => {
    // Open Command Palette
    await page.keyboard.press('Control+k');
    await expect(page.locator('placeholder*="Search commands"')).toBeFocused();
    
    // Fuzzy Search for Audit Logs
    await page.keyboard.type('audit');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*tab=audit/);
  });

});
