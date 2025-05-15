import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticPressableProps extends PressableProps {
  /**
   * ハプティックフィードバックの強度
   * Light: 軽い触感フィードバック
   * Medium: 中程度の触感フィードバック
   * Heavy: 強い触感フィードバック
   * デフォルトはLight
   */
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  
  /**
   * ハプティックフィードバックを無効にするフラグ
   */
  disableHaptic?: boolean;
}

export const HapticPressable: React.FC<HapticPressableProps> = ({ 
  onPress, 
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  disableHaptic = false,
  children,
  ...props 
}) => {
  const handlePress = (event: any) => {
    if (!disableHaptic) {
      // ハプティックフィードバックを実行
      Haptics.impactAsync(hapticStyle);
    }
    
    // 元のonPressがあれば呼び出す
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Pressable
      {...props}
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
}; 