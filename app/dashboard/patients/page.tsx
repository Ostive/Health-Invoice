import type { Metadata } from 'next'
import { PatientsView } from '@/components/dashboard/PatientsView'

export const metadata: Metadata = { title: 'Patients' }

export default function PatientsPage() {
    return <PatientsView />
}
