import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { projectColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type FeedbackBannerProps = {
  onClose?: () => void;
  visible?: boolean;
  allowClose?: boolean;
};

const FEEDBACK_FORM_URL = 'https://forms.gle/Qa7SJoENDFdXmHzG8';

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ 
  onClose, 
  visible = true,
  allowClose = false
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  if (!isVisible) return null;

  const handlePress = () => {
    Linking.openURL(FEEDBACK_FORM_URL);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // 動的にマージンを適用
  const buttonStyle = [
    styles.button,
    { marginRight: allowClose ? 10 : 0 }
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.text}>📝 感想をお聞かせください</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={buttonStyle}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>フィードバックを送る</Text>
          </TouchableOpacity>
          {allowClose && (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color={projectColors.black1} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: projectColors.white1, // projectColors.primaryを透明度を上げて薄く
    width: '100%',
    alignItems: 'center', // 中央寄せ
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 34,
    backgroundColor: 'rgba(255, 224, 178, 0.5)', // projectColors.primaryを透明度を上げて薄く
    width: '93%', // 全体幅の90%に縮小
    borderRadius: 10, // 角を丸くして優しい印象に
    marginTop: 4,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: projectColors.text,
    fontWeight: '500',
    paddingLeft: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: projectColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    // marginRightをここでは指定せず、動的に適用
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  buttonText: {
    color: projectColors.white1,
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

export default FeedbackBanner; 