import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { isDue, StoreProvider, useStore } from './src/store';
import { colors, fonts } from './src/theme';
import { Body, Button, IconBadge, IconName, Screen } from './src/ui';
import HomeScreen from './src/screens/HomeScreen';
import DisciplineScreen, { TrainScreen } from './src/screens/DisciplineScreen';
import { LearnScreen, LessonScreen, PalacesScreen } from './src/screens/LearnScreens';
import { MedicineScreen, MnemonicScreen } from './src/screens/MedicineScreens';
import { ProgressScreen, SettingsScreen } from './src/screens/ProgressScreens';
import SessionScreen from './src/screens/session/SessionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, [IconName, IconName]> = {
  Home: ['home', 'home-outline'],
  Learn: ['school', 'school-outline'],
  Train: ['trophy', 'trophy-outline'],
  Medicine: ['medkit', 'medkit-outline'],
  Progress: ['stats-chart', 'stats-chart-outline'],
};

function Tabs() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const dueCount = state.mnemonics.filter(isDue).length;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
          borderTopColor: colors.borderSoft,
          height: 70 + insets.bottom,
          paddingTop: 6,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 15 },
        tabBarIcon: ({ focused, color }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={22} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Train" component={TrainScreen} />
      <Tab.Screen
        name="Medicine"
        component={MedicineScreen}
        options={{
          tabBarBadge: dueCount > 0 ? dueCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.gold, color: colors.bg, fontSize: 10, fontWeight: '800' },
        }}
      />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

const SLIDES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'sparkles',
    title: 'A great memory is a skill',
    body: 'Memory champions have normal brains. They use simple picture tricks that anyone can learn — and this app teaches them step by step.',
  },
  {
    icon: 'trophy',
    title: 'Train like the champions',
    body: 'Practise all ten events of the World Memory Championships: numbers, cards, names, words, dates and more. Start small, at your own speed.',
  },
  {
    icon: 'medkit',
    title: 'Made for heavy study too',
    body: 'Studying medicine? Type any topic and get a mnemonic, a story and a key to every image — ready to review.',
  },
];

function Onboarding() {
  const { update } = useStore();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <LinearGradient colors={['#1B160B', colors.bg, colors.bg]} style={{ flex: 1 }}>
      <Screen scroll={false} edges={['top', 'bottom']} contentStyle={{ justifyContent: 'space-between', paddingVertical: 24 }}>
        <Text style={{ color: colors.gold, letterSpacing: 4, fontWeight: '800', fontSize: 12, marginTop: 8 }}>
          MEMORYMASTER
        </Text>
        <View>
          <IconBadge name={slide.icon} size={72} />
          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.serif,
              fontSize: 36,
              lineHeight: 43,
              fontWeight: '600',
              marginTop: 28,
            }}
          >
            {slide.title}
          </Text>
          <Body style={{ marginTop: 14, fontSize: 17, lineHeight: 27 }}>{slide.body}</Body>
        </View>
        <View>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 22 }}>
            {SLIDES.map((_, k) => (
              <View
                key={k}
                style={{
                  width: k === i ? 26 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: k === i ? colors.gold : colors.surface2,
                }}
              />
            ))}
          </View>
          <Button
            label={last ? 'Start training' : 'Next'}
            icon={last ? 'play' : 'arrow-forward'}
            onPress={() => (last ? update({ onboarded: true }) : setI(i + 1))}
          />
        </View>
      </Screen>
    </LinearGradient>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgSoft,
    border: colors.borderSoft,
    primary: colors.gold,
    text: colors.text,
  },
};

function Root() {
  const { ready, state } = useStore();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (!state.onboarded) return <Onboarding />;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="Palaces" component={PalacesScreen} />
        <Stack.Screen name="Discipline" component={DisciplineScreen} />
        <Stack.Screen name="Session" component={SessionScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Mnemonic" component={MnemonicScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
