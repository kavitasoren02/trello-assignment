# Trello Real-time Application

A full-stack Trello-like application with real-time synchronization using WebSockets and Trello's REST API.

## Project Structure

```
├── Frontend/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── Backend/                  # Node.js + Express + WebSocket
│   ├── server.js            # Main server file
│   ├── .env.example         # Environment variables template
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js v16+ and npm
- Trello account and API credentials

### Getting Trello API Key & Token

1. Go to https://trello.com/app-key
2. Copy your API Key
3. Click "Token" link to generate a token
4. Copy both values

### Backend Setup

1. Navigate to the Backend folder:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Trello API credentials:
   ```
   TRELLO_API_KEY=your_api_key_here
   TRELLO_API_TOKEN=your_api_token_here
   PORT=5000
   WEBHOOK_URL=http://localhost:5000/webhook
   ```

5. For production, use ngrok to expose your local server:
   ```bash
   ngrok http 5000
   ```
   Then update `WEBHOOK_URL` in `.env` with your ngrok URL.

6. Start the backend:
   ```bash
   npm start
   ```

### Frontend Setup

1. In a new terminal, navigate to the Frontend folder:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

### Register Webhook

Once both servers are running:

1. Create or select a board in the UI
2. Click "Register Webhook" button
3. The webhook will now listen for Trello events

## API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:boardId` - Get board details with lists and cards
- `POST /api/boards` - Create new board

### Tasks/Cards
- `POST /api/tasks` - Create a new card
- `PUT /api/tasks/:cardId` - Update card
- `DELETE /api/tasks/:cardId` - Delete card (archive)

### Webhooks
- `POST /api/webhooks/register` - Register webhook for real-time updates
- `POST /webhook` - Trello webhook callback endpoint

## WebSocket Events

The WebSocket server broadcasts the following events:

- `board-created` - When a new board is created
- `card-created` - When a card is created
- `card-updated` - When a card is updated
- `card-deleted` - When a card is deleted

## Testing

### Using Postman or cURL

#### 1. Create Board
```bash
curl -X POST http://localhost:5000/api/boards \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Board","defaultLists":true}'
```

#### 2. Add Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "boardId":"<board_id>",
    "listId":"<list_id>",
    "name":"New Task",
    "desc":"Task description"
  }'
```

#### 3. Update Task
```bash
curl -X PUT http://localhost:5000/api/tasks/<card_id> \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Updated Task",
    "boardId":"<board_id>"
  }'
```

#### 4. Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/<card_id> \
  -H "Content-Type: application/json" \
  -d '{"boardId":"<board_id>"}'
```

#### 5. Register Webhook
```bash
curl -X POST http://localhost:5000/api/webhooks/register \
  -H "Content-Type: application/json" \
  -d '{"boardId":"<board_id>"}'
```


## Features

- ✅ Real-time synchronization via WebSockets
- ✅ Trello API integration
- ✅ Board management (create boards)
- ✅ Card management (create, update, delete)
- ✅ Webhook-based event streaming
- ✅ Responsive UI with Tailwind CSS
- ✅ Real-time connection status indicator

## Known Limitations

- Trello rate limits apply (1000 requests per minute)
- Webhook registration requires public URL
- List reordering not implemented
- Card drag & drop not implemented (can be added as bonus)

## Environment Variables

Create a `.env` file in the Backend folder:

```env
# Required
TRELLO_API_KEY=your_key
TRELLO_API_TOKEN=your_token

# Server
PORT=5000
NODE_ENV=development

# Webhook (update with ngrok URL for production)
WEBHOOK_URL=http://localhost:5000/webhook
```


