import { useState, useEffect } from "react"
import axios from "axios"
import List from "./List"
import AddListForm from "./AddListForm"
import { useWebSocket } from "../hooks/useWebSocket"

const API_BASE = import.meta.env.VITE_BASE_URL;

export default function Board({ boardId }) {
  const [board, setBoard] = useState(null)
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { connected, lastUpdate } = useWebSocket((event) => {
    handleWebSocketEvent(event)
  })

  useEffect(() => {
    fetchBoard()
    const interval = setInterval(fetchBoard, 60000)
    return () => clearInterval(interval)
  }, [boardId])

  const fetchBoard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE}/boards/${boardId}`)
      setBoard(response.data)
      setLists(response.data.lists || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching board:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleWebSocketEvent = (event) => {
    if (event.type === "card-created") {
      const { card } = event.data
      if (card && card.idList) {
        setLists((prevLists) =>
          prevLists.map((list) => (list.id === card.idList ? { ...list, cards: [...(list.cards || []), card] } : list)),
        )
      }
    } else if (event.type === "card-updated") {
      const { card } = event.data
      if (card) {
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            cards: (list.cards || []).map((c) => (c.id === card.id ? card : c)),
          })),
        )
      }
    } else if (event.type === "card-deleted") {
      const { cardId } = event.data
      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: (list.cards || []).filter((c) => c.id !== cardId),
        })),
      )
    } else if (event.type === "list-created") {
      const { list } = event.data
      if (list) {
        setLists((prevLists) => [...prevLists, { ...list, cards: [] }])
      }
    }
  }

  const handleListAdded = (newList) => {
    setLists([...lists, newList])
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading board...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-medium">Error loading board</p>
          <p className="text-slate-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-900/50">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">{board?.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{lists.length} lists</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs font-medium text-slate-300">{connected ? "Connected" : "Disconnected"}</span>
          </div>
          {lastUpdate && <span className="text-xs text-slate-500">Updated now</span>}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 p-6 min-w-min">
          {lists.map((list) => (
            <List key={list.id} list={list} boardId={boardId} />
          ))}
          <AddListForm boardId={boardId} onListAdded={handleListAdded} />
        </div>
      </div>
    </div>
  )
}
