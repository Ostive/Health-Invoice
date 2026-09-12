import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Runs against the demo account created by `npm run db:seed` (see auth.setup.ts)
test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Définir E2E_EMAIL et E2E_PASSWORD');
test.describe.configure({ mode: 'serial' });

const INVOICE_URL = /\/dashboard\/factures\/[0-9a-f-]{36}$/;

/** Opens the first invoice of the sidebar list whose row contains `text` (each row links to the invoice's URL) */
async function openInvoice(page: Page, text: string) {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link').filter({ hasText: text }).first().click();
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

test('chaque facture a sa propre adresse : rechargeable, avec retour arrière', async ({ page }) => {
    await page.goto('/dashboard');
    await openInvoice(page, 'Brouillon');
    await expect(page).toHaveURL(INVOICE_URL);
    await expect(page.getByLabel('Nom complet')).toHaveValue('Jeanne Lefèvre');
    const invoiceUrl = page.url();

    // Opened straight from the URL, with the data read on the server
    await page.reload();
    await expect(page.getByLabel('Nom complet')).toHaveValue('Jeanne Lefèvre');

    await page.getByRole('button', { name: 'Fermer', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Aucune facture ouverte' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(invoiceUrl);
    await expect(page.getByLabel('Nom complet')).toHaveValue('Jeanne Lefèvre');

    await page.goto('/dashboard/factures/00000000-0000-4000-8000-000000000000');
    await expect(page.getByRole('heading', { name: 'Facture introuvable' })).toBeVisible();
});

test('nouvelle facture : enregistrée elle obtient son adresse, supprimée elle disparaît', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.getByRole('complementary');
    const patient = `Patient e2e ${Date.now()}`;

    await sidebar.getByRole('button', { name: 'Nouvelle facture' }).click();
    await page.getByLabel('Nom complet').fill(patient);
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText(/Facture sauvegardée : FAC-/)).toBeVisible();
    await expect(page).toHaveURL(INVOICE_URL);
    await expect(sidebar.getByRole('link').filter({ hasText: patient })).toBeVisible();

    await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer la facture' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(sidebar.getByText(patient)).toHaveCount(0);

    // Still gone after a reload: it was deleted on the server
    await page.reload();
    await expect(sidebar.getByText('Jeanne Lefèvre').first()).toBeVisible();
    await expect(sidebar.getByText(patient)).toHaveCount(0);
});

test('dossiers : créer, renommer puis supprimer', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.getByRole('complementary');
    const name = `Tournée e2e ${Date.now()}`;
    const renamed = `${name} (renommé)`;

    await sidebar.getByRole('button', { name: 'Créer un dossier' }).click();
    await page.getByLabel('Nom du dossier').fill(name);
    await page.getByRole('button', { name: 'Créer le dossier' }).click();
    await expect(sidebar.getByRole('button', { name, exact: true })).toBeVisible();

    await sidebar.getByRole('button', { name: `Renommer le dossier ${name}` }).click();
    await page.getByLabel('Nom du dossier').fill(renamed);
    await page.getByRole('dialog').getByRole('button', { name: 'Enregistrer' }).click();
    await expect(sidebar.getByRole('button', { name: renamed, exact: true })).toBeVisible();

    await page.reload();
    await expect(sidebar.getByRole('button', { name: renamed, exact: true })).toBeVisible();

    await sidebar.getByRole('button', { name: `Supprimer le dossier ${renamed}` }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer le dossier' }).click();
    await expect(sidebar.getByText(renamed)).toHaveCount(0);
});

test('patients : ajouter, modifier puis supprimer', async ({ page }) => {
    await page.goto('/dashboard/patients');
    const main = page.getByRole('main');
    const dialog = page.getByRole('dialog');
    const name = `Patient e2e ${Date.now()}`;

    await main.getByRole('button', { name: 'Nouveau patient' }).click();
    await dialog.getByLabel('Nom complet').fill(name);
    await dialog.getByLabel('N° de sécurité sociale').fill('185057512345678');
    await dialog.getByRole('button', { name: 'Ajouter le patient' }).click();
    await expect(main.getByText(name)).toBeVisible();

    await main.getByRole('button', { name: `Modifier ${name}` }).click();
    await dialog.getByLabel('Téléphone').fill('06 12 34 56 78');
    await dialog.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(main.getByText('06 12 34 56 78')).toBeVisible();

    // Read back from the server: the SSN is stored encrypted and comes back decrypted
    await page.reload();
    await expect(main.getByText('185057512345678')).toBeVisible();

    await main.getByRole('button', { name: `Supprimer ${name}` }).click();
    await dialog.getByRole('button', { name: 'Supprimer le patient' }).click();
    await expect(main.getByText(name)).toHaveCount(0);
});

test('une facture reste enregistrable après la suppression de son dossier', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.getByRole('complementary');
    const folder = `Dossier e2e ${Date.now()}`;
    const patient = `Patient e2e ${Date.now()}`;

    await sidebar.getByRole('button', { name: 'Créer un dossier' }).click();
    await page.getByLabel('Nom du dossier').fill(folder);
    await page.getByRole('button', { name: 'Créer le dossier' }).click();
    await expect(sidebar.getByRole('button', { name: folder, exact: true })).toBeVisible();

    await sidebar.getByRole('button', { name: 'Nouvelle facture' }).click();
    await page.getByLabel('Nom complet').fill(patient);
    await page.getByLabel('Dossier', { exact: true }).click();
    await page.getByRole('option', { name: folder }).click();
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText(/Facture sauvegardée/)).toBeVisible();
    await page.getByRole('button', { name: 'Fermer la notification' }).click();

    // The folder goes, the invoice stays: the database unlinks it, saving must still work
    await sidebar.getByRole('button', { name: `Supprimer le dossier ${folder}` }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer le dossier' }).click();
    await expect(sidebar.getByText(folder)).toHaveCount(0);

    await page.getByLabel('Notes').fill('Enregistré après suppression du dossier');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByText(/Facture sauvegardée/)).toBeVisible();
    await expect(page.getByText(/Erreur de sauvegarde/)).toHaveCount(0);

    await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Supprimer la facture' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
});

test('les erreurs de l’API sont compréhensibles', async ({ request }) => {
    const incomplete = await request.post('/api/invoices', { data: { invoice: { date: '2026-09-12', dueDate: '2026-10-12', client: { name: '' }, items: [] } } });
    expect(incomplete.status()).toBe(400);
    expect(await incomplete.json()).toMatchObject({ error: 'Le formulaire est incomplet', errors: expect.arrayContaining(['Le nom du client est requis']) });

    const badId = await request.delete('/api/invoices/pas-un-identifiant');
    expect(badId.status()).toBe(400);
    expect((await badId.json()).errors).toContain('Identifiant invalide');

    const unknownInvoice = await request.post('/api/generate-pdf', { data: { invoiceId: '00000000-0000-4000-8000-000000000000' } });
    expect(unknownInvoice.status()).toBe(404);
    expect((await unknownInvoice.json()).error).toBe('Facture introuvable.');
});
