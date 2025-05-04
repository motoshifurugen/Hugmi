/**
 * フォントに関する定数を定義します。
 * フォントファミリー、サイズ、ウェイトなどを一元管理します。
 */

export const fonts = {
  // フォントファミリー
  families: {
    primary: 'Zen Maru Gothic', // プロジェクトのメインフォント
    secondary: 'Zen Kaku Gothic Antique', // プロジェクトのサブフォント
    // 必要に応じて追加のフォントファミリーを定義
  },
  
  // フォントサイズ
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // フォントウェイト
  weights: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
  
  // 行の高さ
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
  
  // 文字間隔
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
  
  // テキストスタイルのプリセット
  styles: {
    title: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.5,
    },
  },
}; 