import { Redirect } from 'expo-router';

// アプリの初期画面として名言画面にリダイレクト
export default function Index() {
  return <Redirect href="/daily-quote" />;
} 