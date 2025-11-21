import { useState, useEffect } from "react"
import axios from "axios"
import Board from "./components/Board"
import BoardSelector from "./components/BoardSelector"
import Header from "./components/Header"
import "./App.css"

const API_BASE = import.meta.env.VITE_BASE_URL;

function App() {
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBoards()
    const interval = setInterval(fetchBoards, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchBoards = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE}/boards`)
      setBoards(response.data)
      if (response.data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(response.data[0].id)
      }
    } catch (error) {
      console.error("Error fetching boards:", error)
      setError("Failed to load boards")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoard = async (boardName) => {
    try {
      const response = await axios.post(`${API_BASE}/boards`, {
        name: boardName,
        defaultLists: true,
      })
      const newBoard = response.data
      setBoards([...boards, newBoard])
      setSelectedBoardId(newBoard.id)
    } catch (error) {
      console.error("Error creating board:", error)
      setError("Failed to create board")
    }
  }

  const handleDeleteBoard = async (boardId) => {
    try {
      await axios.delete(`${API_BASE}/boards/${boardId}`)
      const remainingBoards = boards.filter((b) => b.id !== boardId)
      setBoards(remainingBoards)
      if (selectedBoardId === boardId) {
        setSelectedBoardId(remainingBoards.length > 0 ? remainingBoards[0].id : null)
      }
    } catch (error) {
      console.error("Error deleting board:", error)
      setError("Failed to delete board")
    }
  }

  const handleRegisterWebhook = async (boardId) => {
    try {
      await axios.post(`${API_BASE}/webhooks/register`, { boardId })
      alert("Webhook registered successfully!")
    } catch (error) {
      console.error("Error registering webhook:", error)
      alert("Failed to register webhook")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <main className="h-[calc(100vh-80px)] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="border-b border-slate-800 px-6 py-4 bg-slate-900">
            <BoardSelector
              boards={boards}
              selectedBoardId={selectedBoardId}
              onSelectBoard={setSelectedBoardId}
              onCreateBoard={handleCreateBoard}
              onDeleteBoard={handleDeleteBoard}
              onRegisterWebhook={handleRegisterWebhook}
              loading={loading}
              error={error}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            {selectedBoardId ? (
              <Board boardId={selectedBoardId} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <p className="text-lg">No board selected</p>
                  <p className="text-sm mt-2">Create a new board to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
