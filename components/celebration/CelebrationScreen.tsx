import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { projectColors } from '@/constants/Colors';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { createNeomorphicButtonStyle, createNeomorphicButtonPressedStyle } from '@/constants/NeuomorphicStyles';

const { width, height } = Dimensions.get('window');

interface CelebrationScreenProps {
  onClose: () => void;
  userName?: string;
}

export default function CelebrationScreen({ onClose, userName = '' }: CelebrationScreenProps) {
  // アニメーション用の値
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.3)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const messageSlideUp = useRef(new Animated.Value(50)).current;
  const buttonSlideUp = useRef(new Animated.Value(100)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  
  // 紙吹雪アニメーション用の個別の値
  const confetti1 = useRef(new Animated.Value(-100)).current;
  const confetti2 = useRef(new Animated.Value(-120)).current;
  const confetti3 = useRef(new Animated.Value(-80)).current;
  const confetti4 = useRef(new Animated.Value(-150)).current;
  const confetti5 = useRef(new Animated.Value(-90)).current;

  useEffect(() => {
    startCelebrationAnimation();
  }, []);

  const startCelebrationAnimation = () => {
    // メイン画像のフェードイン・スケールイン
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleIn, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // 紙吹雪の落下アニメーション
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        ...createConfettiFallAnimation(),
      ]).start();
    }, 400);

    // メッセージのスライドアップ
    setTimeout(() => {
      Animated.spring(messageSlideUp, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 600);

    // ボタンのスライドアップ
    setTimeout(() => {
      Animated.spring(buttonSlideUp, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 800);

    // 継続的な輝きの回転アニメーション
    Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // 継続的な脈動アニメーション
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const createConfettiFallAnimation = () => {
    const confettiAnimations = [confetti1, confetti2, confetti3, confetti4, confetti5];
    return confettiAnimations.map((confetti, index) => 
      Animated.timing(confetti, {
        toValue: height + 100,
        duration: 2000 + (index * 200), // 異なる速度で落下
        useNativeDriver: true,
      })
    );
  };

  const sparkleRotateInterpolate = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ThemedView style={styles.container}>
      {/* 背景グラデーション */}
      <View style={styles.backgroundGradient} />
      
      {/* 紙吹雪レイヤー */}
      <Animated.View style={[styles.confettiContainer, { opacity: confettiOpacity }]}>
        {/* 複数の紙吹雪要素 */}
        <Animated.View style={[styles.confetti, styles.confetti1, { transform: [{ translateY: confetti1 }] }]} />
        <Animated.View style={[styles.confetti, styles.confetti2, { transform: [{ translateY: confetti2 }] }]} />
        <Animated.View style={[styles.confetti, styles.confetti3, { transform: [{ translateY: confetti3 }] }]} />
        <Animated.View style={[styles.confetti, styles.confetti4, { transform: [{ translateY: confetti4 }] }]} />
        <Animated.View style={[styles.confetti, styles.confetti5, { transform: [{ translateY: confetti5 }] }]} />
      </Animated.View>

      <View style={styles.contentContainer}>

      {/* メインコンテンツ */}
      <Animated.View 
        style={[
          styles.mainContent,
          {
            opacity: fadeIn,
            transform: [
              { scale: scaleIn },
              { scale: pulseScale }
            ]
          }
        ]}
      >
        {/* 輝きエフェクト */}
        <Animated.View 
          style={[
            styles.sparkleContainer,
            { transform: [{ rotate: sparkleRotateInterpolate }] }
          ]}
        >
          <View style={styles.sparkle} />
        </Animated.View>

        {/* 祝福画像 */}
        <Image 
          source={require('@/assets/images/celebration.png')}
          style={styles.celebrationImage}
          resizeMode="contain"
        />

        {/* 達成バッジ */}
        <View style={styles.achievementBadge}>
          <View style={styles.achievementHeader}>
            <AntDesign name="star" size={20} color="#FFD700" />
            <ThemedText style={styles.achievementText}>ACHIEVEMENT</ThemedText>
            <AntDesign name="star" size={20} color="#FFD700" />
          </View>
          <ThemedText style={styles.achievementNumber}>50</ThemedText>
          <ThemedText style={styles.achievementLabel}>名言コンプリート</ThemedText>
        </View>
      </Animated.View>

      {/* 祝福メッセージ */}
      <Animated.View 
        style={[
          styles.messageContainer,
          { transform: [{ translateY: messageSlideUp }] }
        ]}
      >
        <ThemedText style={styles.congratulationsText}>
          おめでとうございます。
        </ThemedText>
        <ThemedText style={styles.messageText}>
          50日間の朝を、あなたは{'\n'}
          ひとつ残らず積み重ねてきました。
        </ThemedText>
        <ThemedText style={styles.subMessageText}>
          もうHugmiがいなくても、{'\n'}
          あなたには自分を動かす力があります。
        </ThemedText>
        <ThemedText style={styles.subMessageText}>
          ここからの毎日も、{'\n'}
          自信をもって歩んでくださいね。
        </ThemedText>
      </Animated.View>

      {/* 閉じるボタン */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { transform: [{ translateY: buttonSlideUp }] }
        ]}
      >
        <Pressable 
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.buttonPressed
          ]} 
          onPress={onClose}
        >
          <ThemedText style={styles.buttonText}>
            続ける
          </ThemedText>
        </Pressable>
      </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.1)', // 金色のオーバーレイ
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confetti1: {
    backgroundColor: '#FFD700',
    left: '10%',
  },
  confetti2: {
    backgroundColor: '#FF6B6B',
    left: '25%',
  },
  confetti3: {
    backgroundColor: '#4ECDC4',
    left: '50%',
  },
  confetti4: {
    backgroundColor: '#45B7D1',
    left: '75%',
  },
  confetti5: {
    backgroundColor: '#96CEB4',
    left: '90%',
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    width: 30,
    height: 30,
    backgroundColor: '#FFD700',
    transform: [{ rotate: '45deg' }],
    borderRadius: 4,
    opacity: 0.8,
  },
  celebrationImage: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  achievementBadge: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  achievementText: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: '#FFD700',
    letterSpacing: 1,
    marginHorizontal: 8,
  },
  achievementNumber: {
    fontSize: 36,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.primary,
    lineHeight: 38,
  },
  achievementLabel: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: projectColors.black1,
    marginTop: 5,
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  congratulationsText: {
    fontSize: 20,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: projectColors.black1,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  subMessageText: {
    fontSize: 13,
    fontFamily: 'ZenMaruGothic_400Regular',
    color: projectColors.black2,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  closeButton: {
    ...createNeomorphicButtonStyle(180, 14),
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#FFD700',
  },
  buttonPressed: {
    ...createNeomorphicButtonPressedStyle(),
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: '#fff',
    textAlign: 'center',
  },
});
