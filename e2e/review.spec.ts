import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Visual review, run on demand (`npm run test:review`):
 * a PDF + an HTML preview capture for every invoice template, screenshots of every screen,
 * and an axe-core accessibility audit (colour contrast included). Output: review-output/
 */
const OUT = path.resolve('review-output');
fs.mkdirSync(path.join(OUT, 'pdf'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'screens'), { recursive: true });

type AxeRow = { page: string; rule: string; impact?: string | null; count: number; help: string; samples: string[] };
const AXE_FILE = path.join(OUT, 'axe.json');

// Captures show the settled state, not a modal halfway through its opening animation
test.use({ reducedMotion: 'reduce' });

async function audit(page: Page, name: string) {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const previous: AxeRow[] = fs.existsSync(AXE_FILE) ? JSON.parse(fs.readFileSync(AXE_FILE, 'utf8')) : [];
    const rows = results.violations.map(v => ({
        page: name,
        rule: v.id,
        impact: v.impact,
        count: v.nodes.length,
        help: v.help,
        samples: v.nodes.slice(0, 4).map(n => `${n.target.join(' ')} — ${n.any[0]?.message ?? n.failureSummary ?? ''}`.slice(0, 240)),
    }));
    fs.writeFileSync(AXE_FILE, JSON.stringify([...previous.filter(r => r.page !== name), ...rows], null, 2));
}

async function shot(page: Page, name: string, fullPage = false) {
    await page.screenshot({ path: path.join(OUT, 'screens', `${name}.png`), fullPage });
}

// Scroll through the page so every scroll-reveal section is visible in a full-page capture
async function revealAll(page: Page) {
    await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 80));
        }
        window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);
}

async function closeToast(page: Page, text: RegExp) {
    await expect(page.getByText(text)).toBeVisible();
    await page.getByRole('button', { name: 'Fermer la notification' }).click();
    await expect(page.getByText(text)).toHaveCount(0);
}

test.beforeAll(() => {
    if (fs.existsSync(AXE_FILE)) fs.rmSync(AXE_FILE);
});

test.describe('Pages publiques', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    const PAGES = [
        ['accueil', '/'],
        ['connexion', '/connexion'],
        ['inscription', '/inscription'],
        ['mot-de-passe-oublie', '/mot-de-passe-oublie'],
        ['cgu', '/cgu'],
        ['404', '/page-inexistante'],
    ] as const;

    for (const [name, url] of PAGES) {
        test(`bureau — ${name}`, async ({ page }) => {
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto(url);
            if (name === 'accueil') await revealAll(page);
            await shot(page, `bureau-${name}`, true);
            await audit(page, name);
        });
    }

    test('mobile — accueil, menu et connexion', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await revealAll(page);
        await shot(page, 'mobile-accueil', true);
        await page.getByRole('button', { name: 'Menu' }).click();
        await shot(page, 'mobile-menu-site');
        await page.goto('/connexion');
        await shot(page, 'mobile-connexion');
    });
});

test.describe('Tableau de bord', () => {
    test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Définir E2E_EMAIL et E2E_PASSWORD');
    test.describe.configure({ mode: 'serial' });

    const TEMPLATES = [
        ['modern', 'Moderne'],
        ['classic', 'Classique'],
        ['minimalist', 'Minimaliste'],
        ['elegant', 'Élégant'],
        ['corporate', 'Corporatif'],
    ] as const;

    async function openInvoice(page: Page, status: string) {
        await page.getByRole('complementary').getByRole('button').filter({ hasText: status }).first().click();
        await page.waitForTimeout(500);
    }

    async function chooseTemplate(page: Page, label: string) {
        await page.getByRole('button', { name: 'Modèle' }).click();
        await page.getByRole('option', { name: new RegExp(`^${label}`) }).click();
        await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
        await closeToast(page, /Facture sauvegardée/);
    }

    test('PDF et aperçu de chaque modèle', async ({ page }) => {
        test.setTimeout(180_000);
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/dashboard');
        await openInvoice(page, 'Brouillon');
        await expect(page.getByLabel('Nom complet')).toHaveValue('Jeanne Lefèvre');

        for (const [id, label] of TEMPLATES) {
            await chooseTemplate(page, label);
            await page.locator('#invoice-preview').screenshot({ path: path.join(OUT, 'pdf', `apercu-${id}.png`) });

            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('button', { name: 'PDF', exact: true }).click();
            const download = await downloadPromise;
            await download.saveAs(path.join(OUT, 'pdf', `${id}.pdf`));
            await closeToast(page, /PDF téléchargé/);
        }

        // Back to the seeded template
        await chooseTemplate(page, 'Moderne');
    });

    test('écrans du tableau de bord', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/dashboard');
        const sidebar = page.getByRole('complementary');
        await expect(sidebar.getByText('Jeanne Lefèvre').first()).toBeVisible();
        await shot(page, 'bureau-dashboard-vide');
        await audit(page, 'dashboard-vide');

        await openInvoice(page, 'Payée');
        await shot(page, 'bureau-facture-payee');

        await openInvoice(page, 'Brouillon');
        await shot(page, 'bureau-facture-brouillon');
        await audit(page, 'facture-brouillon');

        await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await shot(page, 'bureau-modale-suppression');
        await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click();

        await sidebar.getByRole('button', { name: 'Créer un dossier' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await shot(page, 'bureau-modale-dossier');
        await page.keyboard.press('Escape');

        await sidebar.getByRole('button', { name: /Passer à l.offre Pro/ }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await shot(page, 'bureau-modale-pro');
        await page.keyboard.press('Escape');

        await page.goto('/dashboard/patients');
        await expect(page.getByRole('main').getByText('Ahmed Benali')).toBeVisible();
        await shot(page, 'bureau-patients');
        await audit(page, 'patients');
        await page.getByRole('button', { name: 'Nouveau patient' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await shot(page, 'bureau-modale-patient');
        await page.keyboard.press('Escape');

        for (const [name, url] of [
            ['parametres', '/dashboard/parametres'],
            ['abonnement', '/dashboard/parametres/abonnement'],
            ['securite', '/dashboard/parametres/securite'],
        ] as const) {
            await page.goto(url);
            await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
            await page.waitForTimeout(400);
            await shot(page, `bureau-${name}`);
            await audit(page, name);
        }
    });

    test('mobile — menu, éditeur, aperçu et patients', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/dashboard');
        await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
        const drawer = page.getByRole('dialog', { name: 'Menu' });
        await expect(drawer.getByText('Jeanne Lefèvre').first()).toBeVisible();
        await shot(page, 'mobile-menu-dashboard');

        await drawer.getByRole('button').filter({ hasText: 'Brouillon' }).first().click();
        await page.waitForTimeout(500);
        await shot(page, 'mobile-editeur');
        await page.getByRole('button', { name: 'Aperçu' }).click();
        await page.waitForTimeout(500);
        await shot(page, 'mobile-apercu');

        await page.goto('/dashboard/patients');
        await expect(page.getByRole('main').getByText('Ahmed Benali')).toBeVisible();
        await shot(page, 'mobile-patients');
    });
});
