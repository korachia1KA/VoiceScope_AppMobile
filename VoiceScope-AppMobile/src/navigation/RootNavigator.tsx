// src/navigation/RootNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AudioLines,
  ChartNoAxesCombined,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { colors, typography } from '../theme';

// Screens
import AnalysisScreen from '../screens/AnalysisScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import OverviewScreen from '../screens/OverviewScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Tabs: undefined;
  SessionDetail: { id: string };
};

export type TabParamList = {
  Overview: undefined;
  Profiles: undefined;
  Analysis: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary[600],
  },
};

const TAB_ICONS: Record<keyof TabParamList, LucideIcon> = {
  Overview: LayoutDashboard,
  Profiles: Users,
  Analysis: AudioLines,
  Analytics: ChartNoAxesCombined,
  Settings: Settings,
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          marginTop: 4,
        },
        tabBarIcon: ({ color, size }) => {
          const IconComp = TAB_ICONS[route.name];
          return <IconComp size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Profiles" component={ProfilesScreen} options={{ title: 'Profils' }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ title: 'Analyser' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Réglages' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { ...typography.h3, color: colors.textPrimary },
          headerTintColor: colors.primary[600],
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SessionDetail"
          component={SessionDetailScreen}
          options={{ title: 'Détail de séance', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}