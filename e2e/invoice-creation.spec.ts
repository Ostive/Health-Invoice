import { test, expect } from '@playwright/test';

// Credentials come from the environment — never hardcode a real account in the repo.
// `npm run db:seed` creates a demo account and prints its credentials.
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe('Invoice Creation', () => {
    test.skip(!email || !password, 'Définir E2E_EMAIL et E2E_PASSWORD pour lancer ce test');

    test('should allow a user to create a new invoice', async ({ page }) => {
        await page.goto('/connexion');

        await page.getByLabel('Email professionnel').fill(email!);
        await page.getByLabel('Mot de passe', { exact: true }).fill(password!);
        await page.getByRole('button', { name: 'Se connecter' }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
        await expect(page).toHaveTitle(/Facturier/);

        const clientName = page.getByLabel('Nom complet');
        if (!(await clientName.isVisible())) {
            await page.getByRole('button', { name: 'Nouvelle facture' }).first().click();
        }
        await expect(clientName).toBeVisible();

        await clientName.fill('Jean Test');
        await page.locator('textarea#client-address').fill('1 Rue du Test');

        await page.getByRole('button', { name: 'Ajouter une ligne' }).first().click();
        await page.getByPlaceholder('Description du soin').last().fill('Consultation Test');
        await page.getByPlaceholder('0,00').last().fill('50');
        await expect(page.getByPlaceholder('0,00').last()).toHaveValue('50');

        await page.getByRole('button', { name: 'Enregistrer' }).first().click();
    });
});
