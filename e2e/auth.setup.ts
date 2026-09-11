import { test as setup, expect } from '@playwright/test';

// Credentials come from the environment — `npm run db:seed` creates the demo account
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

setup('connexion du compte de démonstration', async ({ page }) => {
    setup.skip(!email || !password, 'Définir E2E_EMAIL et E2E_PASSWORD pour tester le tableau de bord');

    await page.goto('/connexion');
    await page.getByLabel('Email professionnel').fill(email!);
    await page.getByLabel('Mot de passe', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForURL('**/dashboard', { timeout: 30_000 });
    await expect(page).toHaveTitle(/Factures/);
    await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
