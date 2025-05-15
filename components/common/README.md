# 共通コンポーネント

このディレクトリには、アプリケーション全体で再利用可能な共通コンポーネントが含まれています。

## ハプティックフィードバックコンポーネント

ユーザー体験を向上させるため、ボタンタップ時にハプティックフィードバック（振動）を提供するコンポーネントを用意しています。

### HapticButton

`TouchableOpacity`ベースのハプティックフィードバック対応ボタンです。

**使用例:**

```tsx
import { HapticButton } from '@/components/common/HapticButton';
import * as Haptics from 'expo-haptics';

// 基本的な使い方
<HapticButton onPress={handlePress}>
  <Text>ボタンテキスト</Text>
</HapticButton>

// フィードバック強度のカスタマイズ
<HapticButton 
  onPress={handlePress}
  hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
>
  <Text>中程度の振動</Text>
</HapticButton>

// 強い振動フィードバック
<HapticButton 
  onPress={handlePress}
  hapticStyle={Haptics.ImpactFeedbackStyle.Heavy}
>
  <Text>強い振動</Text>
</HapticButton>

// ハプティックフィードバックを無効化
<HapticButton 
  onPress={handlePress}
  disableHaptic={true}
>
  <Text>振動なし</Text>
</HapticButton>
```

### HapticPressable

`Pressable`ベースのハプティックフィードバック対応ボタンです。`Pressable`の柔軟性を保ちながらハプティックフィードバックを追加できます。

**使用例:**

```tsx
import { HapticPressable } from '@/components/common/HapticPressable';
import * as Haptics from 'expo-haptics';

// 基本的な使い方
<HapticPressable onPress={handlePress}>
  <Text>ボタンテキスト</Text>
</HapticPressable>

// Pressableスタイルと組み合わせる
<HapticPressable
  onPress={handlePress}
  style={({ pressed }) => [
    { opacity: pressed ? 0.7 : 1.0 }
  ]}
>
  <Text>押下時に透明度が変わる</Text>
</HapticPressable>
```

### HapticTab

タブナビゲーション用のハプティックフィードバック対応コンポーネントです。

**使用例:**

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HapticTab } from '@/components/common/HapticTab';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <HapticTab {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
```

## その他の共通コンポーネント

- `ThemedText`: テーマに対応したテキストコンポーネント
- `ThemedView`: テーマに対応したビューコンポーネント
- `Collapsible`: 折りたたみ可能なコンテナコンポーネント
- `ExternalLink`: 外部リンク用のプレッサブルコンポーネント
- `FeedbackBanner`: フィードバック入力促進用のバナーコンポーネント 