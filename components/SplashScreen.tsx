import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { 
  useFonts, 
  ZenMaruGothic_400Regular, 
  ZenMaruGothic_500Medium, 
  ZenMaruGothic_700Bold 
} from '@expo-google-fonts/zen-maru-gothic';
import * as SplashScreen from 'expo-splash-screen';

import { projectColors } from '@/constants/Colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({ onFinish }: SplashScreenProps) {
  // アニメーション用の値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lightAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  // フォントの読み込み
  const [fontsLoaded] = useFonts({
    ZenMaruGothic_400Regular,
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // フォントが読み込まれたらアニメーションを開始
      startAnimations();
    }
  }, [fontsLoaded]);

  const startAnimations = () => {
    // ロゴのフェードイン（1秒）
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // 背景の光アニメーション（1.5秒）
    Animated.timing(lightAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // テキストのフェードイン（1.5秒後に開始）
    setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1500);

    // スプラッシュ画面の表示時間（3秒）
    setTimeout(() => {
      onFinish();
    }, 3000);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 背景の光エフェクト */}
      <Animated.View 
        style={[
          styles.lightEffect,
          {
            opacity: lightAnim,
            transform: [
              {
                scale: lightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />

      {/* メインロゴとサブタイトルをまとめるコンテナ */}
      <View style={styles.contentContainer}>
        {/* メインロゴ */}
        <Animated.Text 
          style={[
            styles.logo, 
            { 
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }
          ]}
        >
          Hugmi
        </Animated.Text>

        {/* サブタイトル */}
        <Animated.Text 
          style={[
            styles.subtitle,
            { opacity: textFadeAnim }
          ]}
        >
          やさしく始める私のルーティン
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: projectColors.white1, // テーマカラーの変数を使用
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: -10, // ロゴを上に移動
  },
  logo: {
    fontSize: 46,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1, // テーマカラーの変数を使用
    zIndex: 10,
  },
  subtitle: {
    marginTop: 20, // キャッチコピーとの間隔を広げる
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_400Regular',
    color: '#666',
    zIndex: 10,
  },
  lightEffect: {
    position: 'absolute',
    width: 160, // 円のサイズをさらに小さくする
    height: 160, // 円のサイズをさらに小さくする
    borderRadius: 80, // width/heightの半分に合わせる
    backgroundColor: projectColors.secondary, // テーマカラーの変数を使用
    zIndex: 5,
  },
}); 