// "use client"

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   type ReactNode,
// } from "react"
// import { io, type Socket } from "socket.io-client"

// type SocketStatus = "connecting" | "connected" | "disconnected"

// type SocketContextValue = {
//   socket: Socket | null
//   status: SocketStatus
//   /** True after we were connected and then lost the link (banner). */
//   reconnecting: boolean
// }

// const SocketContext = createContext<SocketContextValue | null>(null)

// function realtimeUrl(): string {
//   return (
//     process.env.NEXT_PUBLIC_REALTIME_URL?.replace(/\/$/, "") ||
//     "http://localhost:4001"
//   )
// }

// /**
//  * One Socket.IO connection for the authenticated app shell.
//  * Cookie `teamhub_session` rides along via withCredentials (T14 handshake).
//  */
// export function SocketProvider({
//   children,
// }: Readonly<{ children: ReactNode }>) {
//   const [socket, setSocket] = useState<Socket | null>(null)
//   const [status, setStatus] = useState<SocketStatus>("connecting")
//   const [reconnecting, setReconnecting] = useState(false)

//   useEffect(() => {
//     const instance = io(realtimeUrl(), {
//       withCredentials: true,
//       transports: ["websocket", "polling"],
//       autoConnect: true,
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//     })

//     const onConnect = () => {
//       setSocket(instance)
//       setStatus("connected")
//       setReconnecting(false)
//     }

//     const onDisconnect = () => {
//       setStatus("disconnected")
//       setReconnecting(true)
//     }

//     const onConnectError = (err: Error) => {
//       console.error("[socket] connect_error:", err.message)
//       setStatus("disconnected")
//       setReconnecting(true)
//     }

//     instance.on("connect", onConnect)
//     instance.on("disconnect", onDisconnect)
//     instance.on("connect_error", onConnectError)

//     return () => {
//       instance.off("connect", onConnect)
//       instance.off("disconnect", onDisconnect)
//       instance.off("connect_error", onConnectError)
//       instance.disconnect()
//     }
//   }, [])

//   const value: SocketContextValue = { socket, status, reconnecting }

//   return (
//     <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
//   )
// }

// export function useSocket(): SocketContextValue {
//   const ctx = useContext(SocketContext)
//   if (!ctx) {
//     throw new Error("useSocket must be used within SocketProvider")
//   }
//   return ctx
// }

"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { io, type Socket } from "socket.io-client"

type SocketStatus = "connecting" | "connected" | "disconnected"

type SocketContextValue = {
  socket: Socket | null
  status: SocketStatus
  reconnecting: boolean
}

const SocketContext = createContext<SocketContextValue | null>(null)

function realtimeUrl(): string {
  return (
    process.env.NEXT_PUBLIC_REALTIME_URL?.replace(/\/$/, "") ||
    "http://localhost:4001"
  )
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState<SocketStatus>("connecting")
  const [reconnecting, setReconnecting] = useState<boolean>(false)

  useEffect(() => {
    const instance = io(realtimeUrl(), {
      withCredentials: true,
      transports: ["websocket", "pooling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
    })

    //callback functions for socket events
    const onConnect = () => {
      setSocket(instance)
      setStatus("connected")
      setReconnecting(false)
    }

    const onDisconnect = () => {
      setStatus("disconnected")
      setReconnecting(true)
    }

    const onConnectError = (err: Error) => {
      console.error("[socket] connect_error:", err.message)
      setStatus("disconnected")
      setReconnecting(true)
    }

    //attach listeners to socket instance
    instance.on("connect", onConnect)
    instance.on("disconnect", onDisconnect)
    instance.on("connect_error", onConnectError)

    return () => {
      instance.off("connect", onConnect)
      instance.off("disconnect", onDisconnect)
      instance.off("connect_error", onConnectError)
      instance.disconnect()
    }
  }, [])

  const value: SocketContextValue = { socket, status, reconnecting }

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider")
  }
  return ctx
}
