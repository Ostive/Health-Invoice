/**
 * Creates (or refreshes) a demo account filled with sample data.
 *
 *   npm run db:seed                          local Supabase (localhost) only
 *   npm run db:seed -- --remote              also allowed on a hosted project
 *   npm run db:seed -- --remote --delete     removes the demo account and its data
 *
 * SEED_EMAIL / SEED_PASSWORD override the credentials; a strong password is generated otherwise.
 * Sensitive fields are encrypted with ENCRYPTION_KEY, exactly like the API routes do.
 * All names, numbers and amounts below are fictitious.
 */
import { randomBytes, randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { encrypt } from '../lib/encryption.ts'

const args = new Set(process.argv.slice(2))

function fail(message: string): never {
    console.error(`✖ ${message}`)
    process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) fail('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis (.env.local ou .env).')
if (!process.env.ENCRYPTION_KEY) fail('ENCRYPTION_KEY doit être défini : les données sensibles sont chiffrées.')

const host = new URL(url).hostname
const isLocal = ['localhost', '127.0.0.1', '0.0.0.0', 'host.docker.internal'].includes(host)
if (!isLocal && !args.has('--remote')) {
    fail(`Base distante détectée (${host}). Relancez avec « npm run db:seed -- --remote » pour confirmer.`)
}

const email = (process.env.SEED_EMAIL ?? 'demo.soignant@example.com').toLowerCase()
const password = process.env.SEED_PASSWORD ?? `Demo-${randomBytes(9).toString('base64url')}!9a`

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

async function findUserId(): Promise<string | null> {
    const perPage = 200
    for (let page = 1; page <= 50; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
        if (error) throw error
        const match = data.users.find(u => u.email?.toLowerCase() === email)
        if (match) return match.id
        if (data.users.length < perPage) return null
    }
    return null
}

const day = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d.toISOString().slice(0, 10)
}

const line = (description: string, quantity: number, unitPrice: number) => ({
    id: randomUUID(),
    description: encrypt(description),
    quantity,
    unitPrice,
})

const PATIENTS = [
    { name: 'Jeanne Lefèvre', email: 'jeanne.lefevre@example.com', phone: '06 39 98 10 01', address: '4 place Sathonay\n69001 Lyon', ssn: '2 41 03 99 999 001 12', notes: 'Pansement complexe tous les deux jours. Clé chez la voisine.' },
    { name: 'Marcel Dubois', email: '', phone: '06 39 98 10 02', address: '27 rue Burdeau\n69001 Lyon', ssn: '1 38 11 99 999 002 45', notes: 'Injection d’anticoagulant le matin.' },
    { name: 'Sophie Martin', email: 'sophie.martin@example.com', phone: '06 39 98 10 03', address: '9 quai Saint-Vincent\n69001 Lyon', ssn: '2 79 06 99 999 003 78', notes: '' },
    { name: 'Ahmed Benali', email: 'ahmed.benali@example.com', phone: '06 39 98 10 04', address: '15 montée de la Grande-Côte\n69001 Lyon', ssn: '1 52 09 99 999 004 21', notes: 'Diabétique : surveillance glycémique et insuline.' },
]

