import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, Pressable, Alert, ScrollView, View, Platform, Linking, Clipboard } from 'react-native';
import Constants from 'expo-constants';
import { useRouter, Link } from 'expo-router';
import * as MailComposer from 'expo-mail-composer';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { db } from '@/db';
import { projectColors } from '@/constants/Colors';
import { getAllUsers, updateUser } from '@/db/utils/users';
import { useNotifications } from '@/hooks/useNotifications';

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
  
  // アプリのバージョン情報を取得
  const appVersion = Constants.expoConfig?.version || '不明';
  
  // コンポーネントマウント時に開発環境かどうかを判定
  useEffect(() => {
    setIsDevEnv(isDevelopment());
  }, []);
  
  // その他の設定の状態管理
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [routineStartTime, setRoutineStartTime] = useState('07:00');
  const [nightNotifyTime, setNightNotifyTime] = useState('23:00');
  const [showMorningTimePicker, setShowMorningTimePicker] = useState(false);
  const [showNightTimePicker, setShowNightTimePicker] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [morningNotificationsEnabled, setMorningNotificationsEnabled] = useState(false);
  const [nightNotificationsEnabled, setNightNotificationsEnabled] = useState(false);
  
  // 通知機能のカスタムフックを使用
  const { 
    permission, 
    requestPermissions, 
    scheduleRoutineNotification, 
    scheduleNightNotification,
    cancelRoutineNotifications,
    cancelNightNotifications
  } = useNotifications();

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const users = await getAllUsers();
        if (users.length > 0) {
          setUserId(users[0].id);
          if (users[0].routineStartTime) {
            setRoutineStartTime(users[0].routineStartTime);
          }
          if (users[0].nightNotifyTime) {
            setNightNotifyTime(users[0].nightNotifyTime);
          }
        }
      } catch (error) {
        console.error('ユーザー設定の取得に失敗しました:', error);
      }
    };

    fetchUserSettings();
  }, []);

  // 通知の権限状態を確認
  useEffect(() => {
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      setMorningNotificationsEnabled(true);
      setNightNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
      setMorningNotificationsEnabled(false);
      setNightNotificationsEnabled(false);
    }
  }, [permission]);

  // 通知設定の変更に応じてピッカーの表示状態を制御
  useEffect(() => {
    // 朝の通知がオフになったらピッカーを閉じる
    if (!morningNotificationsEnabled) {
      setShowMorningTimePicker(false);
    }
  }, [morningNotificationsEnabled]);

  useEffect(() => {
    // 夜の通知がオフになったらピッカーを閉じる
    if (!nightNotificationsEnabled) {
      setShowNightTimePicker(false);
    }
  }, [nightNotificationsEnabled]);

  // ルーティン開始時間を変更
  const handleMorningTimeChange = async (event: any, selectedDate?: Date) => {
    // Androidではイベントキャンセル時にはselectedDateがnullになる
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowMorningTimePicker(false);
      return;
    }
    
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      setRoutineStartTime(timeString);
      
      // データベースに保存
      if (userId) {
        try {
          await updateUser(userId, { routineStartTime: timeString });
          console.log('ルーティン開始時間を更新しました:', timeString);
          
          // 通知が有効な場合は通知をスケジュール（設定時刻になったときのみ通知）
          if (morningNotificationsEnabled) {
            await scheduleRoutineNotification(
              timeString,
              'おはようございます✨',
              '今日も、Hugmiといっしょにルーティンを始めましょう',
              false, // 即時実行しない（設定時刻になったときのみ通知）
              true   // 設定画面からの変更は既存の通知を強制的に置き換える
            );
          }
        } catch (error) {
          console.error('ルーティン開始時間の更新に失敗しました:', error);
        }
      }
      
      // iOSではピッカーは手動で閉じる (Androidでは自動的に閉じる)
      if (Platform.OS === 'android') {
        setShowMorningTimePicker(false);
      }
    }
  };
  
  // 夜の通知時間を変更
  const handleNightTimeChange = async (event: any, selectedDate?: Date) => {
    // Androidではイベントキャンセル時にはselectedDateがnullになる
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowNightTimePicker(false);
      return;
    }
    
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      setNightNotifyTime(timeString);
      
      // データベースに保存
      if (userId) {
        try {
          await updateUser(userId, { nightNotifyTime: timeString });
          console.log('夜の通知時間を更新しました:', timeString);
          
          // 夜の通知をスケジュール
          if (nightNotificationsEnabled) {
            await scheduleNightNotification(
              timeString,
              'おやすみ前のお知らせ🌙',
              '明日のルーティン、Hugmiでそっと準備しておきましょう',
              true  // 設定画面からの変更は既存の通知を強制的に置き換える
            );
          }
        } catch (error) {
          console.error('夜の通知時間の更新に失敗しました:', error);
        }
      }
      
      // iOSではピッカーは手動で閉じる (Androidでは自動的に閉じる)
      if (Platform.OS === 'android') {
        setShowNightTimePicker(false);
      }
    }
  };

  // 通知の有効/無効を切り替え
  const toggleNotifications = async (value: boolean) => {
    if (value) {
      // 通知を有効にする
      const status = await requestPermissions();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        setMorningNotificationsEnabled(true);
        setNightNotificationsEnabled(true);
        
        // 朝の通知をスケジュール（設定時刻になったときのみ通知）
        await scheduleRoutineNotification(
          routineStartTime,
          'おはようございます✨',
          '今日も、Hugmiといっしょにルーティンを始めましょう',
          false, // 即時実行しない（設定時刻になったときのみ通知）
          true   // 設定画面からの変更は既存の通知を強制的に置き換える
        );
        
        // 夜の通知をスケジュール
        await scheduleNightNotification(
          nightNotifyTime,
          'おやすみ前のお知らせ🌙',
          '明日のルーティン、Hugmiでそっと準備しておきましょう',
          true  // 設定画面からの変更は既存の通知を強制的に置き換える
        );
      } else {
        Alert.alert(
          '通知が許可されていません',
          'アプリの通知を有効にするには、デバイスの設定から許可してください。',
          [{ text: 'OK' }]
        );
      }
    } else {
      // 通知を無効にする
      setNotificationsEnabled(false);
      setMorningNotificationsEnabled(false);
      setNightNotificationsEnabled(false);
      // 通知設定をオフにしたらピッカーも閉じる
      setShowMorningTimePicker(false);
      setShowNightTimePicker(false);
      await cancelRoutineNotifications();
      await cancelNightNotifications();
    }
  };
  
  // 朝の通知の有効/無効を切り替え
  const toggleMorningNotifications = async (value: boolean) => {
    if (!notificationsEnabled && value) {
      // 通知がオフの状態で朝の通知をオンにしようとした場合
      const status = await requestPermissions();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        setMorningNotificationsEnabled(true);
        
        // 朝の通知をスケジュール（設定時刻になったときのみ通知）
        await scheduleRoutineNotification(
          routineStartTime,
          'おはようございます✨',
          '今日も、Hugmiといっしょにルーティンを始めましょう',
          false, // 即時実行しない（設定時刻になったときのみ通知）
          true   // 設定画面からの変更は既存の通知を強制的に置き換える
        );
      } else {
        Alert.alert(
          '通知が許可されていません',
          'アプリの通知を有効にするには、デバイスの設定から許可してください。',
          [{ text: 'OK' }]
        );
        return;
      }
    } else if (notificationsEnabled) {
      setMorningNotificationsEnabled(value);
      
      if (!value) {
        // 朝の通知をオフにしたらピッカーを閉じる
        setShowMorningTimePicker(false);
        // 朝の通知をキャンセル
        await cancelRoutineNotifications();
      } else {
        // 朝の通知をスケジュール（設定時刻になったときのみ通知）
        await scheduleRoutineNotification(
          routineStartTime,
          'おはようございます✨',
          '今日も、Hugmiといっしょにルーティンを始めましょう',
          false, // 即時実行しない（設定時刻になったときのみ通知）
          true   // 設定画面からの変更は既存の通知を強制的に置き換える
        );
      }
    }
  };
  
  // 夜の通知の有効/無効を切り替え
  const toggleNightNotifications = async (value: boolean) => {
    if (!notificationsEnabled && value) {
      // 通知がオフの状態で夜の通知をオンにしようとした場合
      const status = await requestPermissions();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        setNightNotificationsEnabled(true);
        
        // 夜の通知をスケジュール
        await scheduleNightNotification(
          nightNotifyTime,
          'おやすみ前のお知らせ🌙',
          '明日のルーティン、Hugmiでそっと準備しておきましょう',
          true  // 設定画面からの変更は既存の通知を強制的に置き換える
        );
      } else {
        Alert.alert(
          '通知が許可されていません',
          'アプリの通知を有効にするには、デバイスの設定から許可してください。',
          [{ text: 'OK' }]
        );
        return;
      }
    } else if (notificationsEnabled) {
      setNightNotificationsEnabled(value);
      
      if (!value) {
        // 夜の通知をオフにしたらピッカーを閉じる
        setShowNightTimePicker(false);
        // 夜の通知をキャンセル
        await cancelNightNotifications();
      } else {
        // 夜の通知をスケジュール
        await scheduleNightNotification(
          nightNotifyTime,
          'おやすみ前のお知らせ🌙',
          '明日のルーティン、Hugmiでそっと準備しておきましょう',
          true  // 設定画面からの変更は既存の通知を強制的に置き換える
        );
      }
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
          
          {/* 通知設定（全体） */}
          <ThemedView style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingText}>通知</ThemedText>
              <ThemedText style={styles.settingDescription}>
                アプリからの通知を受け取ります
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#767577", true: projectColors.secondary }}
              thumbColor={notificationsEnabled ? projectColors.softOrange : "#f4f3f4"}
            />
          </ThemedView>
          
          {/* 朝の通知設定 */}
          <ThemedView style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingText}>朝の通知</ThemedText>
              <ThemedText style={styles.settingDescription}>
                朝のルーティン開始を通知します
              </ThemedText>
            </View>
            <Switch
              value={morningNotificationsEnabled}
              onValueChange={toggleMorningNotifications}
              trackColor={{ false: "#767577", true: projectColors.secondary }}
              thumbColor={morningNotificationsEnabled ? projectColors.softOrange : "#f4f3f4"}
            />
          </ThemedView>
          
          {/* 朝の通知時間設定 - 通知がオンの場合のみ表示 */}
          {morningNotificationsEnabled && (
            <>
              <Pressable onPress={() => setShowMorningTimePicker(!showMorningTimePicker)}>
                <ThemedView style={styles.timeSettingItem}>
                  <ThemedText style={styles.timeSettingLabel}>通知時刻: {routineStartTime}</ThemedText>
                  <IconSymbol name={showMorningTimePicker ? "chevron.up" : "chevron.down"} size={16} color="#888888" />
                </ThemedView>
              </Pressable>
              
              {/* 朝の時間ピッカー（iOS用） */}
              {showMorningTimePicker && (
                <View style={styles.timePickerContainer}>
                  <DateTimePicker
                    value={(() => {
                      const [hours, minutes] = routineStartTime.split(':').map(Number);
                      const date = new Date();
                      date.setHours(hours, minutes, 0, 0);
                      return date;
                    })()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleMorningTimeChange}
                    style={styles.timePicker}
                    textColor={projectColors.black1}
                    themeVariant="light"
                    accentColor={projectColors.primary}
                  />
                </View>
              )}
            </>
          )}
          
          {/* 夜の通知設定 */}
          <ThemedView style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingText}>夜の通知</ThemedText>
              <ThemedText style={styles.settingDescription}>
                おやすみ前に明日のルーティンを通知します
              </ThemedText>
            </View>
            <Switch
              value={nightNotificationsEnabled}
              onValueChange={toggleNightNotifications}
              trackColor={{ false: "#767577", true: projectColors.secondary }}
              thumbColor={nightNotificationsEnabled ? projectColors.softOrange : "#f4f3f4"}
            />
          </ThemedView>
          
          {/* 夜の通知時間設定 - 通知がオンの場合のみ表示 */}
          {nightNotificationsEnabled && (
            <>
              <Pressable onPress={() => setShowNightTimePicker(!showNightTimePicker)}>
                <ThemedView style={styles.timeSettingItem}>
                  <ThemedText style={styles.timeSettingLabel}>通知時刻: {nightNotifyTime}</ThemedText>
                  <IconSymbol name={showNightTimePicker ? "chevron.up" : "chevron.down"} size={16} color="#888888" />
                </ThemedView>
              </Pressable>
              
              {/* 夜の時間ピッカー（iOS用） */}
              {showNightTimePicker && (
                <View style={styles.timePickerContainer}>
                  <DateTimePicker
                    value={(() => {
                      const [hours, minutes] = nightNotifyTime.split(':').map(Number);
                      const date = new Date();
                      date.setHours(hours, minutes, 0, 0);
                      return date;
                    })()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleNightTimeChange}
                    style={styles.timePicker}
                    textColor={projectColors.black1}
                    themeVariant="light"
                    accentColor={projectColors.primary}
                  />
                </View>
              )}
            </>
          )}
        </ThemedView>
        
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
          
          <Pressable onPress={handleContact}>
            <ThemedView style={styles.linkItem}>
              <ThemedText style={styles.settingText}>お問い合わせ</ThemedText>
              <IconSymbol name="chevron.right" size={16} color="#888888" />
            </ThemedView>
          </Pressable>
          
          <Pressable>
            <ThemedView style={styles.linkItem}>
              <ThemedText style={styles.settingText}>アプリバージョン</ThemedText>
              <ThemedText style={styles.versionText}>{appVersion}</ThemedText>
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
    marginTop: 36,
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
  timeSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: projectColors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  timeSettingLabel: {
    fontSize: 14,
    color: projectColors.black1,
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  timePicker: {
    width: Platform.OS === 'ios' ? '85%' : '100%',
    height: Platform.OS === 'ios' ? 70 : undefined, // さらに高さを小さく
    ...(Platform.OS === 'ios' ? { transform: [{ scale: 0.85 }] } : {}),
  },
  doneButton: {
    backgroundColor: projectColors.primary,
    borderRadius: 8,
    padding: 8,
    elevation: 2,
    marginTop: 0,
    marginBottom: 5,
    width: '80%',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
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