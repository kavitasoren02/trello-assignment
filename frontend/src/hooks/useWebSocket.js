import { useEffect, useRef, useState } from "react"

export function useWebSocket(onMessage) {
  const ws = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;

    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log("WebSocket connected")
      setConnected(true)
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        onMessage(message)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.current.onclose = () => {
      console.log("WebSocket disconnected")
      setConnected(false)
    }

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error)
      setConnected(false)
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  return { connected }
}
