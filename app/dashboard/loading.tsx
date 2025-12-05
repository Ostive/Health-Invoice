export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Chargement du tableau de bord...</p>
        </div>
    );
}
