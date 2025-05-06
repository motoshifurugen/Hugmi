import { projectColors } from './Colors';
import { ViewStyle, DimensionValue } from 'react-native';

/**
 * ニューモーフィズムスタイルを生成する関数
 * 
 * @param size - 要素のサイズ（円形の場合は直径、四角形の場合は辺の長さ）
 * @param shadowSize - 影のサイズ（大きいほど強調される）
 * @param elevation - Androidの影の高さ
 * @param borderWidth - 光の効果の境界線の太さ
 * @param isCircle - 円形かどうか
 * @returns ViewStyleオブジェクト
 */
export const createNeomorphicStyle = (
  size: number = 160,
  shadowSize: number = 8,
  elevation: number = 5,
  borderWidth: number = 2,
  isCircle: boolean = true
): ViewStyle => {
  const baseStyle: ViewStyle = {
    // サイズ設定
    width: size,
    height: size,
    
    // 影効果
    shadowColor: projectColors.neuDark,
    shadowOffset: { width: shadowSize, height: shadowSize },
    shadowOpacity: 1,
    shadowRadius: Math.floor(shadowSize * 1.5), // 影のぼかし具合
    elevation,
    
    // 光の効果
    borderTopWidth: borderWidth,
    borderLeftWidth: borderWidth,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopColor: projectColors.neuLight,
    borderLeftColor: projectColors.neuLight,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  };
  
  // 円形の場合は追加のスタイル
  if (isCircle) {
    baseStyle.borderRadius = size / 2;
  }
  
  return baseStyle;
};

/**
 * ニューモーフィズムボタンスタイルを生成する関数
 * 
 * @param width - ボタンの幅（%または数値）
 * @param borderRadius - 角の丸み
 * @returns ViewStyleオブジェクト
 */
export const createNeomorphicButtonStyle = (
  width: DimensionValue = '70%',
  borderRadius: number = 20
): ViewStyle => {
  return {
    backgroundColor: projectColors.softOrange,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius,
    alignItems: 'center',
    
    // 影効果
    shadowColor: projectColors.neuDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
    
    // 光の効果
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopColor: projectColors.neuLight,
    borderLeftColor: projectColors.neuLight,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    width,
    alignSelf: 'center',
  };
};

/**
 * ニューモーフィズムボタンの押下時スタイルを生成する関数
 * 
 * @param baseColor - 押下前の背景色（ボタン生成時に使われた色）
 * @returns ViewStyleオブジェクト
 */
export const createNeomorphicButtonPressedStyle = (
  baseColor: string = projectColors.softOrange
): ViewStyle => {
  return {
    backgroundColor: baseColor,
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
    
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 1,
  };
};

/**
 * 小さいニューモーフィズム要素（ドットなど）用のスタイルを生成する関数
 * 
 * @param size - 要素のサイズ
 * @returns ViewStyleオブジェクト
 */
export const createSmallNeomorphicStyle = (size: number = 12): ViewStyle => {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    
    // 影効果（小さめ）
    elevation: 2,
    shadowColor: projectColors.neuDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    
    // 光の効果（小さめ）
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopColor: projectColors.neuLight,
    borderLeftColor: projectColors.neuLight,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  };
};

/**
 * 立体感のある円のスタイルを生成する関数
 * ニューモーフィズムではなく、より濃い色と白系の縁を持つ3Dスタイル
 * 
 * @param size - 円の直径
 * @param borderWidth - 白い縁取りの太さ
 * @param elevation - 影の高さ（大きいほど浮き上がって見える）
 * @returns ViewStyleオブジェクト
 */
export const create3DCircleStyle = (
  size: number = 160,
  borderWidth: number = 4,
  elevation: number = 8
): ViewStyle => {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: projectColors.primary,
    borderWidth,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation * 0.75 },
    shadowOpacity: 0.25,
    shadowRadius: elevation * 0.8,
    elevation,
  };
}; 