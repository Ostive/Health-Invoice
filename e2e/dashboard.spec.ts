import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Runs against the demo account created by `npm run db:seed` (see auth.setup.ts)
test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Définir E2E_EMAIL et E2E_PASSWORD');
test.describe.configure({ mode: 'serial' });

/** Opens the first invoice of the sidebar list whose row contains `text` */
async function openInvoice(page: Page, text: string) {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('button').filter({ hasText: text }).first().click();
}

test('les factures du compte de démonstration sont listées', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/Factures/);

    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByText('Jeanne Lefèvre').first()).toBeVisible();
    await expect(sidebar.getByText('Brouillon').first()).toBeVisible();
    await expect(sidebar.getByText('En retard').first()).toBeVisible();
});

test('enregistrer un brouillon : les modifications sont bien en base', async ({ page }) => {
    await page.goto('/dashboard');
    await openInvoice(page, 'Brouillon');
    await expect(page.getByLabel('Nom complet')).toHaveValue('Jeanne Lefèvre');

    const note = `Vérifié par le test e2e — ${Date.now()}`;
    await page.getByLabel('Notes').fill(note);
    await page.getByRole('button', { name: 'Ajouter une ligne' }).first().click();
    await page.getByPlaceholder('Description du soin').last().fill('Ligne ajoutée par le test e2e');
    await page.getByPlaceholder('0,00').last().fill('4.5');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText(/Facture sauvegardée/)).toBeVisible();

    // After a reload, the editor shows what the database returns (notes and lines are stored encrypted)
    await page.reload();
    await openInvoice(page, 'Brouillon');
    await expect(page.getByLabel('Notes')).toHaveValue(note);
    await expect(page.getByPlaceholder('Description du soin').last()).toHaveValue('Ligne ajoutée par le test e2e');
    await expect(page.getByPlaceholder('0,00').last()).toHaveValue('4.5');

    // Put the demo invoice back as seeded
    await page.getByRole('button', { name: 'Supprimer la ligne Ligne ajoutée par le test e2e' }).click();
    await page.getByLabel('Notes').fill('');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText(/Facture sauvegardée/)).toBeVisible();
});

test('télécharger le PDF d’une facture payée : un vrai fichier PDF', async ({ page }) => {
    await page.goto('/dashboard');
    await openInvoice(page, 'Sophie Martin');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'PDF', exact: true }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Facture-FAC-\d{4}-\d+-Sophie_Martin\.pdf$/);
    const bytes = await readFile(await download.path());
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(2_000);
});

test('mode démo : « Nouvelle facture » ouvre une facture vierge, sans limite', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.getByRole('complementary');
    // The demo account already has 5 invoices: with the quota on, the upgrade dialog would open instead
    await expect(sidebar.getByText('Jeanne Lefèvre').first()).toBeVisible();
    await expect(sidebar.getByText(/factures gratuites/)).toBeHidden();

    await sidebar.getByRole('button', { name: 'Nouvelle facture' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText('Nouvelle', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Nom complet')).toHaveValue('');
});

test('chaque rubrique a sa propre URL', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('navigation', { name: 'Rubriques', exact: true }).getByRole('link', { name: 'Patients' }).click();
    await expect(page).toHaveURL(/\/dashboard\/patients$/);
    await expect(page).toHaveTitle(/Patients/);
    const main = page.getByRole('main');
    await expect(main.getByText('Ahmed Benali')).toBeVisible();
    // Social security numbers are stored encrypted: seeing it proves the decryption path works
    await expect(main.getByText('1 52 09 99 999 004 21')).toBeVisible();

    await page.goto('/dashboard/parametres');
    await expect(page.getByRole('heading', { level: 2, name: 'Profil et coordonnées' })).toBeVisible();
    await expect(page.getByLabel('Nom complet ou raison sociale')).toHaveValue('Claire Moreau');

    await page.getByRole('navigation', { name: 'Rubriques des paramètres' }).getByRole('link', { name: 'Abonnement' }).click();
    await expect(page).toHaveURL(/\/dashboard\/parametres\/abonnement$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Abonnement' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard\/parametres$/);
});
