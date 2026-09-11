import React from 'react';

const Bar = ({ className }: { className: string }) => <div className={`animate-pulse rounded bg-paper ${className}`} />;

export const DashboardSkeleton = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-paper" aria-busy="true" aria-label="Chargement du tableau de bord">
            <aside className="hidden h-full w-72 shrink-0 flex-col gap-5 border-r border-rule bg-white p-4 lg:flex">
                <Bar className="h-8 w-40" />
                <Bar className="h-10 w-full rounded-lg" />
                <div className="space-y-2">
                    <Bar className="h-3 w-16" />
                    <Bar className="h-7 w-full" />
                    <Bar className="h-7 w-full" />
                </div>
                <div className="flex-1 space-y-2">
                    <Bar className="h-14 w-full rounded-lg" />
                    <Bar className="h-14 w-full rounded-lg" />
                    <Bar className="h-14 w-full rounded-lg" />
                </div>
                <div className="flex items-center gap-3 border-t border-rule pt-4">
                    <Bar className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2"><Bar className="h-3 w-24" /><Bar className="h-2.5 w-32" /></div>
                </div>
            </aside>

            <main className="flex h-full flex-1 flex-col overflow-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-rule bg-white px-6">
                    <Bar className="h-5 w-48" />
                    <div className="flex gap-2"><Bar className="h-8 w-20 rounded-lg" /><Bar className="h-8 w-24 rounded-lg" /></div>
                </header>
                <div className="flex flex-1 overflow-hidden">
                    <div className="hidden h-full w-[46%] space-y-6 border-r border-rule bg-white p-8 md:block">
                        <Bar className="h-24 w-full rounded-2xl" />
                        <Bar className="h-3 w-20" />
                        <Bar className="h-10 w-full rounded-lg" />
                        <div className="grid grid-cols-2 gap-4"><Bar className="h-10 w-full rounded-lg" /><Bar className="h-10 w-full rounded-lg" /></div>
                    </div>
                    <div className="flex flex-1 justify-center bg-desk p-8">
                        <div className="aspect-[210/297] w-full max-w-md space-y-6 rounded-sm bg-white p-8 shadow-sheet">
                            <div className="flex justify-between"><Bar className="h-10 w-24" /><Bar className="h-10 w-20" /></div>
                            <Bar className="h-3 w-full" />
                            <Bar className="h-3 w-full" />
                            <Bar className="h-3 w-2/3" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
