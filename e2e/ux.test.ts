import { expect, test } from '@playwright/test';

test.describe('File Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('initial state is correct', async ({ page }) => {
    await expect(page).toHaveTitle('File Explorer Demo');

    await expect(page.locator('.file-explorer')).toBeVisible();
    await expect(page.locator('.tree-view')).toBeVisible();
    await expect(page.locator('.file-list')).toBeVisible();
    await expect(page.locator('.preview-panel')).toBeVisible();

    await expect(page.locator('button:has-text("Documents")').first()).toHaveClass(/bg-sidebar-accent/);

    const documentsFolderButton = page.locator('.tree-node', { hasText: 'Documents' }).first();
    await expect(documentsFolderButton.locator('svg.lucide-chevron-down')).toBeVisible();

    const fileListBody = page.locator('.file-list tbody');
    await expect(fileListBody.locator('tr')).toHaveCount(3);
    const rows = await fileListBody.locator('tr').all();
    expect(await rows[0].innerText()).toContain('Images');
    expect(await rows[1].innerText()).toContain('notes.txt');
    expect(await rows[2].innerText()).toContain('Projects');

    await expect(page.locator('.preview-panel', { hasText: 'No file selected' })).toBeVisible();
  });

  test('folder navigation via tree view works', async ({ page }) => {
    await page.locator('.tree-view button', { hasText: 'Projects' }).click();

    await expect(page.locator('.file-explorer-header .breadcrumb-item').last()).toHaveText('Projects');

    const fileListBody = page.locator('.file-list tbody');
    await expect(fileListBody.locator('tr')).toHaveCount(2);
    await expect(fileListBody.locator('tr', { hasText: 'surreal-rag' })).toBeVisible();
    await expect(fileListBody.locator('tr', { hasText: 'README.md' })).toBeVisible();
  });

  test('folder navigation via double-click works', async ({ page }) => {
    await page.locator('.file-list tbody tr', { hasText: 'Projects' }).dblclick();

    await expect(page.locator('.file-explorer-header .breadcrumb-item').last()).toHaveText('Projects');

    const fileListBody = page.locator('.file-list tbody');
    await expect(fileListBody.locator('tr')).toHaveCount(2);
    await expect(fileListBody.locator('tr', { hasText: 'surreal-rag' })).toBeVisible();
    await expect(fileListBody.locator('tr', { hasText: 'README.md' })).toBeVisible();
  });

  test('file selection and preview works', async ({ page }) => {
    const notesFileRow = page.locator('.file-list tbody tr', { hasText: 'notes.txt' });
    await notesFileRow.click();

    await expect(notesFileRow).toHaveClass(/bg-accent/);

    const previewPanel = page.locator('.preview-panel');
    await expect(previewPanel.locator('h3', { hasText: 'notes.txt' })).toBeVisible();
    await expect(previewPanel.locator('div:has(span:has-text("Type:"))').locator('[data-slot="badge"]')).toHaveText('txt');
    await expect(previewPanel.locator('div:has(span:has-text("Size:")) > span:nth-child(2)')).toHaveText('512 Bytes');
    await expect(previewPanel.locator('pre')).toContainText('This is a placeholder preview for text files.');
  });

  test('file list sorting works', async ({ page }) => {
    const nameHeader = page.locator('th button', { hasText: 'Name' });
    const sizeHeader = page.locator('th button', { hasText: 'Size' });
    const fileListRows = page.locator('.file-list tbody tr');

    let rows = await fileListRows.allTextContents();
    expect(rows[0]).toContain('Images');
    expect(rows[1]).toContain('notes.txt');
    expect(rows[2]).toContain('Projects');

    await nameHeader.click();
    await expect(nameHeader.locator('svg')).toHaveClass(/lucide-arrow-down/);

    await nameHeader.click();
    await expect(nameHeader.locator('svg')).toHaveClass(/lucide-arrow-up/);
    rows = await fileListRows.allTextContents();
    expect(rows[0]).toContain('Projects');
    expect(rows[1]).toContain('notes.txt');
    expect(rows[2]).toContain('Images');

    await sizeHeader.click();
    await expect(sizeHeader.locator('svg')).toHaveClass(/lucide-arrow-up/);
    rows = await fileListRows.allTextContents();
    expect(rows[2]).toContain('notes.txt');

    await sizeHeader.click();
    await expect(sizeHeader.locator('svg')).toHaveClass(/lucide-arrow-down/);
    rows = await fileListRows.allTextContents();
    expect(rows[0]).toContain('notes.txt');
  });

  test('breadcrumb navigation works', async ({ page }) => {
    await page.locator('.file-list tbody tr', { hasText: 'Projects' }).dblclick();
    await expect(page.locator('.file-explorer-header .breadcrumb-item').last()).toHaveText('Projects');

    await page.locator('.breadcrumb a', { hasText: 'Documents' }).click();

    await expect(page.locator('.file-explorer-header .breadcrumb-item').last()).toHaveText('Documents');
    const fileListBody = page.locator('.file-list tbody');
    await expect(fileListBody.locator('tr')).toHaveCount(3);
    await expect(fileListBody.locator('tr', { hasText: 'Projects' })).toBeVisible();
  });

  test('back and forward navigation works', async ({ page }) => {
    const backButton = page.locator('button[aria-label="Go back"]');
    const forwardButton = page.locator('button[aria-label="Go forward"]');

    await expect(backButton).toBeDisabled();
    await expect(forwardButton).toBeDisabled();

    await page.locator('.file-list tbody tr', { hasText: 'Projects' }).dblclick();
    await expect(page.locator('.file-list tbody tr', { hasText: 'surreal-rag' })).toBeVisible();
    await expect(backButton).toBeEnabled();
    await expect(forwardButton).toBeDisabled();

    await backButton.click();
    await expect(page.locator('.file-list tbody tr', { hasText: 'Projects' })).toBeVisible();
    await expect(backButton).toBeDisabled();
    await expect(forwardButton).toBeEnabled();

    await forwardButton.click();
    await expect(page.locator('.file-list tbody tr', { hasText: 'surreal-rag' })).toBeVisible();
    await expect(backButton).toBeEnabled();
    await expect(forwardButton).toBeDisabled();
  });

  test('accessibility attributes are present', async ({ page }) => {
    await expect(page.locator('button[aria-label="Go back"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Go forward"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Refresh"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Go to home"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Search"]')).toBeVisible();
    await expect(page.locator('button[aria-label="New folder"]')).toBeVisible();
    await expect(page.locator('button[aria-label="More options"]')).toBeVisible();

    const nameHeader = page.locator('th:has-text("Name")');
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    await page.locator('th button', { hasText: 'Size' }).click();
    await expect(page.locator('th:has-text("Size")')).toHaveAttribute('aria-sort', 'ascending');

    const firstRow = page.locator('.file-list tbody tr').first();
    await firstRow.hover();
    await expect(firstRow.locator('button[aria-label="Open row menu"]')).toBeVisible();
  });
});

