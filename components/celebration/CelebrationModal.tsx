import React from 'react';
import { Modal, StatusBar } from 'react-native';
import CelebrationScreen from './CelebrationScreen';

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

export default function CelebrationModal({ visible, onClose, userName }: CelebrationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(255, 215, 0, 0.1)" barStyle="dark-content" />
      <CelebrationScreen onClose={onClose} userName={userName} />
    </Modal>
  );
}
