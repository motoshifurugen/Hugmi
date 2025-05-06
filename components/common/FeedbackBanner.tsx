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
              <Ionicons name="close" size={18} color={projectColors.black2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: projectColors.white1,
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 34,
    backgroundColor: 'rgba(255, 224, 178, 0.2)', // 透明度を大幅に上げて非常に薄く
    width: '93%',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 183, 77, 0.2)', // アクセントカラーを薄くした境界線
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: projectColors.black1, // より薄いテキスト色
    fontWeight: '400',
    paddingLeft: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 183, 77, 0.5)', // アクセントカラーを半透明に
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // 影も薄く
    shadowRadius: 1,
    elevation: 0, // Androidの影を無くす
  },
  buttonText: {
    color: projectColors.black1,
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
});

export default FeedbackBanner; 