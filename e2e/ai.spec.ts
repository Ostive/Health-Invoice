import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// Calls the real Gemini API through the app (text extraction + audio transcription)
test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Définir E2E_EMAIL et E2E_PASSWORD');
test.describe.configure({ mode: 'serial' });

// Chromium replays this French dictation (generated with the Windows fr-FR voice) as the microphone
const DICTATION = path.resolve('e2e/fixtures/dictee.wav');

test.use({
    permissions: ['microphone'],
    launchOptions: {
        args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            `--use-file-for-fake-audio-capture=${DICTATION}`,
        ],
    },
});

async function openDraft(page: Page) {
    await page.goto('/dashboard');
    await page.getByRole('complementary').getByRole('button').filter({ hasText: 'Brouillon' }).first().click();
    await expect(page.getByLabel('Nom complet')).toHaveValue('Jeanne Lefèvre');
}

test('l’assistant remplit les prestations à partir d’un texte', async ({ page }) => {
    await openDraft(page);
    const lines = page.getByPlaceholder('Description du soin');
    const before = await lines.count();

    await page.getByLabel('Description des soins').fill('Passage chez Mme Lefèvre ce matin, pansement complexe et déplacement.');
    await page.getByRole('button', { name: 'Remplir la facture' }).click();

    await expect(lines).not.toHaveCount(before, { timeout: 45_000 });
    const descriptions = await lines.evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value));
    expect(descriptions.join(' ')).toMatch(/pansement/i);
    // Nothing is saved: the demo invoice stays as seeded
});

test('la dictée au micro est transcrite dans le champ de l’assistant', async ({ page }) => {
    await openDraft(page);

    await page.getByRole('button', { name: 'Dicter au micro' }).click();
    const recording = page.getByRole('dialog', { name: 'Enregistrement en cours' });
    await expect(recording).toBeVisible();
    await page.waitForTimeout(8_500); // the fixture sentence lasts about 8 seconds
    await recording.getByRole('button', { name: 'Terminer' }).click();

    await expect(page.getByLabel('Description des soins')).toHaveValue(/pansement/i, { timeout: 45_000 });
});
