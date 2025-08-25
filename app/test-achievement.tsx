import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { HapticButton } from '@/components/common/HapticButton';
import { projectColors } from '@/constants/Colors';
import { 
  seedTestAchievement, 
  seed49Achievement, 
  resetAchievementStatus, 
  clearAllViewedQuotes 
} from '@/db/seeds/index';
import { resetAppData, checkAppDataStatus } from '@/utils/resetApp';
import { getQuoteProgress } from '@/utils/achievement';
import { useActiveUserIdSimple } from '@/hooks/useActiveUser';

export default function TestAchievementScreen() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{
    viewedCount: number;
    progressPercentage: number;
    isAchieved: boolean;
  } | null>(null);
  
  const activeUserId = useActiveUserIdSimple();

  const handleTestFunction = async (
    testFunction: () => Promise<void | boolean>, 
    testName: string
  ) => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log(`[TEST] ${testName} を実行中...`);
      await testFunction();
      Alert.alert('成功', `${testName} が正常に完了しました！`);
      await checkProgress(); // 進捗を更新
    } catch (error) {
      console.error(`[TEST] ${testName} エラー:`, error);
      Alert.alert('エラー', `${testName} に失敗しました: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkProgress = async () => {
    if (!activeUserId || activeUserId === 'user1') {
      setProgress(null);
      return;
    }
    
    try {
      const currentProgress = await getQuoteProgress(activeUserId);
      setProgress(currentProgress);
    } catch (error) {
      console.error('[TEST] 進捗確認エラー:', error);
    }
  };

  React.useEffect(() => {
    checkProgress();
  }, [activeUserId]);

  if (!activeUserId || activeUserId === 'user1') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          ユーザーが初期化されていません。{'\n'}
          先にアプリを起動してユーザーを作成してください。
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>
          🎉 50件達成テスト画面
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          現在のユーザーID: {activeUserId}
        </ThemedText>

        {/* 現在の進捗表示 */}
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressTitle}>現在の進捗</ThemedText>
          {progress ? (
            <>
              <ThemedText style={styles.progressText}>
                表示済み名言数: {progress.viewedCount} / 50
              </ThemedText>
              <ThemedText style={styles.progressText}>
                進捗率: {progress.progressPercentage.toFixed(1)}%
              </ThemedText>
              <ThemedText style={[
                styles.achievementStatus,
                { color: progress.isAchieved ? projectColors.primary : projectColors.black2 }
              ]}>
                達成状況: {progress.isAchieved ? '✅ 達成済み' : '⏳ 未達成'}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={styles.progressText}>
              進捗を読み込み中...
            </ThemedText>
          )}
        </View>

        {/* テストボタン群 */}
        <View style={styles.buttonGroup}>
          <HapticButton
            style={[styles.testButton, styles.primaryButton]}
            onPress={() => handleTestFunction(seed49Achievement, '49件データ作成')}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              49件データ作成{'\n'}
              (次の1件で祝福画面)
            </ThemedText>
          </HapticButton>

          <HapticButton
            style={[styles.testButton, styles.secondaryButton]}
            onPress={() => handleTestFunction(seedTestAchievement, '50件データ作成')}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              50件データ作成{'\n'}
              (即座に達成済み)
            </ThemedText>
          </HapticButton>

          <HapticButton
            style={[styles.testButton, styles.warningButton]}
            onPress={() => handleTestFunction(resetAchievementStatus, '達成状態リセット')}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              達成状態リセット{'\n'}
              (再テスト可能)
            </ThemedText>
          </HapticButton>

          <HapticButton
            style={[styles.testButton, styles.dangerButton]}
            onPress={() => handleTestFunction(clearAllViewedQuotes, '全記録クリア')}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              全記録クリア{'\n'}
              (表示記録のみ)
            </ThemedText>
          </HapticButton>

          <HapticButton
            style={[styles.testButton, styles.criticalButton]}
            onPress={() => handleTestFunction(resetAppData, 'アプリ完全リセット')}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              🔥 完全リセット{'\n'}
              (全データ削除)
            </ThemedText>
          </HapticButton>
        </View>

        {/* 使用方法説明 */}
        <View style={styles.instructionContainer}>
          <ThemedText style={styles.instructionTitle}>📋 使用方法</ThemedText>
          <ThemedText style={styles.instructionText}>
            1. 「49件データ作成」をタップ{'\n'}
            2. ホーム画面に戻って名言を表示{'\n'}
            3. 50件目で祝福画面が表示される！{'\n'}
            {'\n'}
            ※ 再テスト時は「達成状態リセット」をお忘れなく
          </ThemedText>
        </View>

        {/* 進捗更新ボタン */}
        <HapticButton
          style={[styles.testButton, styles.refreshButton]}
          onPress={checkProgress}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            🔄 進捗を更新
          </ThemedText>
        </HapticButton>

        {loading && (
          <ThemedText style={styles.loadingText}>
            処理中...
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: projectColors.white1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_400Regular',
    color: projectColors.black2,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: projectColors.red1,
    textAlign: 'center',
    padding: 20,
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: projectColors.black1,
    marginBottom: 5,
  },
  achievementStatus: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_700Bold',
    marginTop: 5,
  },
  buttonGroup: {
    gap: 15,
    marginBottom: 30,
  },
  testButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  primaryButton: {
    backgroundColor: projectColors.primary,
  },
  secondaryButton: {
    backgroundColor: '#4ECDC4',
  },
  warningButton: {
    backgroundColor: '#FFB74D',
  },
  dangerButton: {
    backgroundColor: '#F06292',
  },
  criticalButton: {
    backgroundColor: '#D32F2F',
  },
  refreshButton: {
    backgroundColor: '#90A4AE',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: '#fff',
    textAlign: 'center',
  },
  instructionContainer: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(68, 138, 255, 0.3)',
  },
  instructionTitle: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_400Regular',
    color: projectColors.black1,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: projectColors.primary,
    textAlign: 'center',
    marginTop: 20,
  },
});
