import React, { useState } from 'react';
import { StyleSheet, Switch, Pressable } from 'react-native';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';

export default function SettingsScreen() {
  // 設定の状態管理
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">設定</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>通知設定</ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingTextContainer}>
            <ThemedText style={styles.settingText}>通知</ThemedText>
            <ThemedText style={styles.settingDescription}>
              アプリからの通知を受け取ります
            </ThemedText>
          </ThemedView>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </ThemedView>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingTextContainer}>
            <ThemedText style={styles.settingText}>毎日のリマインダー</ThemedText>
            <ThemedText style={styles.settingDescription}>
              朝のルーティン開始時間に通知します
            </ThemedText>
          </ThemedView>
          <Switch
            value={dailyReminder}
            onValueChange={setDailyReminder}
            disabled={!notificationsEnabled}
          />
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>アプリ設定</ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingTextContainer}>
            <ThemedText style={styles.settingText}>ダークモード</ThemedText>
            <ThemedText style={styles.settingDescription}>
              アプリの表示をダークモードに切り替えます
            </ThemedText>
          </ThemedView>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </ThemedView>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingTextContainer}>
            <ThemedText style={styles.settingText}>サウンド</ThemedText>
            <ThemedText style={styles.settingDescription}>
              アプリ内の効果音を有効にします
            </ThemedText>
          </ThemedView>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>アプリについて</ThemedText>
        
        <Pressable>
          <ThemedView style={styles.linkItem}>
            <ThemedText style={styles.settingText}>プライバシーポリシー</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#888888" />
          </ThemedView>
        </Pressable>
        
        <Pressable>
          <ThemedView style={styles.linkItem}>
            <ThemedText style={styles.settingText}>利用規約</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#888888" />
          </ThemedView>
        </Pressable>
        
        <Pressable>
          <ThemedView style={styles.linkItem}>
            <ThemedText style={styles.settingText}>アプリバージョン</ThemedText>
            <ThemedText style={styles.versionText}>1.0.0</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  versionText: {
    fontSize: 14,
    color: '#888888',
  },
}); 