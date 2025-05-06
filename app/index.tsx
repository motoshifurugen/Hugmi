import { Redirect } from 'expo-router';

// アプリの初期画面として名言画面にリダイレクト
export default function Index() {
  // ルート「/」へのアクセスはルートレイアウトの初期ルート決定ロジックに任せる
  // メインルートへリダイレクト（具体的なタブパスを指定）
  return <Redirect href="/(tabs)/home" />;
} 