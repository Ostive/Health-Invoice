import React from 'react';

export const DashboardSkeleton = () => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar Skeleton */}
            <aside className="hidden lg:block w-72 shrink-0 h-full bg-white border-r border-slate-200 p-4 flex flex-col gap-6">
                {/* Logo */}
                <div className="h-8 w-32 bg-slate-100 rounded animate-pulse mb-4"></div>

                {/* New Invoice Button */}
                <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse"></div>

                {/* Folders */}
                <div className="space-y-3 mt-4">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse"></div>
                    <div className="h-8 w-full bg-slate-50 rounded animate-pulse"></div>
                    <div className="h-8 w-full bg-slate-50 rounded animate-pulse"></div>
                    <div className="h-8 w-full bg-slate-50 rounded animate-pulse"></div>
                </div>

                {/* List Items */}
                <div className="flex-1 space-y-3 mt-4">
                    <div className="h-16 w-full bg-slate-50 rounded-lg animate-pulse"></div>
                    <div className="h-16 w-full bg-slate-50 rounded-lg animate-pulse"></div>
                    <div className="h-16 w-full bg-slate-50 rounded-lg animate-pulse"></div>
                </div>

                {/* Bottom User Profile */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                            <div className="h-2 w-32 bg-slate-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100/50">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <div className="h-5 w-48 bg-slate-100 rounded animate-pulse"></div>
                    <div className="flex gap-3">
                        <div className="h-9 w-24 bg-slate-100 rounded animate-pulse"></div>
                        <div className="h-9 w-24 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Column (Desktop) */}
                    <div className="w-full md:w-[45%] h-full bg-white border-r border-slate-200 p-6 space-y-6 hidden md:block">
                        <div className="h-8 w-1/3 bg-slate-100 rounded animate-pulse mb-8"></div>

                        <div className="space-y-4">
                            <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse"></div>
                            <div className="h-10 w-full bg-slate-50 rounded animate-pulse"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 w-full bg-slate-50 rounded animate-pulse"></div>
                            <div className="h-10 w-full bg-slate-50 rounded animate-pulse"></div>
                        </div>

                        <div className="h-32 w-full bg-slate-50 rounded animate-pulse mt-8"></div>
                    </div>

                    {/* Preview Column */}
                    <div className="w-full md:w-[55%] h-full p-8 flex flex-col items-center justify-center">
                        <div className="w-[210mm] h-[297mm] bg-white shadow-sm rounded-lg p-8 space-y-8 scale-75 origin-top">
                            <div className="flex justify-between">
                                <div className="h-16 w-16 bg-slate-100 rounded animate-pulse"></div>
                                <div className="space-y-2 text-right">
                                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse ml-auto"></div>
                                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto"></div>
                                </div>
                            </div>
                            <div className="space-y-4 mt-12">
                                <div className="h-4 w-full bg-slate-50 rounded animate-pulse"></div>
                                <div className="h-4 w-full bg-slate-50 rounded animate-pulse"></div>
                                <div className="h-4 w-2/3 bg-slate-50 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
