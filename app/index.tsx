import { Redirect } from 'expo-router';

export default function Index() {
  // ルートパス（/）にアクセスした場合、ホーム画面にリダイレクト
  return <Redirect href="/(tabs)/home" />;
} 