/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// プロジェクトカラー
export const projectColors = {
  // オレンジ系の優しいカラーパレット（ニューモフィズム向け）
  primary: '#FFE0B2', // 優しいオレンジベージュ（既存を維持）
  secondary: '#FFEACC', // より薄いオレンジ系（文字が見やすいよう色味を抑えた版）
  accent: '#FF9B7D', // ワンポイントのピンク/オレンジ
  info: '#B7C5D3', // 既存の青グレー
  success: '#D7E8BA', // 既存の薄緑
  black1: '#4B4453', // 既存のダークグレー
  black2: '#8C7E8C', // 既存のミディアムグレー
  white1: '#FDF6F0', // 肌色に近い色白（元の背景色）
  red1: '#E76F51',  // エラー表示用の赤
  // ニューモフィズム用のシャドウカラー（より明確な凹凸感）
  neuLight: 'rgba(255, 255, 255, 0.9)', // 明るい影用（左上方向）- より強い光の効果に調整
  neuDark: 'rgba(0, 0, 0, 0.1)', // 暗い影用（右下方向）- 少し強めに
};

export const colors = {
  light: {
    text: '#11181C',
    background: projectColors.white1, // 背景色を肌色に近い色白に設定
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
}; 