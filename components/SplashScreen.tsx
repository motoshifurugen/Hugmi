import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { projectColors } from '@/constants/Colors';
import { createNeomorphicStyle, create3DCircleStyle } from '@/constants/NeuomorphicStyles';

// グローバル状態変数 - アプリケーション全体で1回だけアニメーションを実行するため
// この変数はモジュールスコープなので、コンポーネントのレンダリングサイクルの影響を受けない
const GLOBAL_ANIMATION_STATE = {
  hasStarted: false,
  isComplete: false,
  loadingTextShown: false
};

// アニメーション値をグローバルに保持
const globalAnimValues = {
  fadeAnim: new Animated.Value(0),
  lightAnim: new Animated.Value(0),
  textFadeAnim: new Animated.Value(0),
  logoPositionAnim: new Animated.Value(0),
  loadingTextFadeAnim: new Animated.Value(0)
};

interface SplashScreenProps {
  onFinish: () => void;
  extendAnimation?: boolean; // アニメーション完了後も表示を延長するかどうか
  onAnimationComplete?: () => void; // アニメーション完了時に呼び出されるコールバック
}

export default function CustomSplashScreen({ 
  onFinish, 
  extendAnimation = false,
  onAnimationComplete
}: SplashScreenProps) {
  // ローカル状態 - この状態変数はレンダリングごとにリセットされる可能性があるため、
  // グローバル変数と組み合わせて使用
  const [animationDone, setAnimationDone] = useState(GLOBAL_ANIMATION_STATE.isComplete);

  // アニメーション値は、グローバル変数から取得
  const fadeAnim = globalAnimValues.fadeAnim;
  const lightAnim = globalAnimValues.lightAnim;
  const textFadeAnim = globalAnimValues.textFadeAnim;
  const logoPositionAnim = globalAnimValues.logoPositionAnim;
  const loadingTextFadeAnim = globalAnimValues.loadingTextFadeAnim;

  // コンポーネントマウント時に1回だけアニメーションを開始
  useEffect(() => {
    // グローバル状態を確認し、まだアニメーションが開始されていない場合のみ実行
    if (!GLOBAL_ANIMATION_STATE.hasStarted) {
      console.log('[DEBUG] スプラッシュアニメーション開始（初回のみ）');
      GLOBAL_ANIMATION_STATE.hasStarted = true;
      startAnimations();
    } else if (GLOBAL_ANIMATION_STATE.isComplete) {
      // アニメーションが既に完了している場合は、ローカルステートを同期
      setAnimationDone(true);
      
      // 延長モードの場合、ローディングテキストも表示
      if (extendAnimation && !GLOBAL_ANIMATION_STATE.loadingTextShown) {
        GLOBAL_ANIMATION_STATE.loadingTextShown = true;
        showLoadingText();
      }
    }
    
    // コンポーネントがアンマウントされても、グローバル状態は保持される
  }, []);

  // extendAnimationプロパティの変更を監視
  useEffect(() => {
    // アニメーションが完了している場合のみ処理
    if (GLOBAL_ANIMATION_STATE.isComplete) {
      if (extendAnimation) {
        // 延長モードになり、まだローディングテキストが表示されていない場合
        if (!GLOBAL_ANIMATION_STATE.loadingTextShown) {
          GLOBAL_ANIMATION_STATE.loadingTextShown = true;
          showLoadingText();
        }
      } else {
        // 延長モードが解除された場合、完了通知
        onFinish();
      }
    }
  }, [extendAnimation, onFinish]);

  // ローディングテキストを表示する関数
  const showLoadingText = () => {
    Animated.timing(loadingTextFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // アニメーションを開始する関数
  const startAnimations = () => {
    // アニメーションをシーケンスとして定義
    Animated.sequence([
      // 最初にロゴと背景を同時にアニメーション
      Animated.parallel([
        // ロゴのフェードイン（800ms）
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // 背景の光アニメーション（1.2秒）
        Animated.timing(lightAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // サブタイトルのフェードインとロゴ位置の移動を同時に行う
      Animated.parallel([
        // サブタイトルをフェードイン（600ms）
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // ロゴを上に移動（600ms）
        Animated.timing(logoPositionAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 完了後に少し待機（500ms）
      Animated.delay(500),
    ]).start(({ finished }) => {
      // アニメーションが正常に完了した場合のみ処理を実行
      if (finished) {
        console.log('[DEBUG] スプラッシュアニメーション完了（1回のみ）');
        
        // グローバル状態を更新
        GLOBAL_ANIMATION_STATE.isComplete = true;
        
        // ローカル状態も更新
        setAnimationDone(true);
        
        // 延長モードの場合、「データを準備しています」をフェードイン
        if (extendAnimation) {
          GLOBAL_ANIMATION_STATE.loadingTextShown = true;
          showLoadingText();
        }
        
        // アニメーション完了コールバックがあれば呼び出す
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        
        // 延長モードでない場合はすぐに完了通知
        if (!extendAnimation) {
          onFinish();
        }
      }
    });
  };

  // ロゴの位置を計算（0=中央、1=上部）
  const logoTranslateY = logoPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -12],
  });

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 背景の光エフェクト（円） - 最初に描画 */}
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

        {/* メインロゴとサブタイトルをまとめるコンテナ - 後に描画して前面に */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              transform: [{ translateY: logoTranslateY }]
            }
          ]}
        >
          {/* メインロゴ */}
          <Animated.Text 
            style={[
              styles.logo, 
              { 
                opacity: fadeAnim,
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
        </Animated.View>
      </View>
      
      {/* ローディングインジケータを画面下部に表示（非表示のときはopacity:0） */}
      <Animated.View style={[
        styles.loadingContainer,
        { opacity: loadingTextFadeAnim }
      ]}>
        <ActivityIndicator size="small" color={projectColors.softOrange} style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>データを準備しています...</Text>
      </Animated.View>
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: projectColors.white1, // 背景色をwhite1に戻す
  },
  contentWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 20, // 円よりも大きなzIndexを設定
  },
  logo: {
    fontSize: 46,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1,
  },
  subtitle: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_400Regular',
    color: '#666',
  },
  lightEffect: {
    ...create3DCircleStyle(220, 6, 12),
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.15, // 画面の下から15%の位置
    alignItems: 'center',
    width: '100%',
  },
  loadingIndicator: {
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_400Regular',
    color: '#888',
  },
}); 