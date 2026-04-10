import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Colors } from '../lib/colors'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

type ChatRoom = {
  id: string
  owner_id: string
  device_id: string
  is_active: boolean
  devices: {
    make: string
    model: string
    imei_primary: string
  } | null
}

type ChatMessage = {
  id: string
  room_id: string
  sender_role: 'owner' | 'finder' | 'system'
  content: string | null
  is_read: boolean
  sent_at: string
}

export function ChatRoomPage() {
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: string }>()
  const { user } = useAuth()
  
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const role = user?.id === room?.owner_id ? 'owner' : 'finder'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markAsRead = useCallback(async () => {
    if (!roomId || !role) return
    
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_role', role)
  }, [roomId, role])

  const fetchRoomAndMessages = useCallback(async () => {
    if (!roomId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id, owner_id, device_id, is_active, devices(make, model, imei_primary)')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError
      setRoom(roomData as ChatRoom)

      // Fetch messages
      const { data: msgData, error: msgError } = await supabase
        .from('chat_messages')
        .select('id, room_id, sender_role, content, is_read, sent_at')
        .eq('room_id', roomId)
        .order('sent_at', { ascending: true })

      if (msgError) throw msgError
      setMessages(msgData as ChatMessage[])
      
      await markAsRead()
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat')
    } finally {
      setLoading(false)
    }
  }, [roomId, markAsRead])

  useEffect(() => {
    fetchRoomAndMessages()
  }, [fetchRoomAndMessages])

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!roomId || !room?.is_active) return

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev
            setTimeout(scrollToBottom, 100)
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, room?.is_active])

  const sendMessage = async () => {
    const text = messageText.trim()
    if (!roomId || !text || sending || !room?.is_active) return

    setSending(true)
    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_role: role,
        content: text,
        is_read: false,
      })

      if (error) throw error
      setMessageText('')
      
      // Optimistic update
      const newMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        room_id: roomId,
        sender_role: role,
        content: text,
        is_read: false,
        sent_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMsg])
      setTimeout(scrollToBottom, 50)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const markAsFound = async () => {
    if (!room?.device_id) return

    const confirmed = window.confirm(
      'Mark this device as found? This will close the chat for both parties.'
    )
    if (!confirmed) return

    try {
      // Send system message
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_role: 'system',
        content: role === 'owner' 
          ? '✅ Device owner has marked this device as found. Chat closed.'
          : '✅ Finder has confirmed device recovery. Chat closed.',
        is_read: false,
      })

      // Close the chat room
      await supabase
        .from('chat_rooms')
        .update({ is_active: false })
        .eq('id', roomId)

      // Update device status
      await supabase
        .from('devices')
        .update({ status: 'recovered' })
        .eq('id', room.device_id)

      navigate('/chat')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as found')
    }
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 48px)',
    maxWidth: '900px',
    margin: '0 auto',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: `1px solid ${Colors.outlineVariant}`,
    backgroundColor: Colors.surfaceContainerLow,
  }

  const backButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: Colors.onSurfaceVariant,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '0px',
  }

  const messagesContainerStyle: CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }

  const messageBubbleStyle = (isOwn: boolean, isSystem: boolean): CSSProperties => ({
    maxWidth: isSystem ? '100%' : '70%',
    padding: isSystem ? '12px 16px' : '10px 16px',
    borderRadius: isSystem ? '8px' : isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    backgroundColor: isSystem 
      ? Colors.surfaceContainerHigh 
      : isOwn 
        ? Colors.primary 
        : Colors.surfaceContainerHighest,
    color: isSystem 
      ? Colors.onSurfaceVariant 
      : isOwn 
        ? Colors.onPrimary 
        : Colors.onSurface,
    alignSelf: isSystem ? 'center' : isOwn ? 'flex-end' : 'flex-start',
    textAlign: isSystem ? 'center' : 'left',
    fontSize: isSystem ? '13px' : '15px',
    fontStyle: isSystem ? 'italic' : 'normal',
  })

  const inputContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${Colors.outlineVariant}`,
    backgroundColor: Colors.surfaceContainerLow,
  }

  const inputStyle: CSSProperties = {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: Colors.surfaceContainerHigh,
    border: `1px solid ${Colors.outlineVariant}`,
    borderRadius: '0px',
    color: Colors.onSurface,
    fontSize: '14px',
    outline: 'none',
  }

  const timeStyle: CSSProperties = {
    fontSize: '11px',
    color: Colors.outline,
    marginTop: '4px',
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: Colors.onSurfaceVariant }}>
          Loading chat...
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div style={containerStyle}>
        <Card style={{ margin: '32px', textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: '48px', color: Colors.error, marginBottom: '16px' }}>
            error
          </span>
          <h2 style={{ color: Colors.onSurface, marginBottom: '8px' }}>Chat Not Found</h2>
          <p style={{ color: Colors.onSurfaceVariant, marginBottom: '20px' }}>{error}</p>
          <Button onClick={() => navigate('/chat')}>Back to Chats</Button>
        </Card>
      </div>
    )
  }

  const device = room.devices

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <button style={backButtonStyle} onClick={() => navigate('/chat')}>
          <span className="material-icons">arrow_back</span>
        </button>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ color: Colors.onSurface, fontSize: '18px', fontWeight: 600 }}>
            {device?.make} {device?.model}
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: Colors.onSurfaceVariant }}>
              IMEI ···· {device?.imei_primary?.slice(-4) || '----'}
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: room.is_active ? `${Colors.secondary}20` : `${Colors.error}20`,
                color: room.is_active ? Colors.secondary : Colors.error,
              }}
            >
              {room.is_active ? 'Active' : 'Closed'}
            </span>
          </div>
        </div>

        {room.is_active && (
          <Button variant="secondary" size="small" onClick={markAsFound}>
            <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
            Mark Found
          </Button>
        )}
      </header>

      <div style={messagesContainerStyle}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: Colors.onSurfaceVariant, padding: '40px' }}>
            <span className="material-icons" style={{ fontSize: '48px', color: Colors.outline, marginBottom: '12px' }}>
              chat_bubble_outline
            </span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender_role === 'system' 
                  ? 'center' 
                  : msg.sender_role === role 
                    ? 'flex-end' 
                    : 'flex-start',
              }}
            >
              <div style={messageBubbleStyle(msg.sender_role === role, msg.sender_role === 'system')}>
                {msg.content}
              </div>
              {msg.sender_role !== 'system' && (
                <span style={timeStyle}>
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {room.is_active ? (
        <div style={inputContainerStyle}>
          <input
            type="text"
            style={inputStyle}
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            disabled={sending}
          />
          <Button onClick={sendMessage} loading={sending} disabled={!messageText.trim()}>
            <span className="material-icons" style={{ fontSize: '20px' }}>send</span>
          </Button>
        </div>
      ) : (
        <div style={{ ...inputContainerStyle, justifyContent: 'center' }}>
          <p style={{ color: Colors.onSurfaceVariant, fontSize: '14px' }}>
            This chat has been closed.
          </p>
        </div>
      )}
    </div>
  )
}
