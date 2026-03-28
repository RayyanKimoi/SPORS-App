import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { GradientButton } from '../../components/ui/GradientButton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Toast } from '../../components/ui/Toast'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { isValidIMEI, registerDevice, useDevices } from '../../hooks/useDevices'
import { useAuth } from '../../hooks/useAuth'

type FormState = {
  make: string
  model: string
  imei_primary: string
  serial_number: string
  color: string
}

const initialForm: FormState = {
  make: '',
  model: '',
  imei_primary: '',
  serial_number: '',
  color: '',
}

export default function DevicesScreen() {
  const router = useRouter()
  const { profile } = useAuth()
  const { devices, loading, error, refetch } = useDevices()

  const [sheetVisible, setSheetVisible] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [sheetError, setSheetError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  )

  const initials = useMemo(() => {
    const name = profile?.full_name?.trim() || 'SPORS User'
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }, [profile?.full_name])

  const onCloseSheet = () => {
    setSheetVisible(false)
    setForm(initialForm)
    setSheetError(null)
  }

  const onSubmit = async () => {
    if (!form.make.trim() || !form.model.trim() || !form.serial_number.trim()) {
      setSheetError('Make, Model and Serial Number are required.')
      return
    }

    if (!isValidIMEI(form.imei_primary)) {
      setSheetError('Primary IMEI must be valid (15 digits).')
      return
    }

    setSubmitting(true)
    setSheetError(null)

    try {
      await registerDevice({
        make: form.make,
        model: form.model,
        imei_primary: form.imei_primary,
        serial_number: form.serial_number,
        color: form.color || null,
      })

      onCloseSheet()
      await refetch()
      setToast({ message: 'Device registered successfully', type: 'success' })
    } catch (submitError) {
      setSheetError(submitError instanceof Error ? submitError.message : 'Unable to register device.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        visible={!!toast}
        message={toast?.message ?? ''}
        type={toast?.type ?? 'info'}
        onHide={() => setToast(null)}
      />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialIcons name="shield" size={22} color={Colors.accent} />
          <Text style={styles.brandText}>SPORS</Text>
        </View>

        <Pressable style={styles.avatarCircle} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>
      </View>

      <View style={styles.topBar}>
        <Text style={styles.title}>My Devices</Text>
        <View style={styles.topBarButtonWrap}>
          <GradientButton title="+ Register Device" onPress={() => setSheetVisible(true)} />
        </View>
      </View>

      {loading ? (
        <View style={styles.skeletonWrap}>
          <Skeleton height={78} borderRadius={16} />
          <Skeleton height={78} borderRadius={16} />
          <Skeleton height={78} borderRadius={16} />
        </View>
      ) : null}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor={Colors.primary} refreshing={loading} onRefresh={() => void refetch()} />}
        renderItem={({ item }) => {
          const safe = item.status === 'registered' || item.status === 'recovered'
          return (
            <Pressable
              style={styles.rowCard}
              onPress={() => router.push({ pathname: '/device/[id]', params: { id: item.id } })}
            >
              <View style={styles.rowIconWrap}>
                <MaterialIcons name="smartphone" size={22} color={Colors.primary} />
              </View>

              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>{`${item.make} ${item.model}`}</Text>
                <Text style={styles.rowImei}>{item.imei_primary}</Text>
              </View>

              <View style={styles.rowRight}>
                <View style={[styles.badge, { backgroundColor: safe ? `${Colors.secondary}22` : `${Colors.error}22` }]}>
                  <Text style={[styles.badgeText, { color: safe ? Colors.secondary : Colors.error }]}>
                    {safe ? 'SAFE' : 'LOST'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
              </View>
            </Pressable>
          )
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No devices registered yet.</Text>
            </View>
          ) : null
        }
      />

      {!loading && error ? <ErrorState message={error} onRetry={() => void refetch()} /> : null}

      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={onCloseSheet}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Register Device</Text>

            <TextInput
              value={form.make}
              onChangeText={(value) => setForm((current) => ({ ...current, make: value }))}
              style={styles.input}
              placeholder="Make"
              placeholderTextColor={Colors.outline}
            />
            <TextInput
              value={form.model}
              onChangeText={(value) => setForm((current) => ({ ...current, model: value }))}
              style={styles.input}
              placeholder="Model"
              placeholderTextColor={Colors.outline}
            />
            <TextInput
              value={form.imei_primary}
              onChangeText={(value) =>
                setForm((current) => ({ ...current, imei_primary: value.replace(/\D/g, '').slice(0, 15) }))
              }
              style={styles.input}
              keyboardType="number-pad"
              placeholder="Primary IMEI (15 digits)"
              placeholderTextColor={Colors.outline}
            />
            <TextInput
              value={form.serial_number}
              onChangeText={(value) => setForm((current) => ({ ...current, serial_number: value }))}
              style={styles.input}
              placeholder="Serial Number"
              placeholderTextColor={Colors.outline}
            />
            <TextInput
              value={form.color}
              onChangeText={(value) => setForm((current) => ({ ...current, color: value }))}
              style={styles.input}
              placeholder="Color (optional)"
              placeholderTextColor={Colors.outline}
            />

            {sheetError ? <Text style={styles.errorText}>{sheetError}</Text> : null}

            <GradientButton title="Register Device" onPress={() => void onSubmit()} loading={submitting} />
            <Pressable onPress={onCloseSheet}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
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
  header: {
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: Colors.accent,
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  topBarButtonWrap: {
    minWidth: 170,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: FontFamily.headingBold,
    fontSize: 24,
  },
  skeletonWrap: {
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    paddingTop: 8,
    gap: 14,
  },
  rowCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    color: Colors.onSurface,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
  },
  rowImei: {
    color: Colors.onSurfaceVariant,
    fontFamily: FontFamily.monoMedium,
    fontSize: 11,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.7,
  },
  emptyWrap: {
    marginTop: 24,
    borderRadius: 16,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  emptyText: {
    color: Colors.onSurfaceVariant,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.surfaceContainerLow,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    borderRadius: 5,
    alignSelf: 'center',
    backgroundColor: Colors.outlineVariant,
  },
  sheetTitle: {
    color: Colors.onSurface,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 20,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    color: Colors.onSurface,
    paddingHorizontal: 14,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
  },
  cancelText: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
  },
})