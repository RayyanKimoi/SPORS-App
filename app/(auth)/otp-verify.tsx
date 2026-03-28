import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { GradientButton } from '../../components/ui/GradientButton'
import { useAuth } from '../../hooks/useAuth'

const OTP_LENGTH = 6

export default function OtpVerifyScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()
  const email = params.email ?? ''
  const { resendOtp, verifyOtp } = useAuth()

  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''))
  const [timer, setTimer] = useState(60)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const inputRefs = useRef<Array<TextInput | null>>([])

  useEffect(() => {
    if (timer <= 0) {
      return
    }

    const interval = setInterval(() => {
      setTimer((current) => current - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  const token = useMemo(() => digits.join(''), [digits])

  const updateDigit = (index: number, value: string) => {
    const normalized = value.replace(/[^0-9]/g, '').slice(-1)

    setDigits((current) => {
      const next = [...current]
      next[index] = normalized
      return next
    })

    if (normalized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (normalized && index === OTP_LENGTH - 1) {
      Keyboard.dismiss()
    }
  }

  const onBackspace = (index: number, key: string) => {
    if (key !== 'Backspace') {
      return
    }

    if (!digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const onResend = async () => {
    if (!email || timer > 0) {
      return
    }

    setErrorMessage('')
    const { error } = await resendOtp(email)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setDigits(Array.from({ length: OTP_LENGTH }, () => ''))
    inputRefs.current[0]?.focus()
    setTimer(60)
  }

  const onVerify = async () => {
    if (!email) {
      setErrorMessage('Missing email. Please return to sign up.')
      return
    }

    if (token.length !== OTP_LENGTH) {
      setErrorMessage('Enter the 6-digit code.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    const { error } = await verifyOtp(email, token)

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to your email</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.otpRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref
              }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => updateDigit(index, value)}
              onKeyPress={({ nativeEvent }) => onBackspace(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.primary}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <View style={styles.timerRow}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend Code in {timer}s</Text>
          ) : (
            <Pressable onPress={onResend}>
              <Text style={styles.resendText}>Resend Code</Text>
            </Pressable>
          )}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <GradientButton
          title="Verify"
          loading={loading}
          onPress={onVerify}
          disabled={token.length !== OTP_LENGTH || loading}
          style={styles.verifyButton}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  keyboardWrap: {
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    marginTop: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  title: {
    marginTop: 18,
    color: Colors.onSurface,
    fontFamily: FontFamily.headingBold,
    fontSize: 30,
  },
  subtitle: {
    marginTop: 8,
    color: Colors.onSurfaceVariant,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 18,
  },
  email: {
    marginTop: 6,
    color: Colors.primary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 16,
  },
  otpRow: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    color: Colors.onSurface,
    fontFamily: FontFamily.monoMedium,
    fontSize: 22,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  timerRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    color: Colors.onSurfaceVariant,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
  },
  resendText: {
    color: Colors.primary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 15,
  },
  errorText: {
    marginTop: 14,
    color: Colors.error,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: 26,
  },
})