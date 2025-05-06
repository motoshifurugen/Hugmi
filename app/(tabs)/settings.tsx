import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, Pressable, Alert, ScrollView, View, Platform, Linking, Clipboard } from 'react-native';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, Link } from 'expo-router';
import * as MailComposer from 'expo-mail-composer';

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
  const router = useRouter();
  
  // 開発環境かどうかの状態
  const [isDevEnv, setIsDevEnv] = useState(false);
  
  // コンポーネントマウント時に開発環境かどうかを判定
  useEffect(() => {
    setIsDevEnv(isDevelopment());
  }, []);
  
  // 設定の状態管理
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [morningNotification, setMorningNotification] = useState(true);
  const [eveningNotification, setEveningNotification] = useState(true);
  const [morningTime, setMorningTime] = useState(new Date(new Date().setHours(7, 0, 0, 0)));
  const [eveningTime, setEveningTime] = useState(new Date(new Date().setHours(23, 0, 0, 0)));
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // 時間ピッカーの状態
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  // 時間フォーマット
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 時間変更ハンドラー
  const onMorningTimeChange = (event: any, selectedDate?: Date) => {
    // Androidの場合は選択後にピッカーを閉じる
    if (Platform.OS === 'android') {
      setShowMorningPicker(false);
    }
    if (selectedDate) {
      setMorningTime(selectedDate);
    }
  };

  const onEveningTimeChange = (event: any, selectedDate?: Date) => {
    // Androidの場合は選択後にピッカーを閉じる
    if (Platform.OS === 'android') {
      setShowEveningPicker(false);
    }
    if (selectedDate) {
      setEveningTime(selectedDate);
    }
  };

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

  // 各種画面への遷移
  const navigateToPrivacyPolicy = () => {
    router.push('/settings/privacy-policy');
  };

  // お問い合わせ処理
  const handleContact = async () => {
    const contactEmail = 'furugenmotoshig@gmail.com';
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [contactEmail],
          subject: '【Hugmi】お問い合わせ',
          body: '',
        });
      } else {
        // メールアプリが利用できない場合は代替手段を提供
        Alert.alert(
          'メールアプリが見つかりません',
          `メールアプリが設定されていないか、利用できません。以下のアドレスに直接お問い合わせください:\n${contactEmail}`,
          [
            { 
              text: 'メールアドレスをコピー', 
              onPress: () => {
                Clipboard.setString(contactEmail);
                Alert.alert('コピーしました', 'メールアドレスをクリップボードにコピーしました。');
              }
            },
            { text: 'キャンセル', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('メール送信エラー:', error);
      Alert.alert(
        'エラー',
        `メールの送信準備中にエラーが発生しました。直接 ${contactEmail} にお問い合わせください。`
      );
    }
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
              trackColor={{ false: '#e0e0e0', true: projectColors.secondary }}
              thumbColor={notificationsEnabled ? projectColors.softOrange : '#f4f3f4'}
            />
          </ThemedView>
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingTextContainer}>
              <ThemedText style={styles.settingText}>朝の通知</ThemedText>
              <ThemedText style={styles.settingDescription}>
                朝のルーティン開始時間に通知します
              </ThemedText>
            </ThemedView>
            <Switch
              value={morningNotification}
              onValueChange={setMorningNotification}
              trackColor={{ false: '#e0e0e0', true: projectColors.secondary }}
              thumbColor={morningNotification ? projectColors.softOrange : '#f4f3f4'}
              disabled={!notificationsEnabled}
            />
          </ThemedView>
          
          {morningNotification && notificationsEnabled && (
            <>
              <Pressable 
                onPress={() => setShowMorningPicker(!showMorningPicker)}
                style={[styles.timeSelector, showMorningPicker ? styles.timeSelectorActive : null]}
              >
                <ThemedText style={styles.timeText}>通知時刻: {formatTime(morningTime)}</ThemedText>
                <IconSymbol name={showMorningPicker ? "chevron.up" : "chevron.down"} size={16} color="#888888" />
              </Pressable>
              
              {showMorningPicker && (
                <ThemedView style={styles.inlinePicker}>
                  <DateTimePicker
                    value={morningTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? "spinner" : "default"}
                    onChange={onMorningTimeChange}
                    locale="ja-JP"
                    style={styles.picker}
                  />
                </ThemedView>
              )}
            </>
          )}
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingTextContainer}>
              <ThemedText style={styles.settingText}>夜の通知</ThemedText>
              <ThemedText style={styles.settingDescription}>
                おやすみ前に明日のルーティンを通知します
              </ThemedText>
            </ThemedView>
            <Switch
              value={eveningNotification}
              onValueChange={setEveningNotification}
              trackColor={{ false: '#e0e0e0', true: projectColors.secondary }}
              thumbColor={eveningNotification ? projectColors.softOrange : '#f4f3f4'}
              disabled={!notificationsEnabled}
            />
          </ThemedView>
          
          {eveningNotification && notificationsEnabled && (
            <>
              <Pressable 
                onPress={() => setShowEveningPicker(!showEveningPicker)}
                style={[styles.timeSelector, showEveningPicker ? styles.timeSelectorActive : null]}
              >
                <ThemedText style={styles.timeText}>通知時刻: {formatTime(eveningTime)}</ThemedText>
                <IconSymbol name={showEveningPicker ? "chevron.up" : "chevron.down"} size={16} color="#888888" />
              </Pressable>
              
              {showEveningPicker && (
                <ThemedView style={styles.inlinePicker}>
                  <DateTimePicker
                    value={eveningTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? "spinner" : "default"}
                    onChange={onEveningTimeChange}
                    locale="ja-JP"
                    style={styles.picker}
                  />
                </ThemedView>
              )}
            </>
          )}
        </ThemedView>
        
        {/* <ThemedView style={styles.sectionContainer}>
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
              trackColor={{ false: '#e0e0e0', true: projectColors.secondary }}
              thumbColor={darkMode ? projectColors.softOrange : '#f4f3f4'}
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
              trackColor={{ false: '#e0e0e0', true: projectColors.secondary }}
              thumbColor={soundEnabled ? projectColors.softOrange : '#f4f3f4'}
            />
          </ThemedView>
        </ThemedView> */}
        
        <ThemedView style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>アプリについて</ThemedText>
          
          <Link href="/settings/privacy-policy" asChild>
            <Pressable>
              <ThemedView style={styles.linkItem}>
                <ThemedText style={styles.settingText}>プライバシーポリシー</ThemedText>
                <IconSymbol name="chevron.right" size={16} color="#888888" />
              </ThemedView>
            </Pressable>
          </Link>
          
          {/* <Pressable>
            <ThemedView style={styles.linkItem}>
              <ThemedText style={styles.settingText}>利用規約</ThemedText>
              <IconSymbol name="chevron.right" size={16} color="#888888" />
            </ThemedView>
          </Pressable> */}
          
          <Pressable onPress={handleContact}>
            <ThemedView style={styles.linkItem}>
              <ThemedText style={styles.settingText}>お問い合わせ</ThemedText>
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

      {/* Android のピッカー（Androidの場合だけ必要） */}
      {Platform.OS === 'android' && showMorningPicker && (
        <DateTimePicker
          value={morningTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onMorningTimeChange}
        />
      )}

      {Platform.OS === 'android' && showEveningPicker && (
        <DateTimePicker
          value={eveningTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onEveningTimeChange}
        />
      )}
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
    marginTop: 40,
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
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: projectColors.secondary,
    borderRadius: 8,
    marginBottom: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  timeSelectorActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  timeText: {
    fontSize: 14,
    color: '#555555',
  },
  inlinePicker: {
    backgroundColor: 'white',
    paddingVertical: 8,
    marginBottom: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: projectColors.secondary,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  picker: {
    width: '100%',
    ...(Platform.OS === 'ios' ? { height: 120 } : {}),
  },
}); 