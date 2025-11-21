import { useState } from "react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_BASE_URL;

export default function Card({ card, listId, boardId }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(card.name)
  const [editedDesc, setEditedDesc] = useState(card.desc || "")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this card?")) return

    setIsDeleting(true)
    try {
      await axios.delete(`${API_BASE}/tasks/${card.id}`, {
        data: { boardId },
      })
    } catch (error) {
      console.error("Error deleting card:", error)
      setIsDeleting(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/tasks/${card.id}`, {
        name: editedName,
        desc: editedDesc,
        idList: listId,
        boardId,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating card:", error)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-slate-700 rounded-lg p-3 space-y-2 border border-blue-500/50 shadow-lg">
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="w-full px-2 py-1.5 rounded bg-slate-600 border border-slate-500 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <textarea
          value={editedDesc}
          onChange={(e) => setEditedDesc(e.target.value)}
          placeholder="Add description..."
          className="w-full px-2 py-1.5 rounded bg-slate-600 border border-slate-500 text-slate-50 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 px-2 py-1.5 bg-green-600 text-slate-50 text-xs rounded hover:bg-green-700 transition-colors font-medium"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setEditedName(card.name)
              setEditedDesc(card.desc || "")
            }}
            className="flex-1 px-2 py-1.5 bg-slate-600 text-slate-50 text-xs rounded hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="draggable bg-slate-700 rounded-lg p-3 hover:bg-slate-600 cursor-grab active:cursor-grabbing transition-all hover:shadow-md border border-slate-600 group"
      draggable
    >
      <p className="text-sm text-slate-50 font-medium break-words">{card.name}</p>
      {card.desc && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{card.desc}</p>}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs px-2 py-1 bg-blue-600/30 text-blue-400 rounded hover:bg-blue-600/50 transition-colors border border-blue-600/30"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs px-2 py-1 bg-red-600/30 text-red-400 rounded hover:bg-red-600/50 transition-colors border border-red-600/30 disabled:opacity-50"
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  )
}
