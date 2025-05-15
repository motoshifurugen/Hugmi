import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticButtonProps extends TouchableOpacityProps {
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

export const HapticButton: React.FC<HapticButtonProps> = ({ 
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
    <TouchableOpacity
      {...props}
      onPress={handlePress}
    >
      {children}
    </TouchableOpacity>
  );
}; 