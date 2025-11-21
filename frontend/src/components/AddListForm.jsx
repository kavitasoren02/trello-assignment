import { useState } from "react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_BASE_URL;

export default function AddListForm({ boardId, onListAdded }) {
    const [isOpen, setIsOpen] = useState(false)
    const [listName, setListName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleAddList = async (e) => {
        e.preventDefault()
        if (!listName.trim()) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.post(`${API_BASE}/lists`, {
                boardId,
                name: listName,
            })
            onListAdded(response.data)
            setListName("")
            setIsOpen(false)
        } catch (err) {
            console.error("Error adding list:", err)
            setError(err.response?.data?.error || "Failed to add list")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <div className="flex-shrink-0 w-80">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full h-12 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:bg-blue-500/10 cursor-pointer transition-colors group"
                >
                    <span className="text-sm font-medium group-hover:text-blue-400">+ Add another list</span>
                </button>
            </div>
        )
    }

    return (
        <div className="flex-shrink-0 w-80 bg-slate-800 rounded-lg border border-slate-700 p-4 animate-in fade-in duration-200">
            <form onSubmit={handleAddList} className="space-y-3">
                <input
                    type="text"
                    placeholder="Enter list name..."
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={isLoading || !listName.trim()}
                        className="flex-1 px-3 py-2 bg-blue-600 text-slate-50 text-sm rounded font-medium hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
                    >
                        {isLoading ? "Creating..." : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false)
                            setListName("")
                            setError(null)
                        }}
                        className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 text-sm rounded font-medium hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