test.describe('File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/file-upload');
  });

  test('initial state is correct', async ({ page }) => {
    await expect(page).toHaveTitle('File Upload Demo');
    await expect(page.locator('h1', { hasText: 'File Upload System' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Select Files' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Select Folder' })).toBeVisible();
  });

  test('file selection works', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][multiple]:not([webkitdirectory])');
    await fileInput.setInputFiles([
      { name: 'file1.txt', mimeType: 'text/plain', buffer: Buffer.from('hello world') },
      { name: 'file2.md', mimeType: 'text/markdown', buffer: Buffer.from('# markdown') },
    ]);

    await expect(page.locator('h4:has-text("Selected Files")')).toBeVisible();
    await expect(page.locator('p:has-text("file1.txt")')).toBeVisible();
    await expect(page.locator('p:has-text("file2.md")')).toBeVisible();

    await expect(page.locator('button', { hasText: 'Upload 2 Files' })).toBeVisible();
  });

  test('unsupported files are filtered', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][multiple]:not([webkitdirectory])');
    await fileInput.setInputFiles([
      { name: 'file1.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') },
      { name: 'image.png', mimeType: 'image/png', buffer: Buffer.from('fake-image') },
    ]);

    await expect(page.locator('p:has-text("file1.txt")')).toBeVisible();
    await expect(page.locator('p:has-text("image.png")')).not.toBeVisible();
  });

  test('drag and drop works', async ({ page }) => {
    const dropZone = page.locator('div[role="button"]');
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['hello world'], 'file1.txt', { type: 'text/plain' });
      dt.items.add(file);
      return dt;
    });

    await dropZone.dispatchEvent('dragenter', { dataTransfer });
    await dropZone.dispatchEvent('dragover', { dataTransfer });
    await expect(dropZone).toHaveClass(/border-primary/);

    await dropZone.dispatchEvent('drop', { dataTransfer });
    await expect(page.locator('p:has-text("file1.txt")')).toBeVisible();
  });

  test('successful upload shows progress and results', async ({ page }) => {
    await page.route('/api/files/upload', async (route) => {
      const response = {
        success: true,
        results: [
          { success: true, fileName: 'file1.txt', chunkCount: 2, processingTime: 50 },
          { success: true, fileName: 'file2.md', chunkCount: 1, processingTime: 25 },
        ],
        totalFiles: 2,
        successCount: 2,
        errorCount: 0,
      };
      await route.fulfill({ json: response });
    });

    const fileInput = page.locator('input[type="file"][multiple]:not([webkitdirectory])');
    await fileInput.setInputFiles([
      { name: 'file1.txt', mimeType: 'text/plain', buffer: Buffer.from('hello world') },
      { name: 'file2.md', mimeType: 'text/markdown', buffer: Buffer.from('# markdown') },
    ]);

    await page.locator('button', { hasText: 'Upload 2 Files' }).click();

    await expect(page.locator('p:has-text("Uploading Files...")')).toBeVisible();
    await expect(page.locator('progress')).toBeVisible();

    await expect(page.locator('h2:has-text("Upload Complete")')).toBeVisible();
    await expect(page.locator('p:has-text("Successful")').locator('..').locator('p').first()).toHaveText('2');
    await expect(page.locator('p:has-text("Failed")').locator('..').locator('p').first()).toHaveText('0');
    await expect(page.locator('span:has-text("file1.txt")').locator('..').locator('..')).toContainText('2 chunks');
    await expect(page.locator('span:has-text("file2.md")').locator('..').locator('..')).toContainText('1 chunk');
  });

  test('failed upload shows error message', async ({ page }) => {
    await page.route('/api/files/upload', async (route) => {
      const response = {
        success: true,
        results: [
          { success: false, fileName: 'big-file.txt', errorMessage: 'File size exceeds 10MB limit' },
        ],
        totalFiles: 1,
        successCount: 0,
        errorCount: 1,
      };
      await route.fulfill({ json: response });
    });

    const fileInput = page.locator('input[type="file"][multiple]:not([webkitdirectory])');
    await fileInput.setInputFiles([
      { name: 'big-file.txt', mimeType: 'text/plain', buffer: Buffer.from('a'.repeat(11 * 1024 * 1024)) },
    ]);

    await page.locator('button', { hasText: 'Upload 1 File' }).click();

    await expect(page.locator('h2:has-text("Upload Complete")')).toBeVisible();
    await expect(page.locator('p:has-text("Failed")').locator('..').locator('p').first()).toHaveText('1');
    await expect(page.locator('span:has-text("big-file.txt")').locator('..').locator('..')).toContainText('File size exceeds 10MB limit');
  });

  test('client-side validation shows inline error', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][multiple]:not([webkitdirectory])');
    await fileInput.setInputFiles([
      { name: 'big-file.txt', mimeType: 'text/plain', buffer: Buffer.from('a'.repeat(11 * 1024 * 1024)) },
    ]);

    await page.locator('button', { hasText: 'Upload 1 File' }).click();

    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText('File size exceeds 10MB limit');
  });

  test('file input has correct accept attribute', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][multiple]:not([webkitdirectory])');
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).not.toBeNull();
    expect(acceptAttr).toContain('.md');
    expect(acceptAttr).toContain('.txt');
    expect(acceptAttr).toContain('.html');
    expect(acceptAttr).toContain('.js');
    expect(acceptAttr).not.toContain('{');
  });
});
