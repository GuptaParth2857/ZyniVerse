import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import AnimeDetailScreen from '../screens/AnimeDetailScreen';
import FillerGuideScreen from '../screens/FillerGuideScreen';
import MangaScreen from '../screens/MangaScreen';
import ForumScreen from '../screens/ForumScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AnimeDetail"
        component={AnimeDetailScreen}
        options={{ title: '', headerTransparent: true }}
      />
      <Stack.Screen
        name="FillerGuide"
        component={FillerGuideScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <Stack.Screen
        name="MangaDetail"
        component={MangaScreen}
        options={{ title: 'Manga Detail' }}
      />
      <Stack.Screen
        name="ThreadDetail"
        component={ForumScreen}
        options={{ title: 'Thread' }}
      />
      <Stack.Screen
        name="ForumCategory"
        component={ForumScreen}
        options={({ route }) => ({ title: route.params.slug })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Recommendations"
        component={RecommendationsScreen}
        options={{ title: 'Recommendations' }}
      />
    </Stack.Navigator>
  );
}
