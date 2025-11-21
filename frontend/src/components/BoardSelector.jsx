import { useState } from "react"

export default function BoardSelector({
  boards,
  selectedBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onRegisterWebhook,
  loading,
  error,
}) {
  const [newBoardName, setNewBoardName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newBoardName.trim()) return

    setIsCreating(true)
    try {
      await onCreateBoard(newBoardName)
      setNewBoardName("")
      setShowForm(false)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <select
            value={selectedBoardId || ""}
            onChange={(e) => onSelectBoard(e.target.value)}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 cursor-pointer hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
          >
            <option value="">Select a board...</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </div>

        {selectedBoardId && (
          <>
            <button
              onClick={() => onRegisterWebhook(selectedBoardId)}
              className="px-3 py-2 rounded-lg bg-green-600/20 border border-green-600/30 text-green-400 text-sm hover:bg-green-600/30 transition-colors font-medium"
            >
              Register Webhook
            </button>
            <button
              onClick={() => onDeleteBoard(selectedBoardId)}
              className="px-3 py-2 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-sm hover:bg-red-600/30 transition-colors font-medium"
            >
              Delete Board
            </button>
          </>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-slate-50 text-sm hover:bg-blue-700 transition-colors font-medium"
        >
          + New Board
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateBoard} className="flex gap-2 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <input
            type="text"
            placeholder="Board name (e.g., Q1 Projects)"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={isCreating || !newBoardName.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-slate-50 text-sm hover:bg-blue-700 disabled:bg-slate-600 transition-colors font-medium"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 rounded bg-slate-700 text-slate-50 text-sm hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}
