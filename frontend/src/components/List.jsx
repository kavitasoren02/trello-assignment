import { useState, useEffect } from "react"
import axios from "axios"
import Card from "./Card"

const API_BASE = import.meta.env.VITE_BASE_URL;

export default function List({ list, boardId }) {
  const [newCardName, setNewCardName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [cards, setCards] = useState(list.cards || [])

  useEffect(() => {
    setCards(list.cards || [])
  }, [list.cards])

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (!newCardName.trim()) return

    setIsAdding(true)
    try {
      const response = await axios.post(`${API_BASE}/tasks`, {
        listId: list.id,
        name: newCardName,
        desc: "",
        boardId,
      })
      setCards([...cards, response.data])
      setNewCardName("")
    } catch (error) {
      console.error("Error adding card:", error)
      alert("Failed to add card: " + error.message)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex-shrink-0 w-80 bg-slate-800 rounded-lg border border-slate-700 flex flex-col max-h-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-50 text-sm">{list.name}</h3>
          <span className="text-xs text-slate-400 mt-1">{cards.length} cards</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-50"
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {cards.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>No cards yet</p>
                <p className="mt-1">Add one below to get started</p>
              </div>
            ) : (
              cards.map((card) => <Card key={card.id} card={card} listId={list.id} boardId={boardId} />)
            )}
          </div>

          <div className="border-t border-slate-700 px-3 py-3">
            <form onSubmit={handleAddCard} className="space-y-2">
              <input
                type="text"
                placeholder="Add a card..."
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={isAdding || !newCardName.trim()}
                className="w-full px-3 py-2 bg-blue-600 text-slate-50 text-sm rounded hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 transition-colors font-medium"
              >
                {isAdding ? "Adding..." : "Add Card"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
