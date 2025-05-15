/**
 * アプリケーション内のルート型定義
 */

// 利用可能なルートを定義
export type AppRoute = 
  | '/daily-quote'           // 日々の名言画面
  | '/routine-flow/routine'  // ルーティンフロー画面
  | '/(tabs)/home'           // ホーム画面（タブ）
  | '/(tabs)/routine'        // ルーティン画面（タブ）
  | '/(tabs)/quotes';        // 名言画面（タブ）

// 型ガード関数：文字列が有効なAppRouteかどうかをチェック
export function isValidAppRoute(route: string): route is AppRoute {
  const validRoutes: AppRoute[] = [
    '/daily-quote',
    '/routine-flow/routine',
    '/(tabs)/home',
    '/(tabs)/routine',
    '/(tabs)/quotes'
  ];
  
  return validRoutes.includes(route as AppRoute);
} 