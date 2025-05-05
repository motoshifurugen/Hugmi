import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { projectColors } from '@/constants/Colors';

// かわいいアイコンを使用
export const HelloWave = () => {
  const rotation = useSharedValue(0);
  const [iconName, setIconName] = useState('sun.max.fill');

  useEffect(() => {
    // 現在の時間に基づいてアイコンを設定
    const currentHour = new Date().getHours();
    const icon = currentHour >= 18 || currentHour < 6 ? 'moon.stars.fill' : 'sun.max.fill';
    setIconName(icon);

    // 4回繰り返す波動アニメーション
    rotation.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 300, easing: Easing.inOut(Easing.quad) }),
        withTiming(20, { duration: 300, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) })
      ),
      4,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.iconContainer}>
        <IconSymbol 
          name={iconName} 
          size={24} 
          color={projectColors.accent} 
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 237, 230, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  }
});
