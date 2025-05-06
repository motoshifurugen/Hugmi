import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { projectColors } from '@/constants/Colors';
import { IconSymbol } from '@/components/common/ui/IconSymbol';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  
  const goBack = () => {
    router.back();
  };
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'プライバシーポリシー',
          headerBackTitle: '戻る',
          headerShown: true,
          contentStyle: { backgroundColor: projectColors.white1 },
          headerLeft: () => (
            <Pressable onPress={goBack} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="#555555" />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* <ThemedText style={styles.title}>プライバシーポリシー</ThemedText> */}
        
        <ThemedText style={styles.paragraph}>
          Hugmi（以下、「本アプリ」といいます）は、ユーザーのプライバシーを尊重し、個人情報の取り扱いに細心の注意を払っています。本プライバシーポリシーでは、本アプリにおける情報の取得、利用、および保護について説明します。
        </ThemedText>
        
        <ThemedText style={styles.sectionTitle}>1. 取得する情報</ThemedText>
        <ThemedText style={styles.paragraph}>
          本アプリは、以下の情報をユーザーの端末内に保存することがあります：
        </ThemedText>
        
        <ThemedView style={styles.bulletContainer}>
          <ThemedText style={styles.bullet}>• ユーザーが登録したルーティンや設定情報</ThemedText>
          <ThemedText style={styles.bullet}>• 名言のコレクション・お気に入り情報</ThemedText>
          <ThemedText style={styles.bullet}>• 通知の時間設定</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.paragraph}>
          本アプリでは、これらの情報を外部のサーバーに送信することはありません。
        </ThemedText>
        
        <ThemedText style={styles.sectionTitle}>2. 情報の利用目的</ThemedText>
        <ThemedText style={styles.paragraph}>
          取得した情報は、以下の目的で利用されます：
        </ThemedText>
        
        <ThemedView style={styles.bulletContainer}>
          <ThemedText style={styles.bullet}>• ユーザーが登録したルーティン情報の表示・管理</ThemedText>
          <ThemedText style={styles.bullet}>• 通知機能の実行（朝／夜のリマインダー）</ThemedText>
          <ThemedText style={styles.bullet}>• アプリ体験の向上（名言の記録、表示順の管理など）</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.sectionTitle}>3. 第三者への提供</ThemedText>
        <ThemedText style={styles.paragraph}>
          本アプリは、取得した情報を外部に送信したり、第三者に提供・共有することはありません。
        </ThemedText>
        
        <ThemedText style={styles.sectionTitle}>4. 通知機能について</ThemedText>
        <ThemedText style={styles.paragraph}>
          本アプリでは、ユーザーの端末に通知を送信するため、通知の権限が必要となる場合があります。この通知設定は、端末の設定から変更できます。
        </ThemedText>
        
        <ThemedText style={styles.sectionTitle}>5. 改訂について</ThemedText>
        <ThemedText style={styles.paragraph}>
          本ポリシーの内容は、ユーザーへの通知なく変更される場合があります。重要な変更がある場合は、アプリ内でお知らせします。
        </ThemedText>
        
        <ThemedView style={styles.backButtonContainer}>
          <Pressable onPress={goBack} style={styles.footerBackButton}>
            <IconSymbol name="arrow.left" size={18} color={projectColors.white1} style={styles.backIcon} />
            <ThemedText style={styles.backButtonText}>設定に戻る</ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletContainer: {
    marginLeft: 5,
    marginBottom: 16,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerBackButton: {
    flexDirection: 'row',
    backgroundColor: projectColors.softOrange,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    color: projectColors.white1,
    fontSize: 16,
    fontWeight: '600',
  },
  backIcon: {
    marginRight: 8,
  },
}); 