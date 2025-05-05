import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Pressable, Animated, TouchableOpacity, Dimensions, View, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { fonts } from '@/constants/fonts';
import { projectColors } from '@/constants/Colors';

// 日替わりメッセージの配列
const encouragingMessages = [
  'やさしい1日になりますように。',
  'ここまでできたあなた、すてきです！',
  '今日も1日、ゆっくり深呼吸して。',
  '小さな一歩が、大きな変化を生みます。',
  '今日の自分をほめてあげましょう。',
  'あなたのペースで進んでいきましょう。',
  '新しい1日の始まり、おめでとう！',
  '自分を信じる力が、あなたを支えています。',
  '今日のあなたが、明日の自分につながります。'
];

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

export default function MorningCompleteScreen() {
  // アニメーション値の初期化をメモ化
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(1)).current; // 最初から表示するため1に設定
  const tapTextAnim = useRef(new Animated.Value(0)).current;
  
  const [username, setUsername] = useState('まい'); // ユーザー名（本来はストアから取得）
  const [message, setMessage] = useState('');
  const particles = useRef<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation | null>(null);
  const animationsComplete = useRef(false);
  
  // 画面の寸法を取得
  const { width, height } = Dimensions.get('window');
  
  // アニメーションをクリーンアップする関数
  const cleanupAnimations = useCallback(() => {
    if (animationsRef.current) {
      animationsRef.current.stop();
      animationsRef.current = null;
    }
    
    // 個別のアニメーション値をリセット
    fadeAnim.setValue(0);
    celebrationAnim.setValue(1); // 最初から表示するため1に設定
    tapTextAnim.setValue(0);
    
    // パーティクルのアニメーション値もリセット
    particles.current.forEach(particle => {
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.scale.setValue(0);
      particle.opacity.setValue(0);
      particle.rotate.setValue(0);
    });
    
    // パーティクル配列をクリア
    particles.current = [];
  }, [fadeAnim, celebrationAnim, tapTextAnim]);
  
  // コンポーネントのアンマウント時にアニメーションをクリーンアップ
  useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, [cleanupAnimations]);
  
  // パーティクルを作成
  useEffect(() => {
    // 日替わりメッセージをランダムに選択
    const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
    setMessage(encouragingMessages[randomIndex]);
    
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
  }, [cleanupAnimations]);
  
  const startAnimation = useCallback(() => {
    // 既存のアニメーションがあればクリーンアップ
    if (animationsRef.current) {
      animationsRef.current.stop();
    }
    
    // セレブレーションアニメーション（単純化）
    const celebrationAnimation = Animated.spring(celebrationAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    });
    
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
    
    // タップテキストのフェードイン
    const tapTextFadeIn = Animated.sequence([
      Animated.delay(2000), // メインアニメーション後に表示
      Animated.timing(tapTextAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
    
    // すべてのアニメーションを並行して実行（セレブレーションアニメーションは省略可能）
    const compositeAnimation = Animated.parallel([
      celebrationAnimation,
      mainFadeIn,
      ...particleAnimations,
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
  }, [fadeAnim, celebrationAnim, tapTextAnim]);
  
  // 画面表示時に一度だけ実行
  useEffect(() => {
    // セレブレーション画像をプリロード
    Image.prefetch(Image.resolveAssetSource(require('@/assets/images/celebration.png')).uri)
      .catch(error => console.error('画像のプリロードに失敗しました', error));
  }, []);
  
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
        
        {/* セレブレーション画像（最初から表示） */}
        <Animated.View 
          style={[
            styles.celebrationContainer, 
            { 
              opacity: celebrationAnim,
              transform: [{ scale: celebrationAnim }]
            }
          ]}
        >
          <Image 
            source={require('@/assets/images/celebration.png')} 
            style={styles.celebrationImage}
          />
        </Animated.View>
        
        {/* メインコンテンツ */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ThemedText style={styles.username}>{username}さん、</ThemedText>
          <ThemedText style={styles.congratsText} numberOfLines={1}>今日のルーティンおつかれさま！</ThemedText>
          <ThemedText style={styles.messageText}>{message}</ThemedText>
        </Animated.View>
        
        {/* タップで終了 */}
        <Animated.View style={[styles.tapContainer, { opacity: tapTextAnim }]}>
          <ThemedText style={styles.tapText}>タップで終了</ThemedText>
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
    justifyContent: 'flex-start', // 上寄せに変更
    alignItems: 'center',
    paddingTop: 20, // 上部に少し余白を追加
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
  celebrationContainer: {
    position: 'absolute',
    top: 60, // 上部に配置
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  celebrationImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 230, // セレブレーション画像の下に配置
    width: '100%',
  },
  username: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes['2xl'],
    fontWeight: 'bold',
    marginBottom: 8,
    paddingTop: 4,
  },
  congratsText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    maxWidth: '95%',
  },
  messageText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
    marginTop: 10,
    color: '#715A58',
  },
  particleBase: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  tapContainer: {
    position: 'absolute',
    bottom: 100,
  },
  tapText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.md,
    color: '#8C7E8C',
  },
}); 