async function main() {
    const existingId = await findUserId()

    if (args.has('--delete')) {
        if (!existingId) {
            console.log(`Aucun compte ${email} à supprimer.`)
            return
        }
        const { error } = await admin.auth.admin.deleteUser(existingId)
        if (error) throw error
        console.log(`✔ Compte ${email} supprimé (ses données sont effacées en cascade).`)
        return
    }

    let userId = existingId
    if (userId) {
        const { error } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true })
        if (error) throw error
    } else {
        const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
        if (error || !data.user) throw error ?? new Error('Création du compte impossible')
        userId = data.user.id
    }

    // Start from a clean slate — for this account only
    for (const table of ['invoices', 'patients', 'folders']) {
        const { error } = await admin.from(table).delete().eq('user_id', userId)
        if (error) throw error
    }

    const { data: profile, error: profileError } = await admin
        .from('profiles')
        .upsert({
            id: userId,
            email,
            is_pro: false,
            full_name: 'Claire Moreau',
            specialty: 'Infirmière diplômée d’État',
            address: '18 rue des Tanneurs\n69001 Lyon',
            phone: '01 99 00 12 34',
            siret: '000 000 000 00000',
            adeli: '69 1 00000 0',
            is_vat_applicable: false,
            invoice_counter: 0,
            last_invoice_year: new Date().getFullYear(),
        })
        .select('*')
        .single()
    if (profileError) throw profileError

    const { data: folders, error: folderError } = await admin
        .from('folders')
        .insert([
            { user_id: userId, name: 'Tournée du matin', color: 'blue' },
            { user_id: userId, name: 'Cabinet', color: 'green' },
        ])
        .select('id, name')
    if (folderError) throw folderError
    const folderId = (name: string | null) => (name ? folders?.find(f => f.name === name)?.id ?? null : null)

    const { data: patients, error: patientError } = await admin
        .from('patients')
        .insert(PATIENTS.map(p => ({
            user_id: userId,
            name: p.name,
            email: p.email || null,
            phone: p.phone,
            address: p.address,
            ssn: encrypt(p.ssn),
            notes: p.notes ? encrypt(p.notes) : null,
        })))
        .select('id, name')
    if (patientError) throw patientError

    const patient = (name: string) => {
        const p = PATIENTS.find(row => row.name === name)
        if (!p) throw new Error(`Patient inconnu : ${name}`)
        return {
            id: patients?.find(row => row.name === name)?.id ?? null,
            client: { name: p.name, address: p.address, email: p.email, ssn: encrypt(p.ssn) },
        }
    }

    // Oldest first so the database hands out numbers in date order (FAC-YYYY-00001…)
    const invoices = [
        { patient: 'Sophie Martin', date: day(-45), due: day(-15), status: 'Payée', template: 'modern', folder: 'Cabinet', notes: 'Réglée par carte bancaire.', items: [line('AMI 1 — Prise de sang à domicile', 1, 3.15), line('IFD — Indemnité forfaitaire de déplacement', 1, 2.75)] },
        { patient: 'Marcel Dubois', date: day(-40), due: day(-10), status: 'En retard', template: 'classic', folder: 'Tournée du matin', notes: 'Série de 10 injections.', items: [line('AMI 1 — Injection sous-cutanée', 10, 3.15), line('IFD — Indemnité forfaitaire de déplacement', 10, 2.75)] },
        { patient: 'Jeanne Lefèvre', date: day(-12), due: day(18), status: 'Envoyée', template: 'modern', folder: 'Tournée du matin', notes: '', items: [line('AMI 4 — Pansement complexe', 6, 12.6), line('IFD — Indemnité forfaitaire de déplacement', 6, 2.75)] },
        { patient: 'Ahmed Benali', date: day(-3), due: day(27), status: 'Payée', template: 'elegant', folder: null, notes: '', items: [line('AMI 1 — Injection d’insuline', 7, 3.15), line('IFD — Indemnité forfaitaire de déplacement', 7, 2.75)] },
        { patient: 'Jeanne Lefèvre', date: day(0), due: day(30), status: 'Brouillon', template: 'modern', folder: 'Tournée du matin', notes: '', items: [line('AMI 4 — Pansement complexe', 1, 12.6), line('IFD — Indemnité forfaitaire de déplacement', 1, 2.75)] },
    ]

    for (const invoice of invoices) {
        const { id: patientId, client } = patient(invoice.patient)
        const { error } = await admin.from('invoices').insert({
            user_id: userId,
            number: null, // assigned by the set_user_invoice_number trigger
            date: invoice.date,
            due_date: invoice.due,
            status: invoice.status,
            template: invoice.template,
            client,
            items: invoice.items,
            notes: invoice.notes ? encrypt(invoice.notes) : null,
            folder_id: folderId(invoice.folder),
            patient_id: patientId,
            // Finalised invoices freeze the seller's details, like the API does
            seller_snapshot: invoice.status === 'Brouillon' ? null : profile,
        })
        if (error) throw error
    }

    console.log('')
    console.log(`✔ Compte de démonstration prêt sur ${host}`)
    console.log(`  Email        : ${email}`)
    console.log(`  Mot de passe : ${password}`)
    console.log(`  Données      : ${PATIENTS.length} patients, ${folders?.length ?? 0} dossiers, ${invoices.length} factures`)
    if (!process.env.SEED_PASSWORD) console.log('  (mot de passe généré — définissez SEED_PASSWORD pour en choisir un)')
}

main().catch(err => fail(err instanceof Error ? err.message : JSON.stringify(err)))
