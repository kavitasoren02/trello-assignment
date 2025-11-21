export default function Header() {
    return (
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 h-20 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-50">Trello Real-time</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-xs text-slate-400">Real-time WebSocket Sync Enabled</div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
        </header>
    )
}
