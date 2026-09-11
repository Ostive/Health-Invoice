import { Logo } from '@/components/ui/logo'

const Bar = ({ className }: { className: string }) => <div className={`animate-pulse rounded bg-paper ${className}`} />

/** Shown by the dashboard layout while the data read on the server streams in */
export function DashboardSkeleton() {
    return (
        <div className="relative flex h-full overflow-hidden bg-paper" aria-busy="true" aria-label="Chargement du tableau de bord">
            <div className="hidden h-full w-72 shrink-0 flex-col border-r border-rule bg-white lg:flex">
                <div className="flex h-16 shrink-0 items-center border-b border-rule pl-5"><Logo /></div>
                <div className="space-y-3 p-3">
                    <Bar className="h-9 rounded-lg" />
                    <div className="h-9 animate-pulse rounded-lg bg-primary-50" />
                </div>
                <div className="space-y-1 border-t border-rule px-2 pt-3">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-lg px-3 py-3">
                            <div className="flex justify-between"><Bar className="h-3.5 w-28" /><Bar className="h-3.5 w-12" /></div>
                            <Bar className="mt-2 h-3 w-20" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-14 shrink-0 items-center border-b border-rule bg-white px-4 lg:hidden"><Logo /></div>
                <div className="hidden h-16 shrink-0 items-center border-b border-rule bg-white px-6 lg:flex"><Bar className="h-4 w-40" /></div>
            </div>
        </div>
    )
}
