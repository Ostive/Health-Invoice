import { test, expect } from '@playwright/test';

test.describe('Site public', () => {
    test('la page d’accueil présente le produit et mène à l’inscription', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Dictez la tournée');

        const cta = page.getByRole('banner').getByRole('link', { name: 'Essayer gratuitement' });
        await expect(cta).toHaveAttribute('href', '/inscription');
        await cta.click();

        await expect(page).toHaveURL(/\/inscription$/);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Créer votre compte');
    });

    test('le menu mène aux sections de la page', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Tarifs' }).click();
        await expect(page).toHaveURL(/#pricing$/);
        await expect(page.locator('#pricing')).toBeInViewport();
    });

    test('les pages légales sont de vraies pages', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('contentinfo').getByRole('link', { name: 'Conditions d’utilisation' }).click();
        await expect(page).toHaveURL(/\/cgu$/);
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Conditions générales');

        await page.goto('/confidentialite');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Politique de confidentialité');
    });

    test('des identifiants inconnus donnent un message clair', async ({ page }) => {
        await page.goto('/connexion');
        await page.getByLabel('Email professionnel').fill('inconnu.e2e@example.com');
        await page.getByLabel('Mot de passe', { exact: true }).fill('Mauvais-mot-de-passe1!');
        await page.getByRole('button', { name: 'Se connecter' }).click();
        await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible();
    });

    test('le tableau de bord renvoie vers la connexion', async ({ page }) => {
        await page.goto('/dashboard/patients');
        await expect(page).toHaveURL(/\/connexion$/);
    });

    test('les routes API refusent un visiteur non connecté', async ({ request }) => {
        for (const url of ['/api/invoices', '/api/folders', '/api/patients', '/api/profile']) {
            expect((await request.get(url)).status(), url).toBe(401);
        }
        const save = await request.post('/api/invoices', { data: { invoice: {} } });
        expect(save.status()).toBe(401);
        const pdf = await request.post('/api/generate-pdf', { data: { invoiceId: '00000000-0000-4000-8000-000000000000' } });
        expect(pdf.status()).toBe(401);
    });

    test('les anciennes adresses des paramètres sont redirigées', async ({ request }) => {
        const response = await request.get('/dashboard/subscription', { maxRedirects: 0 });
        expect(response.status()).toBe(308);
        expect(response.headers()['location']).toContain('/dashboard/parametres/abonnement');
    });
});

test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('le header ne garde que le menu, sans débordement', async ({ page }) => {
        await page.goto('/');
        const banner = page.getByRole('banner');
        await expect(banner.getByRole('link', { name: 'Essayer gratuitement' })).toBeHidden();

        await banner.getByRole('button', { name: 'Menu' }).click();
        await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible();

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollWidth).toBeLessThanOrEqual(375);
    });
});
