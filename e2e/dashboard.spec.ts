import { test, expect } from '@playwright/test';

// Runs against the demo account created by `npm run db:seed` (see auth.setup.ts)
test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Définir E2E_EMAIL et E2E_PASSWORD');
test.describe.configure({ mode: 'serial' });

test('les factures du compte de démonstration sont listées', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/Factures/);

    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByText('Jeanne Lefèvre').first()).toBeVisible();
    await expect(sidebar.getByText('Brouillon').first()).toBeVisible();
    await expect(sidebar.getByText('En retard').first()).toBeVisible();
});

test('ouvrir un brouillon, le modifier et l’enregistrer', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('complementary').getByRole('button').filter({ hasText: 'Brouillon' }).first().click();

    await expect(page.getByLabel('Nom complet')).toHaveValue('Jeanne Lefèvre');
    await page.getByLabel('Notes').fill(`Vérifié par le test e2e du ${new Date().toLocaleDateString('fr-FR')}`);
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();

    await expect(page.getByText(/Facture sauvegardée/)).toBeVisible();
});

test('télécharger le PDF d’une facture payée', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('complementary').getByRole('button').filter({ hasText: 'Sophie Martin' }).first().click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'PDF', exact: true }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Facture-FAC-\d{4}-\d+-Sophie_Martin\.pdf$/);
});

test('la limite de l’offre gratuite propose de passer Pro', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.getByRole('complementary');
    // The quota is computed from the invoice list: wait until it is loaded
    await expect(sidebar.getByText('Jeanne Lefèvre').first()).toBeVisible();
    await sidebar.getByRole('button', { name: 'Nouvelle facture' }).click();
    await expect(page.getByRole('dialog')).toContainText('factures gratuites sont utilisées');
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
