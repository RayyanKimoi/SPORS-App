import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Tabs } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { BlurView } from 'expo-blur'

import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'

type TabIconProps = {
  focused: boolean
  active: keyof typeof MaterialIcons.glyphMap
  inactive: keyof typeof MaterialIcons.glyphMap
}

function TabIcon({ focused, active, inactive }: TabIconProps) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <MaterialIcons
        name={focused ? active : inactive}
        size={22}
        color={focused ? Colors.accent : Colors.outline}
      />
    </View>
  )
}

function TabBarBackground() {
  return (
    <View style={styles.tabBackgroundWrap}>
      <BlurView intensity={36} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBackgroundOverlay} />
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.outline,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <TabBarBackground />,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: {
          fontFamily: FontFamily.bodyMedium,
          fontSize: 10,
          marginTop: 0,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} active="home" inactive="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Devices',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} active="smartphone" inactive="smartphone" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} active="forum" inactive="chat-bubble-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} active="notifications" inactive="notifications-none" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} active="person" inactive="person-outline" />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 92,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 12,
    elevation: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -24 },
    shadowOpacity: 0.4,
    shadowRadius: 48,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  iconPill: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: 'rgba(61,142,255,0.1)',
  },
  tabBackgroundWrap: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  tabBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,19,24,0.6)',
  },
})