import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/common/HapticTab';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { colors, projectColors } from '@/constants/Colors';
import { fonts } from '@/constants/fonts';
import { useColorScheme } from '@/hooks/useColorScheme';

// タブ画面全体に適用されるスタイルを定義
const TabLayoutStyle = () => (
  <View style={styles.backgroundFill} />
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      {/* 全画面背景をレイアウトの下に配置 */}
      <TabLayoutStyle />
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: projectColors.accent,
          tabBarInactiveTintColor: projectColors.black1,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarLabelStyle: {
            fontFamily: fonts.families.primary,
            fontSize: 12,
            fontWeight: '500',
            paddingBottom: 3,
          },
          tabBarStyle: {
            height: 75,
            paddingBottom: 15,
            paddingTop: 10,
            backgroundColor: projectColors.white1,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'ホーム',
            tabBarIcon: ({ color }) => <IconSymbol size={30} name="house.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="routine"
          options={{
            title: 'ルーティン',
            tabBarIcon: ({ color }) => <IconSymbol size={30} name="list.star" color={color} />,
          }}
        />
        <Tabs.Screen
          name="quotes"
          options={{
            title: '名言',
            tabBarIcon: ({ color }) => <IconSymbol size={30} name="sparkles" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '設定',
            tabBarIcon: ({ color }) => <IconSymbol size={30} name="slider.horizontal.3" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: projectColors.white1,
    zIndex: -1,
  }
});
