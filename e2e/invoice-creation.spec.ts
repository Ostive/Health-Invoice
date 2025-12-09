import { test, expect } from '@playwright/test';

test.describe('Invoice Creation', () => {
    test('should allow a user to create a new invoice', async ({ page }) => {
        console.log('Step 1: Go to home');
        await page.goto('/');

        console.log('Step 2: Click Connexion');

        // Check if desktop button is visible
        const desktopLoginBtn = page.getByRole('button', { name: 'Connexion' });

        try {
            if (await desktopLoginBtn.isVisible({ timeout: 5000 })) {
                console.log('Clicking desktop login button');
                await desktopLoginBtn.click();
            } else {
                console.log('Desktop button not visible, trying mobile menu');
                // Open mobile menu
                const menuBtn = page.getByLabel('Menu');
                await menuBtn.click();
                await page.getByRole('button', { name: 'Se connecter' }).first().click();
            }
        } catch (e) {
            console.log('Error finding login button');
            throw e;
        }

        console.log('Step 3: Click Remplir demo');
        await page.getByRole('button', { name: 'Remplir compte de démonstration' }).click();

        console.log('Step 4: Click Se connecter');
        await page.getByRole('button', { name: 'Se connecter' }).click();

        console.log('Step 5: Wait for Dashboard URL');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });

        console.log('Step 6: Dashboard loaded, checking title');
        await expect(page).toHaveTitle(/Facturier/);

        console.log('Step 7: Try to open invoice editor');

        // Helper to check editor
        const isEditorOpen = async () => await page.getByLabel('Nom complet').isVisible();

        if (await isEditorOpen()) {
            console.log('Editor already open');
        } else {
            // Try Header Button
            const headerBtn = page.getByRole('button', { name: 'Nouveau', exact: true });
            if (await headerBtn.isVisible()) {
                console.log('Clicking Header Nouveau');
                await headerBtn.click();
            }

            // Wait and check
            try { await expect(page.getByLabel('Nom complet')).toBeVisible({ timeout: 2000 }); } catch (e) { }

            if (!await isEditorOpen()) {
                // Try Sidebar Button
                const sidebarBtn = page.getByRole('button', { name: 'Nouvelle Facture' });
                if (await sidebarBtn.isVisible()) {
                    console.log('Clicking Sidebar Nouvelle Facture');
                    await sidebarBtn.click();
                }
                try { await expect(page.getByLabel('Nom complet')).toBeVisible({ timeout: 2000 }); } catch (e) { }
            }

            if (!await isEditorOpen()) {
                // Try Empty State Button
                const emptyStateBtn = page.getByRole('button', { name: 'Créer une facture' });
                if (await emptyStateBtn.isVisible()) {
                    console.log('Clicking Empty State Create');
                    await emptyStateBtn.click();
                }
            }
        }

        console.log('Step 8: Wait for form to appear');
        await expect(page.getByLabel('Nom complet')).toBeVisible();

        console.log('Step 9: Fill form');
        await page.getByLabel('Nom complet').fill('Jean Test');
        await page.locator('textarea#client-address').fill('1 Rue du Test');

        console.log('Step 10: Add Item');
        // Removed exact: true because button text is "+ Ajouter"
        await page.getByRole('button', { name: 'Ajouter', exact: false }).click();
        await page.locator('input[placeholder="Description du soin"]').last().fill('Consultation Test');
        await page.locator('input[placeholder="0.00"]').last().fill('50');

        console.log('Step 11: Save and Assert');
        await expect(page.locator('input[placeholder="0.00"]').last()).toHaveValue('50');

        // Save
        await page.getByRole('button', { name: 'Enregistrer' }).click();
    });
});
