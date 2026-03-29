import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ErrorState } from '../../components/ui/ErrorState'
import { Header } from '../../components/ui/Header'
import { Skeleton } from '../../components/ui/Skeleton'
import { Toast } from '../../components/ui/Toast'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { bleService } from '../../services/ble.service'

type ChatRoomRecord = {
  id: string
  owner_id: string
  device_id: string
  is_active: boolean
  devices:
    | {
        make: string
        model: string
        imei_primary: string
      }
    | {
        make: string
        model: string
        imei_primary: string
      }[]
    | null
}

type ChatMessage = {
  id: string
  room_id: string
  sender_role: 'owner' | 'finder' | 'system'
  message_text?: string | null
  content?: string | null
  is_read: boolean
  sent_at: string
  message_type?: 'text' | 'location'
  latitude?: number | null
  longitude?: number | null
}

function normalizeDevice(
  device: ChatRoomRecord['devices']
): { make: string; model: string; imei_primary: string } | null {
  if (!device) {
    return null
  }

  if (Array.isArray(device)) {
    return device[0] ?? null
  }

  return device
}

function formatStamp(dateIso: string) {
  const date = new Date(dateIso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function parseLocationMessage(text: string): { lat: number; lng: number } | null {
  const match = text.match(/📍 Shared location: ([-\d.]+), ([-\d.]+)/)
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  return null
}

function openMapsUrl(lat: number, lng: number) {
  const url = Platform.select({
    ios: `maps:0,0?q=${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(Shared+Location)`,
  }) ?? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  
  Linking.openURL(url).catch(() => {
    // Fallback to Google Maps web
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)
  })
}

export default function ChatRoomScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ roomId: string }>()
  const roomId = params.roomId

  const [room, setRoom] = useState<ChatRoomRecord | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showMarkFoundModal, setShowMarkFoundModal] = useState(false)
  const [sharingLocation, setSharingLocation] = useState(false)
  const [markingFound, setMarkingFound] = useState(false)

  const scrollRef = useRef<ScrollView | null>(null)

  const role = useMemo<'owner' | 'finder'>(() => {
    if (room?.owner_id && user?.id === room.owner_id) {
      return 'owner'
    }

    return 'finder'
  }, [room?.owner_id, user?.id])

  const markIncomingAsRead = useCallback(
    async (nextRole: 'owner' | 'finder') => {
      if (!roomId) {
        return
      }

      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .eq('is_read', false)
        .neq('sender_role', nextRole)
    },
    [roomId]
  )

  const fetchRoomAndMessages = useCallback(async () => {
    if (!roomId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First try loading room with device join
      let roomData: ChatRoomRecord | null = null
      const { data: roomWithDevice, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id, owner_id, device_id, is_active, devices(make, model, imei_primary)')
        .eq('id', roomId)
        .maybeSingle()

      if (roomError) {
        console.log('[SPORS-CHAT] Room query error:', roomError.message)
        // Try without the device join as fallback
        const { data: roomBasic, error: roomBasicError } = await supabase
          .from('chat_rooms')
          .select('id, owner_id, device_id, is_active')
          .eq('id', roomId)
          .maybeSingle()

        if (roomBasicError || !roomBasic) {
          throw new Error(roomBasicError?.message ?? 'Chat room not found.')
        }

        roomData = { ...roomBasic, devices: null } as ChatRoomRecord
      } else {
        roomData = roomWithDevice as ChatRoomRecord | null
      }

      if (!roomData) {
        throw new Error('This chat room no longer exists.')
      }

      // Load messages - use 'content' column which matches the schema
      let normalizedMessages: ChatMessage[] = []
      const { data: msgData, error: msgError } = await supabase
        .from('chat_messages')
        .select('id, room_id, sender_role, content, is_read, sent_at')
        .eq('room_id', roomId)
        .order('sent_at', { ascending: true })

      if (!msgError && msgData) {
        normalizedMessages = (msgData as ChatMessage[]).map((message) => ({
          ...message,
          message_text: message.content ?? '',
        }))
      } else if (msgError) {
        console.log('[SPORS-CHAT] Messages query error:', msgError.message)
      }

      setRoom(roomData)
      setMessages(normalizedMessages)

      const resolvedRole = user?.id === roomData.owner_id ? 'owner' : 'finder'
      await markIncomingAsRead(resolvedRole)
    } catch (nextError) {
      console.log('[SPORS-CHAT] Fetch error:', nextError)
      setError(nextError instanceof Error ? nextError.message : 'Unable to load this room.')
    } finally {
      setLoading(false)
    }
  }, [markIncomingAsRead, roomId, user?.id])

  useEffect(() => {
    void fetchRoomAndMessages()
  }, [fetchRoomAndMessages])

  useEffect(() => {
    if (!roomId) {
      return
    }

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage
          const normalizedIncoming = {
            ...incoming,
            message_text: incoming.content ?? '',
          }

          setMessages((current) => {
            if (current.some((msg) => msg.id === normalizedIncoming.id)) {
              return current
            }
            return [...current, normalizedIncoming]
          })

          if (normalizedIncoming.sender_role !== role) {
            void markIncomingAsRead(role)
          }

          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true })
          }, 30)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [markIncomingAsRead, role, roomId])

  // Polling fallback - fetches new messages every 5 seconds
  useEffect(() => {
    if (!roomId || !room?.is_active) {
      return
    }

    const pollMessages = async () => {
      try {
        const { data: msgData } = await supabase
          .from('chat_messages')
          .select('id, room_id, sender_role, content, is_read, sent_at')
          .eq('room_id', roomId)
          .order('sent_at', { ascending: true })

        if (msgData) {
          const normalized = msgData.map((msg) => ({
            ...msg,
            message_text: msg.content ?? '',
          }))
          
          setMessages((current) => {
            // Only update if there are new messages
            if (normalized.length !== current.length) {
              return normalized as ChatMessage[]
            }
            // Check if last message is different
            const lastNew = normalized[normalized.length - 1]
            const lastCurrent = current[current.length - 1]
            if (lastNew?.id !== lastCurrent?.id) {
              return normalized as ChatMessage[]
            }
            return current
          })
        }
      } catch {
        // Silent fail for polling
      }
    }

    const interval = setInterval(pollMessages, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [roomId, room?.is_active])

  const sendMessage = useCallback(async () => {
    const text = messageText.trim()
    if (!roomId || !text || sending || !room?.is_active) {
      return
    }

    setSending(true)
    try {
      // Use 'content' column which matches the schema
      const insertResponse = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_role: role,
        content: text,
        is_read: false,
      })

      if (insertResponse.error) {
        throw insertResponse.error
      }

      setMessageText('')
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true })
      }, 30)
    } catch (nextError) {
      setToast({
        message: nextError instanceof Error ? nextError.message : 'Unable to send message.',
        type: 'error',
      })
    } finally {
      setSending(false)
    }
  }, [messageText, role, room?.is_active, roomId, sending])

  const shareLocation = useCallback(async () => {
    if (!room?.device_id) {
      return
    }

    setSharingLocation(true)
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        throw new Error('Location permission denied')
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      
      const { latitude, longitude } = location.coords
      
      // Report to BLE service (updates device location)
      await bleService.reportLocationForDevice(room.device_id, null)
      
      // Send location message in chat
      const locationMessage = `📍 Shared location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_role: role,
        content: locationMessage,
        is_read: false,
      })
      
      setShowLocationModal(false)
      setToast({ message: 'Location shared in chat.', type: 'success' })
    } catch (nextError) {
      setToast({
        message: nextError instanceof Error ? nextError.message : 'Unable to share location.',
        type: 'error',
      })
    } finally {
      setSharingLocation(false)
    }
  }, [room?.device_id, roomId, role])

  const closeRecovery = useCallback(async () => {
    if (!room?.device_id || !roomId) {
      return
    }

    setMarkingFound(true)
    try {
      // Send system message before closing chat
      const closingMessage = role === 'owner' 
        ? '🎉 Device owner has marked this device as found. Chat ended.'
        : '🎉 Finder has confirmed device recovery. Chat ended.'
      
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_role: 'system',
        content: closingMessage,
        is_read: false,
      })

      const { error: deviceError } = await supabase
        .from('devices')
        .update({
          status: 'recovered',
          is_ble_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', room.device_id)

      if (deviceError) {
        throw deviceError
      }

      const { error: roomError } = await supabase
        .from('chat_rooms')
        .update({ is_active: false })
        .eq('id', roomId)

      if (roomError) {
        throw roomError
      }

      await supabase
        .from('lost_reports')
        .update({ is_active: false })
        .eq('device_id', room.device_id)
        .eq('is_active', true)

      // Stop broadcasting mode so scanner works again
      await bleService.stopBroadcasting()

      setRoom((current) => (current ? { ...current, is_active: false } : current))
      setShowMarkFoundModal(false)
      setToast({ message: 'Marked as found and chat closed.', type: 'success' })
      
      // Navigate back after a short delay to let user see the toast
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (nextError) {
      setToast({
        message: nextError instanceof Error ? nextError.message : 'Unable to close recovery flow.',
        type: 'error',
      })
    } finally {
      setMarkingFound(false)
    }
  }, [room?.device_id, roomId, router, role])

  const device = normalizeDevice(room?.devices ?? null)

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Secure Chat" onBackPress={() => router.back()} rightIcon="verified-user" />

      <Toast
        visible={!!toast}
        message={toast?.message ?? ''}
        type={toast?.type ?? 'info'}
        onHide={() => setToast(null)}
      />

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.metaBar}>
          {loading ? (
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="52%" height={12} borderRadius={8} />
              <Skeleton width="30%" height={10} borderRadius={8} />
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.deviceTitle}>{`${device?.make ?? 'Unknown'} ${device?.model ?? 'Device'}`}</Text>
                <Text style={styles.deviceMeta}>{`IMEI •••• ${device?.imei_primary?.slice(-4) ?? '----'}`}</Text>
              </View>

              <View style={[styles.statusPill, !room?.is_active && styles.statusPillClosed]}>
                <Text style={[styles.statusPillText, !room?.is_active && styles.statusPillTextClosed]}>
                  {room?.is_active ? 'Active' : 'Closed'}
                </Text>
              </View>
            </>
          )}
        </View>

        {error ? <ErrorState message={error} onRetry={() => void fetchRoomAndMessages()} /> : null}

        {!error ? (
          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {!room?.is_active ? (
              <View style={styles.systemMessageWrap}>
                <Text style={styles.systemMessageText}>This room has been closed after recovery.</Text>
              </View>
            ) : null}

            {messages.map((message) => {
              if (message.sender_role === 'system') {
                return (
                  <View key={message.id} style={styles.systemMessageWrap}>
                    <Text style={styles.systemMessageText}>{message.message_text}</Text>
                  </View>
                )
              }

              const mine = message.sender_role === role
              const locationData = parseLocationMessage(message.message_text ?? '')
              
              if (locationData) {
                // Location message with map link
                return (
                  <View key={message.id} style={[styles.messageWrap, mine ? styles.messageMineWrap : styles.messageOtherWrap]}>
                    <View style={[styles.messageBubble, styles.locationBubble, mine ? styles.messageMine : styles.messageOther]}>
                      <View style={styles.locationHeader}>
                        <MaterialIcons name="location-on" size={20} color={mine ? Colors.onPrimary : Colors.primary} />
                        <Text style={[styles.messageText, mine ? styles.messageTextMine : styles.messageTextOther]}>
                          Location Shared
                        </Text>
                      </View>
                      <Text style={[styles.locationCoords, mine ? styles.messageTextMine : styles.messageTextOther]}>
                        {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
                      </Text>
                      <Pressable 
                        style={[styles.viewMapButton, mine && styles.viewMapButtonMine]}
                        onPress={() => openMapsUrl(locationData.lat, locationData.lng)}
                      >
                        <MaterialIcons name="map" size={16} color={mine ? Colors.primary : Colors.onPrimary} />
                        <Text style={[styles.viewMapText, mine && styles.viewMapTextMine]}>View on Map</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.messageTime}>{formatStamp(message.sent_at)}</Text>
                  </View>
                )
              }
              
              return (
                <View key={message.id} style={[styles.messageWrap, mine ? styles.messageMineWrap : styles.messageOtherWrap]}>
                  <View style={[styles.messageBubble, mine ? styles.messageMine : styles.messageOther]}>
                    <Text style={[styles.messageText, mine ? styles.messageTextMine : styles.messageTextOther]}>
                      {message.message_text}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>{formatStamp(message.sent_at)}</Text>
                </View>
              )
            })}

            {!messages.length && !loading ? (
              <View style={styles.systemMessageWrap}>
                <Text style={styles.systemMessageText}>No messages yet. Start with a quick hello.</Text>
              </View>
            ) : null}
          </ScrollView>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={() => setShowLocationModal(true)}>
            <MaterialIcons name="my-location" size={16} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Share Location</Text>
          </Pressable>

          <Pressable style={styles.actionButtonDanger} onPress={() => setShowMarkFoundModal(true)}>
            <MaterialIcons name="check-circle" size={16} color={Colors.secondary} />
            <Text style={styles.actionButtonDangerText}>Mark Found</Text>
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder={room?.is_active ? 'Type your message...' : 'Room is closed'}
            placeholderTextColor={Colors.outline}
            style={styles.input}
            editable={!!room?.is_active && !sending}
            multiline
            maxLength={500}
          />

          <Pressable
            style={[styles.sendButton, (!messageText.trim() || !room?.is_active || sending) && styles.sendButtonDisabled]}
            onPress={() => void sendMessage()}
            disabled={!messageText.trim() || !room?.is_active || sending}
          >
            <MaterialIcons name="send" size={18} color={Colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Share Location Confirmation Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <MaterialIcons name="my-location" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Share Your Location?</Text>
            <Text style={styles.modalDescription}>
              Your current location will be shared with the device owner to help them recover their device.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowLocationModal(false)}
                disabled={sharingLocation}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalConfirmButton, sharingLocation && styles.modalButtonDisabled]}
                onPress={() => void shareLocation()}
                disabled={sharingLocation}
              >
                <MaterialIcons name="share-location" size={18} color={Colors.onPrimary} />
                <Text style={styles.modalConfirmText}>
                  {sharingLocation ? 'Sharing...' : 'Share Location'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mark Found Confirmation Modal */}
      <Modal
        visible={showMarkFoundModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMarkFoundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconWrap, styles.modalIconSuccess]}>
              <MaterialIcons name="check-circle" size={32} color={Colors.secondary} />
            </View>
            <Text style={styles.modalTitle}>Mark Device as Found?</Text>
            <Text style={styles.modalDescription}>
              This will mark the device as recovered and close this chat. This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowMarkFoundModal(false)}
                disabled={markingFound}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSuccessButton, markingFound && styles.modalButtonDisabled]}
                onPress={() => void closeRecovery()}
                disabled={markingFound}
              >
                <MaterialIcons name="check" size={18} color={Colors.background} />
                <Text style={styles.modalSuccessText}>
                  {markingFound ? 'Processing...' : 'Mark Found'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardWrap: {
    flex: 1,
  },
  metaBar: {
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  deviceTitle: {
    color: Colors.onSurface,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 14,
  },
  deviceMeta: {
    marginTop: 2,
    color: Colors.outline,
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
  },
  statusPill: {
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(70,241,187,0.18)',
  },
  statusPillClosed: {
    backgroundColor: 'rgba(255,78,78,0.18)',
  },
  statusPillText: {
    color: Colors.secondary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
  },
  statusPillTextClosed: {
    color: Colors.error,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  messageWrap: {
    gap: 2,
  },
  messageMineWrap: {
    alignItems: 'flex-end',
  },
  messageOtherWrap: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageMine: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 5,
  },
  messageOther: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 19,
  },
  messageTextMine: {
    color: Colors.onPrimary,
  },
  messageTextOther: {
    color: Colors.onSurface,
  },
  messageTime: {
    color: Colors.outline,
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
  },
  locationBubble: {
    paddingVertical: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationCoords: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 10,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  viewMapButtonMine: {
    backgroundColor: Colors.onPrimary,
  },
  viewMapText: {
    color: Colors.onPrimary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
  },
  viewMapTextMine: {
    color: Colors.primary,
  },
  systemMessageWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  systemMessageText: {
    color: Colors.outline,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionRow: {
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionButtonText: {
    color: Colors.onSurface,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
  },
  actionButtonDanger: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(70,241,187,0.36)',
    backgroundColor: 'rgba(70,241,187,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionButtonDangerText: {
    color: Colors.secondary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
  },
  inputRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    color: Colors.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,122,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconSuccess: {
    backgroundColor: 'rgba(70,241,187,0.15)',
  },
  modalTitle: {
    color: Colors.onSurface,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    color: Colors.outline,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: Colors.onSurface,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
  },
  modalConfirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalConfirmText: {
    color: Colors.onPrimary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
  },
  modalSuccessButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalSuccessText: {
    color: Colors.background,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
})
