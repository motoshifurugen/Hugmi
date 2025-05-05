import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, Pressable, Alert, ScrollView } from 'react-native';
import Constants from 'expo-constants';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { db } from '@/db';
import { projectColors } from '@/constants/Colors';

// 開発環境かどうかを判定（複数の方法を試す）
const isDevelopment = () => {
  // 複数の方法を試して開発環境かどうかを判定
  // 1. NODE_ENVを確認
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // 2. Constantsを使った方法を試す
  try {
    // releaseChannelがundefinedまたは空の場合は開発環境
    const releaseChannel = Constants.expoConfig?.extra?.releaseChannel as string | undefined;
    if (!releaseChannel || releaseChannel === 'default') {
      return true;
    }
    
    // dev、development、testなどの場合も開発環境
    if (['dev', 'development', 'test'].includes(releaseChannel)) {
      return true;
    }
  } catch (e) {
    console.log('Constantsチェック中のエラー:', e);
  }
  
  // 3. 開発用のビルドとして常に表示する（TODO: 本番リリース前に削除）
  return true; // 開発中は常にtrueを返す
};

export default function SettingsScreen() {
  // 開発環境かどうかの状態
  const [isDevEnv, setIsDevEnv] = useState(false);
  
  // コンポーネントマウント時に開発環境かどうかを判定
  useEffect(() => {
    setIsDevEnv(isDevelopment());
  }, []);
  
  // 設定の状態管理
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // データベースをクリアする関数
  const clearDatabase = async () => {
    try {
      const sqliteDb = db.getDatabase();
      
      // 既存のテーブルのデータを削除
      const tables = ['viewed_quotes', 'favorite_quotes', 'mood_logs', 'routine_logs', 'routines', 'quotes', 'users'];
      for (const table of tables) {
        try {
          console.log(`[DEBUG] ${table}テーブルのデータを削除中...`);
          await sqliteDb.execAsync(`DELETE FROM ${table}`);
        } catch (dropError) {
          console.error(`[DEBUG] ${table}テーブルの削除に失敗:`, dropError);
        }
      }
      console.log('[DEBUG] データベースのクリアが完了しました');
      
      Alert.alert(
        'データベースのクリア完了',
        'データベースがクリアされました。アプリを再起動してください。',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('データベースクリア中にエラーが発生しました:', error);
      Alert.alert(
        'エラー',
        'データベースのクリアに失敗しました。',
        [{ text: 'OK' }]
      );
    }
  };

  // データベースクリアの確認ダイアログを表示
  const confirmDatabaseClear = () => {
    Alert.alert(
      'データベースをクリア',
      'データベース内のすべてのデータが削除されます。この操作は元に戻せません。続行しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除する', style: 'destructive', onPress: clearDatabase }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          
          {/* 開発環境の場合のみ表示するデータ削除ボタン */}
          {isDevEnv && (
            <Pressable onPress={confirmDatabaseClear}>
              <ThemedView style={[styles.linkItem, styles.dangerItem]}>
                <ThemedText style={styles.dangerText}>データベースをクリア（開発用）</ThemedText>
                <IconSymbol name="trash" size={16} color={projectColors.red1} />
              </ThemedView>
            </Pressable>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50, // 下部に余白を追加
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
  dangerItem: {
    marginTop: 20,
    borderBottomColor: projectColors.red1,
  },
  dangerText: {
    fontSize: 16,
    color: projectColors.red1,
  },
}); 