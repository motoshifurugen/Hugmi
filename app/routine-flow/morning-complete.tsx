import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions, View, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { fonts } from '@/constants/fonts';
import { projectColors } from '@/constants/Colors';
import { getAllUsers } from '@/db/utils/users';
import { getRoutineLogsByDate } from '@/db/utils/routine_logs';
import { getActiveRoutinesByUserId } from '@/db/utils/routines';

// ルーティンアイテムの型定義
interface RoutineItem {
  id: string;
  title: string;
  status: 'checked' | 'skipped' | 'unchecked';
  dotAnim: Animated.Value;
}

// パーティクルの型定義
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

export default function MorningCompleteScreen() {
  // アニメーション値の初期化
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const routineListAnim = useRef(new Animated.Value(0)).current;
  const tapTextAnim = useRef(new Animated.Value(0)).current;
  
  // アクティブなアニメーション参照を保持するref
  const activeAnimations = useRef<Animated.Value[]>([]);
  
  // パーティクル用のステート
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [username, setUsername] = useState('');
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const animationsStarted = useRef(false);

  // コンポーネントのマウント状態を管理
  useEffect(() => {
    console.log('[DEBUG] MorningCompleteScreen コンポーネントがマウントされました');
    isMounted.current = true;
    animationsStarted.current = false;
    
    // 初期アニメーション参照を設定
    activeAnimations.current = [fadeAnim, routineListAnim, tapTextAnim];
    
    // パーティクルを生成
    generateParticles();
    
    return () => {
      console.log('[DEBUG] MorningCompleteScreen コンポーネントがアンマウントされました');
      isMounted.current = false;
      
      // アニメーションを停止
      try {
        activeAnimations.current.forEach(anim => {
          if (anim) anim.stopAnimation();
        });
        console.log('[DEBUG] アニメーション停止完了');
      } catch (error) {
        console.error('アニメーション停止エラー:', error);
      }
    };
  }, []);

  // パーティクルを生成する関数
  const generateParticles = useCallback(() => {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const newParticles: Particle[] = [];
    
    // 15個のパーティクルを生成
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * windowWidth,
        y: Math.random() * windowHeight,
        size: 5 + Math.random() * 15,
        opacity: new Animated.Value(0),
        rotation: new Animated.Value(0)
      });
    }
    
    setParticles(newParticles);
  }, []);

  // パーティクルのアニメーションを開始
  const animateParticles = useCallback(() => {
    particles.forEach((particle, index) => {
      // アクティブなアニメーション参照に追加
      activeAnimations.current.push(particle.opacity);
      activeAnimations.current.push(particle.rotation);
      
      // フェードインとフェードアウトのアニメーション
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.timing(particle.opacity, {
          toValue: 0.3 + Math.random() * 0.4,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true
        })
      ]).start();
      
      // 回転アニメーション
      Animated.timing(particle.rotation, {
        toValue: 1,
        duration: 3000 + Math.random() * 2000,
        useNativeDriver: true
      }).start();
    });
  }, [particles]);

  // ユーザー名とルーティンデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ユーザーを取得（アプリでは1人のみという前提）
        const users = await getAllUsers();
        if (users.length > 0) {
          if (isMounted.current) {
            setUsername(users[0].name);
            // ユーザーのルーティンログを取得
            await fetchRoutineData(users[0].id);
          }
        } else {
          if (isMounted.current) {
            setUsername('ゲスト');
          }
        }
      } catch (error) {
        console.error('ユーザーデータの取得に失敗しました:', error);
        if (isMounted.current) {
          setUsername('ゲスト');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, []);
  
  // ユーザーの全ルーティンとその状態を取得
  const fetchRoutineData = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      // すべてのアクティブなルーティンを取得
      const allRoutines = await getActiveRoutinesByUserId(userId);
      // 今日のルーティンログを取得
      const todayLogs = await getRoutineLogsByDate(userId, today);
      
      // Array.mapを使用してルーティンアイテムを生成
      const routineItems: RoutineItem[] = allRoutines.map(routine => {
        // 対応するログを検索
        const log = todayLogs.find(log => log.routineId === routine.id);
        
        // ルーティンのステータスを決定
        const status = log ? log.status : 'unchecked';
        
        return {
          id: routine.id,
          title: routine.title,
          status: status,
          dotAnim: new Animated.Value(0), // ドットアニメーション用の値
        };
      });
      
      // 完了したものを上部に表示するようにソート
      routineItems.sort((a, b) => {
        if (a.status === 'checked' && b.status !== 'checked') return -1;
        if (a.status !== 'checked' && b.status === 'checked') return 1;
        return 0;
      });
      
      if (isMounted.current) {
        setRoutines(routineItems);
      }
    } catch (error) {
      console.error('ルーティンデータの取得に失敗しました:', error);
      // エラー時は空のルーティンリストを表示
    }
  };
  
  // ルーティンデータが設定されたら一度だけアニメーションを開始
  useEffect(() => {
    if (!loading && routines.length > 0 && !animationsStarted.current && isMounted.current) {
      console.log('[DEBUG] アニメーション開始条件が満たされました');
      animationsStarted.current = true;
      
      // 少し遅延させてアニメーションを開始
      setTimeout(() => {
        if (isMounted.current) {
          console.log('[DEBUG] アニメーションを開始します');
          runAllAnimations();
        }
      }, 100);
    }
  }, [loading, routines]);

  // すべてのアニメーションを実行
  const runAllAnimations = useCallback(() => {
    console.log('[DEBUG] すべてのアニメーションを実行します');
    
    // メインコンテンツのフェードイン
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // ルーティンリストのフェードイン
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(routineListAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    // 完了したルーティンのみドットをアニメーション
    const completedRoutines = routines.filter(routine => routine.status === 'checked');
    
    console.log(`[DEBUG] アニメーション開始: 完了ルーティン数=${completedRoutines.length}`);
    
    // ドットアニメーション（完了したもののみ）
    completedRoutines.forEach((routine, index) => {
      console.log(`[DEBUG] ドットアニメーション設定: ルーティン=${routine.title}, インデックス=${index}`);
      
      // アクティブなアニメーション参照に追加
      activeAnimations.current.push(routine.dotAnim);
      
      // 明示的に初期値を設定
      routine.dotAnim.setValue(0);
      
      Animated.sequence([
        // リストが表示された後に少し遅延させて順番にドットを表示
        Animated.delay(1000 + index * 200),
        Animated.spring(routine.dotAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        console.log(`[DEBUG] ドットアニメーション完了: ルーティン=${routine.title}, 完了=${finished}`);
      });
    });

    // タップテキストのフェードイン
    Animated.sequence([
      // ルーティンリストとドットアニメーションの後に表示
      Animated.delay(1000 + completedRoutines.length * 200 + 300),
      Animated.timing(tapTextAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && isMounted.current) {
        console.log('[DEBUG] アニメーション完了ステータス: 完了');
      }
    });
    
    // パーティクルアニメーションを開始
    animateParticles();
  }, [fadeAnim, routineListAnim, tapTextAnim, routines, animateParticles]);

  // 画面タップ時の処理
  const handleTap = useCallback(() => {
    // ホーム画面に戻る
    router.replace('/(tabs)/home');
  }, []);
  
  // ルーティンアイテムをレンダリング
  const renderRoutineItem = useCallback((routine: RoutineItem, index: number) => {
    console.log(`[DEBUG] レンダリング: ルーティン=${routine.title}, ステータス=${routine.status}`);
    
    return (
      <View key={routine.id} style={styles.routineItem}>
        {routine.status === 'checked' ? (
          <Animated.View 
            style={[
              styles.routineDot, 
              { 
                opacity: routine.dotAnim,
                transform: [
                  { scale: routine.dotAnim },
                  { translateY: routine.dotAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })}
                ]
              }
            ]}
          />
        ) : (
          <View style={styles.routineDotPlaceholder} />
        )}
        <ThemedText 
          style={[
            styles.routineTitle,
            routine.status === 'checked' ? styles.routineTitleCompleted : 
              routine.status === 'skipped' ? styles.routineTitleSkipped : styles.routineTitleUnchecked
          ]}
        >
          {routine.title}
        </ThemedText>
        {routine.status === 'skipped' && (
          <ThemedText style={styles.skippedText}>スキップ</ThemedText>
        )}
      </View>
    );
  }, []);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText>読み込み中...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={1}
        onPress={handleTap}
      >
        <View style={styles.background} />
        
        {/* パーティクル */}
        {particles.map(particle => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                transform: [
                  { rotate: particle.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })}
                ]
              }
            ]}
          />
        ))}
        
        {/* メインコンテンツ */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ThemedText style={styles.username}>{username}さん、</ThemedText>
          <ThemedText style={styles.congratsText} numberOfLines={1}>今日のルーティンおつかれさま！</ThemedText>
        </Animated.View>
        
        {/* ルーティンリスト */}
        <Animated.View 
          style={[
            styles.routineListContainer,
            { 
              opacity: routineListAnim,
              transform: [
                { translateY: routineListAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}
              ]
            }
          ]}
        >
          <ScrollView 
            style={styles.routineList}
            contentContainerStyle={styles.routineListContent}
            showsVerticalScrollIndicator={false}
          >
            {routines.length > 0 ? (
              routines.map(renderRoutineItem)
            ) : (
              <ThemedText style={styles.noRoutinesText}>
                登録されているルーティンがありません
              </ThemedText>
            )}
          </ScrollView>
        </Animated.View>
        
        {/* タップで終了 */}
        <Animated.View style={[styles.tapContainer, { opacity: tapTextAnim }]}>
          <View style={styles.tapBackground}>
            <ThemedText style={styles.tapText}>画面タップで終了</ThemedText>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5EC',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingTop: 10,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFF5EC',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 80,
    width: '100%',
  },
  username: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 4,
    paddingTop: 4,
  },
  congratsText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: '95%',
  },
  routineListContainer: {
    width: '90%',
    maxHeight: '70%',
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
  routineList: {
    width: '100%',
  },
  routineListContent: {
    paddingVertical: 4,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 3,
  },
  routineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: projectColors.primary,
    marginRight: 10,
  },
  routineDotPlaceholder: {
    width: 10,
    height: 10,
    marginRight: 10,
  },
  routineTitle: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    flex: 1,
  },
  routineTitleCompleted: {
    color: '#2D2D2D',
    fontWeight: 'bold',
  },
  routineTitleSkipped: {
    color: '#8C7E8C',
  },
  routineTitleUnchecked: {
    color: '#A9A9A9',
  },
  skippedText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.xs,
    color: '#8C7E8C',
    marginLeft: 6,
  },
  noRoutinesText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    color: '#8C7E8C',
    textAlign: 'center',
    marginTop: 8,
  },
  tapContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tapBackground: {
    backgroundColor: 'rgba(255, 241, 230, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  tapText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    color: '#8C7E8C',
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: projectColors.primary,
    opacity: 0.5,
  },
}); 