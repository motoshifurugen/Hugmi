import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Pressable, Animated, TouchableOpacity, Dimensions, View, Image, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { fonts } from '@/constants/fonts';
import { projectColors } from '@/constants/Colors';
import { getAllUsers } from '@/db/utils/users';
import { getRoutineLogsByDate } from '@/db/utils/routine_logs';
import { getRoutineById, getActiveRoutinesByUserId } from '@/db/utils/routines';

// シンプルなパーティクルの種類
enum ParticleType {
  CIRCLE,
  PETAL
}

// パーティクルのプロパティ
interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  type: ParticleType;
  size: number;
  duration: number;
}

// ルーティンアイテムの型定義
interface RoutineItem {
  id: string;
  title: string;
  status: 'checked' | 'skipped' | 'unchecked';
  dotAnim: Animated.Value;
}

export default function MorningCompleteScreen() {
  // アニメーション値の初期化をメモ化
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapTextAnim = useRef(new Animated.Value(0)).current;
  const routineListAnim = useRef(new Animated.Value(0)).current; // ルーティンリストのアニメーション
  
  const [username, setUsername] = useState('');
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const particles = useRef<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation | null>(null);
  const animationsComplete = useRef(false);
  
  // 画面の寸法を取得
  const { width, height } = Dimensions.get('window');

  // ルーティンドットのアニメーション値をリセットする関数
  const resetRoutineAnimations = useCallback(() => {
    routines.forEach(routine => {
      routine.dotAnim.setValue(0);
    });
  }, [routines]);

  // ユーザー名とルーティンデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ユーザーを取得（アプリでは1人のみという前提）
        const users = await getAllUsers();
        if (users.length > 0) {
          setUsername(users[0].name);
          // ユーザーのルーティンログを取得
          await fetchRoutineData(users[0].id);
        } else {
          console.error('ユーザーが見つかりません');
          setUsername('ゲスト');
        }
      } catch (error) {
        console.error('ユーザー名の取得に失敗しました:', error);
        setUsername('ゲスト');
      } finally {
        setLoading(false);
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
          dotAnim: new Animated.Value(0), // ドットアニメーション用の値（完了したもののみアニメーションする）
        };
      });
      
      // 完了したものを上部に表示するようにソート
      routineItems.sort((a, b) => {
        if (a.status === 'checked' && b.status !== 'checked') return -1;
        if (a.status !== 'checked' && b.status === 'checked') return 1;
        return 0;
      });
      
      setRoutines(routineItems);
    } catch (error) {
      console.error('ルーティンデータの取得に失敗しました:', error);
    }
  };
  
  // アニメーションをクリーンアップする関数
  const cleanupAnimations = useCallback(() => {
    if (animationsRef.current) {
      animationsRef.current.stop();
      animationsRef.current = null;
    }
    
    // 個別のアニメーション値をリセット
    fadeAnim.setValue(0);
    tapTextAnim.setValue(0);
    routineListAnim.setValue(0);
    
    // パーティクルのアニメーション値もリセット
    particles.current.forEach(particle => {
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.scale.setValue(0);
      particle.opacity.setValue(0);
      particle.rotate.setValue(0);
    });
    
    // ルーティンドットのアニメーション値をリセット（別の関数に分離）
    resetRoutineAnimations();
    
    // パーティクル配列をクリア
    particles.current = [];
  }, [fadeAnim, tapTextAnim, routineListAnim, resetRoutineAnimations]);
  
  // コンポーネントのアンマウント時にアニメーションをクリーンアップ
  useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, [cleanupAnimations]);
  
  // パーティクルを作成
  useEffect(() => {
    // パーティクルの色
    const colors = [
      projectColors.primary, // 淡い橙
      projectColors.secondary, // 淡いピンク
      '#FFE0D1', // 淡いピーチ
      '#FFD6C4', // 淡いコーラル
      '#FFEFD6', // 淡いクリーム
    ];
    
    const newParticles: Particle[] = [];
    
    // 花びらを画面全体に表示するために、あらかじめ配置場所を決定
    const positions = [];
    // 画面を8x10のグリッドに分割（パフォーマンス向上のため少し削減）
    const gridX = 8;
    const gridY = 10;
    
    // グリッド内の各セルに花びらを配置
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        // セル内のランダムな位置を計算
        const posX = (width / gridX) * x + Math.random() * (width / gridX);
        const posY = (height / gridY) * y + Math.random() * (height / gridY);
        positions.push({ x: posX, y: posY });
      }
    }
    
    // 位置をシャッフル
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // パーティクルの数を40個に減らす（パフォーマンス向上のため）
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      // シャッフルした位置から取得
      const position = positions[i % positions.length];
      
      // アニメーション時間をやや短めに設定
      const duration = 4000 + Math.random() * 4000; // 4〜8秒
      
      // 花びらを多くする
      const particleType = Math.random() < 0.8 ? ParticleType.PETAL : ParticleType.CIRCLE;
      
      newParticles.push({
        id: i,
        x: new Animated.Value(position.x),
        y: new Animated.Value(position.y),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: particleType,
        size: 6 + Math.floor(Math.random() * 14), // 6-20pxのサイズ
        duration: duration,
      });
    }
    
    particles.current = newParticles;
    
    // アニメーションを開始
    startAnimation();
    
    // クリーンアップ関数
    return () => {
      cleanupAnimations();
    };
  }, [cleanupAnimations, routines]);
  
  const startAnimation = useCallback(() => {
    // 既存のアニメーションがあればクリーンアップ
    if (animationsRef.current) {
      animationsRef.current.stop();
    }
    
    // メインメッセージのフェードイン
    const mainFadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });
    
    // パーティクルのアニメーション
    const particleAnimations = particles.current.map(particle => {
      // ランダムな速度係数
      const speedFactor = 0.3 + Math.random() * 0.5; // やや遅めに
      
      // 現在の位置を取得
      const currentX = Number(JSON.stringify(particle.x)) || 0;
      const currentY = Number(JSON.stringify(particle.y)) || 0;
      
      // ランダムな移動方向（特定の方向へのバイアスなし）
      const angle = Math.random() * Math.PI * 2; // 0〜2πのランダムな角度
      const distance = 50 + Math.random() * 100; // 50〜150ピクセルのランダムな距離
      
      // 角度と距離から移動量を計算
      const moveX = Math.cos(angle) * distance * speedFactor;
      const moveY = Math.sin(angle) * distance * speedFactor;
      
      return Animated.parallel([
        // X位置のアニメーション
        Animated.timing(particle.x, {
          toValue: currentX + moveX,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        // Y位置のアニメーション
        Animated.timing(particle.y, {
          toValue: currentY + moveY,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        // 回転のアニメーション - やや穏やかに
        Animated.timing(particle.rotate, {
          toValue: Math.random() * 4 - 2, // -2〜2回転（より穏やかに）
          duration: particle.duration,
          useNativeDriver: true,
        }),
        // スケールのアニメーション
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 0.7 + Math.random() * 0.5, // 0.7〜1.2
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: particle.duration - 1500,
            useNativeDriver: true,
          }),
        ]),
        // 透明度のアニメーション
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.5 + Math.random() * 0.4, // 0.5〜0.9
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: particle.duration - 1500,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });
    
    // ルーティンリストのフェードイン
    const routineListFadeIn = Animated.sequence([
      Animated.delay(500), // メインメッセージ後に表示（遅延を短縮）
      Animated.timing(routineListAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
    
    // 完了したルーティンのみドットをアニメーション
    const completedRoutines = routines.filter(routine => routine.status === 'checked');
    
    // ルーティンドットのアニメーション（完了したもののみ）
    const dotAnimations = completedRoutines.map((routine, index) => {
      return Animated.sequence([
        // リストが表示された後に少し遅延させて順番にドットを表示
        Animated.delay(1000 + index * 200), // 遅延を短縮
        Animated.spring(routine.dotAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]);
    });
    
    // タップテキストのフェードイン
    const tapTextFadeIn = Animated.sequence([
      // ルーティンリストとドットアニメーションの後に表示
      Animated.delay(1000 + completedRoutines.length * 200 + 300), // 遅延を調整
      Animated.timing(tapTextAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
    
    // すべてのアニメーションを並行して実行
    const compositeAnimation = Animated.parallel([
      mainFadeIn,
      ...particleAnimations,
      routineListFadeIn,
      ...dotAnimations,
      tapTextFadeIn,
    ]);
    
    // アニメーション参照を保存
    animationsRef.current = compositeAnimation;
    
    compositeAnimation.start(() => {
      // アニメーション完了フラグを設定
      animationsComplete.current = true;
      // アニメーション参照をクリア
      animationsRef.current = null;
    });
  }, [fadeAnim, tapTextAnim, routineListAnim, routines]);
  
  const handleTap = useCallback(() => {
    // アニメーションを停止（シンプルに）
    if (animationsRef.current) {
      animationsRef.current.stop();
      animationsRef.current = null;
    }
    
    // 画面遷移の前に必要なクリーンアップをすべて実行
    particles.current = [];
    
    // 少し遅延を入れてから画面遷移（より安定性を高めるため）
    requestAnimationFrame(() => {
      router.replace('/(tabs)/home');
    });
  }, []);
  
  // パーティクルをレンダリング
  const renderParticle = useCallback((particle: Particle) => {
    const animatedStyle = {
      transform: [
        { translateX: particle.x },
        { translateY: particle.y },
        { rotate: particle.rotate.interpolate({
          inputRange: [-2, 2],
          outputRange: ['-180deg', '180deg']
        })},
        { scale: particle.scale },
      ],
      opacity: particle.opacity,
      backgroundColor: particle.color,
      width: particle.size,
      height: particle.type === ParticleType.PETAL ? particle.size * 1.5 : particle.size,
    };
    
    // タイプに応じた形状
    let shapeStyle = {};
    if (particle.type === ParticleType.CIRCLE) {
      shapeStyle = {
        borderRadius: particle.size / 2,
      };
    } else if (particle.type === ParticleType.PETAL) {
      // 花びら風の楕円形（初期回転は固定値に変更してメモリ使用量を削減）
      shapeStyle = {
        borderRadius: particle.size / 2,
        borderTopLeftRadius: particle.size,
        borderBottomRightRadius: particle.size,
        transform: [{ rotate: `${(particle.id * 36) % 360}deg` }], // 固定値を使用
      };
    }
    
    return (
      <Animated.View
        key={particle.id}
        style={[styles.particleBase, animatedStyle, shapeStyle]}
      />
    );
  }, []);
  
  // ルーティンアイテムをレンダリング
  const renderRoutineItem = useCallback((routine: RoutineItem, index: number) => {
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
        <View
          style={[styles.background, { backgroundColor: '#FFF5EC' }]}
        />
        
        {/* パーティクルアニメーション（背景として配置） */}
        <View style={styles.particleContainer}>
          {particles.current.map(renderParticle)}
        </View>
        
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
        
        {/* タップで終了（背景色付き） */}
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
    paddingTop: 10, // 上部の余白を減らす
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 80, // 上部の余白を減らす
    width: '100%',
  },
  username: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 4, // 余白を減らす
    paddingTop: 4,
  },
  congratsText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: 12, // 余白を減らす
    textAlign: 'center',
    maxWidth: '95%',
  },
  particleBase: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  routineListContainer: {
    width: '90%',
    maxHeight: '70%', // 表示領域をさらに拡大
    marginTop: 4, // 上部の余白を減らす
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
    bottom: 40, // 位置を調整
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tapBackground: {
    backgroundColor: 'rgba(255, 241, 230, 0.85)', // 優しい背景色
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 16,
    // borderWidth: 1,
    // borderColor: 'rgba(233, 200, 180, 0.5)', // 薄い境界線
  },
  tapText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    color: '#8C7E8C',
  },
}); 