import express from "express"
import cors from "cors"
import { WebSocketServer } from "ws"
import { createServer } from "http"
import dotenv from "dotenv"
import axios from "axios"

dotenv.config()

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

app.use(cors())
app.use(express.json())

// Store connected WebSocket clients
const clients = new Set()
const webhookIds = new Map()

const TRELLO_API = "https://api.trello.com/1"
const API_KEY = process.env.TRELLO_API_KEY
const API_TOKEN = process.env.TRELLO_API_TOKEN

const trelloParams = {
  key: API_KEY,
  token: API_TOKEN,
}

// Broadcast event to all connected clients
function broadcast(event) {
  const message = JSON.stringify(event)
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message)
    }
  })
}

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("New WebSocket client connected")
  clients.add(ws)

  ws.on("close", () => {
    clients.delete(ws)
    console.log("WebSocket client disconnected")
  })

  ws.on("error", (err) => {
    console.error("WebSocket error:", err)
    clients.delete(ws)
  })
})

// ==================== API ENDPOINTS ====================

// 1. Create Board
app.post("/api/boards", async (req, res) => {
  try {
    const { name, defaultLists } = req.body

    const response = await axios.post(`${TRELLO_API}/boards`, {
      name,
      defaultLists: defaultLists || true,
      ...trelloParams,
    })

    const board = response.data

    // Broadcast board creation
    broadcast({
      type: "board-created",
      data: board,
    })

    res.json(board)
  } catch (error) {
    console.error("Error creating board:", error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get all boards for a user
app.get("/api/boards", async (req, res) => {
  try {
    const response = await axios.get(`${TRELLO_API}/members/me/boards`, {
      params: trelloParams,
    })
    
    const openBoards = response.data.filter(b => !b.closed)

    res.json(openBoards)
  } catch (error) {
    console.error("Error fetching boards:", error.message)
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params

    const response = await axios.put(`${TRELLO_API}/boards/${boardId}`, {
      closed: true,
      ...trelloParams,
    })

    // Broadcast board deletion
    broadcast({
      type: "board-deleted",
      data: { boardId },
    })

    res.json({ success: true, boardId })
  } catch (error) {
    console.error("Error deleting board:", error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get board details with lists and cards
app.get("/api/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params
    const response = await axios.get(`${TRELLO_API}/boards/${boardId}`, {
      params: {
        ...trelloParams,
        lists: "open",
        cards: "open",
      },
    })
    res.json(response.data)
  } catch (error) {
    console.error("Error fetching board:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// Create List
app.post("/api/lists", async (req, res) => {
  try {
    const { boardId, name } = req.body

    const response = await axios.post(`${TRELLO_API}/lists`, {
      idBoard: boardId,
      name: name || "New List",
      ...trelloParams,
    })

    const list = response.data

    // Broadcast list creation
    broadcast({
      type: "list-created",
      data: { list, boardId },
    })

    res.json(list)
  } catch (error) {
    console.error("Error creating list:", error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

// 2. Create Task (Card)
app.post("/api/tasks", async (req, res) => {
  try {
    const { listId, name, desc, boardId } = req.body

    const response = await axios.post(`${TRELLO_API}/cards`, {
      idList: listId,
      name,
      desc: desc || "",
      ...trelloParams,
    })

    const card = response.data

    // Broadcast card creation
    broadcast({
      type: "card-created",
      data: { card, boardId },
    })

    res.json(card)
  } catch (error) {
    console.error("Error creating task:", error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

// 3. Update Task (Card)
app.put("/api/tasks/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params
    const { name, desc, idList, boardId } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (desc !== undefined) updateData.desc = desc
    if (idList) updateData.idList = idList

    const response = await axios.put(`${TRELLO_API}/cards/${cardId}`, {
      ...updateData,
      ...trelloParams,
    })

    const card = response.data

    // Broadcast card update
    broadcast({
      type: "card-updated",
      data: { card, boardId },
    })

    res.json(card)
  } catch (error) {
    console.error("Error updating task:", error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

// 4. Delete Task (Card) - Archive by setting closed=true
app.delete("/api/tasks/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params
    const { boardId } = req.body

    const response = await axios.put(`${TRELLO_API}/cards/${cardId}`, {
      closed: true,
      ...trelloParams,
    })

    const card = response.data

    // Broadcast card deletion
    broadcast({
      type: "card-deleted",
      data: { cardId, boardId },
    })

    res.json({ success: true, cardId })
  } catch (error) {
    console.error("Error deleting task:", error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

// Register Webhook
app.post("/api/webhooks/register", async (req, res) => {
  try {
    const { boardId } = req.body
    const webhookUrl = process.env.WEBHOOK_URL

    if (!webhookUrl) {
      return res.status(400).json({ error: "WEBHOOK_URL not configured" })
    }

    const response = await axios.post(`${TRELLO_API}/webhooks`, {
      callbackURL: `${webhookUrl}?boardId=${boardId}`,
      idModel: boardId,
      description: `Webhook for board ${boardId}`,
      ...trelloParams,
    })

    webhookIds.set(boardId, response.data.id)

    res.json({
      success: true,
      webhookId: response.data.id,
      message: "Webhook registered successfully",
    })
  } catch (error) {
    console.error("Error registering webhook:", error.response?.data || error.message)
    res.status(500).json({ error: error.message })
  }
})

// Webhook callback from Trello
app.head("/webhook", (req, res) => {
  res.sendStatus(200)
})

app.post("/webhook", express.json(), (req, res) => {
  res.sendStatus(200)

  const { action, model } = req.body
  const boardId = req.query.boardId

  if (!action) return

  const eventMap = {
    createCard: "card-created",
    updateCard: "card-updated",
    deleteCard: "card-deleted",
  }

  const eventType = eventMap[action.type]

  if (eventType) {
    broadcast({
      type: eventType,
      data: {
        action,
        model,
        boardId,
      },
    })

    console.log(`Webhook received: ${eventType}`)
  }
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`WebSocket server on ws://localhost:${PORT}`)
  console.log(`Webhook URL: ${process.env.WEBHOOK_URL}`)
})
