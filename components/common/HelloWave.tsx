import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { projectColors } from '@/constants/Colors';

// かわいいアイコンを使用
export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
      withSequence(withTiming(20, { duration: 150 }), withTiming(0, { duration: 150 })),
      4 // Run the animation 4 times
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.iconContainer}>
        <IconSymbol name="sparkles" size={24} color={projectColors.accent} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginTop: -4,
    marginLeft: 6,
  },
});
