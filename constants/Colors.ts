/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// プロジェクトカラー
export const projectColors = {
  // オレンジ系の優しいカラーパレット（ニューモフィズム向け）
  primary: '#FFE0B2', // メインのオレンジベージュ（ユーザー指定色）
  secondary: '#FFEFD6', // より薄いオレンジ系
  accent: '#FFB74D', // アクセントカラー（濃いめのオレンジ）
  softOrange: '#FFCC80', // 中間的な優しいオレンジ（円のデザイン用）
  info: '#B7C5D3', // 青グレー
  success: '#81C784', // 薄緑
  black1: '#4B4453', // ダークグレー
  black2: '#8C7E8C', // ミディアムグレー
  white1: '#FDF6F0', // 肌色に近い色白（背景色）
  red1: '#E76F51',  // エラー表示用の赤
  // ニューモフィズム用のシャドウカラー（より明確な凹凸感）
  neuLight: 'rgba(255, 255, 255, 0.9)', // 明るい影用（左上方向）
  neuDark: 'rgba(0, 0, 0, 0.1)', // 暗い影用（右下方向）
  // チュートリアル用に追加するカラー
  text: '#4B4453', // テキスト色（黒1と同じ）
  secondaryText: '#8C7E8C', // 補助テキスト（黒2と同じ）
  background: '#FDF6F0', // 背景色（white1と同じ）
  border: '#E5E5E5', // ボーダー色
};

export const colors = {
  light: {
    text: '#11181C',
    background: projectColors.white1, // 背景色を肌色に近い色白に設定
    tint: projectColors.accent, // アクセントカラーをティントにも使用
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: projectColors.accent, // タブアイコンの選択色もアクセントカラーに統一
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