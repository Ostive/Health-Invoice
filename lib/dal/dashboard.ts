import 'server-only'
import type { DashboardData } from '@/types'
import { listInvoices } from './invoices'
import { listFolders } from './folders'
import { listPatients } from './patients'
import { fallbackProfile, getProfile } from './profile'
import type { Session } from './session'

/**
 * Everything the dashboard shows, read in parallel on the server while the page renders.
 * One failing read doesn't take the dashboard down: that part comes back empty.
 */
export async function loadDashboardData(session: Session): Promise<DashboardData> {
    const [profile, invoices, folders, patients] = await Promise.allSettled([
        getProfile(session),
        listInvoices(session),
        listFolders(session),
        listPatients(session),
    ])

    for (const [part, result] of Object.entries({ profile, invoices, folders, patients })) {
        if (result.status === 'rejected') {
            console.error(`[dashboard] ${part} could not be loaded`, { userId: session.user.id, error: result.reason })
        }
    }

    return {
        profile: profile.status === 'fulfilled' ? profile.value : fallbackProfile(session.user),
        invoices: invoices.status === 'fulfilled' ? invoices.value : [],
        invoicesError: invoices.status === 'fulfilled' ? null : 'Vos factures n’ont pas pu être chargées. Rechargez la page.',
        folders: folders.status === 'fulfilled' ? folders.value : [],
        patients: patients.status === 'fulfilled' ? patients.value : [],
    }
}
