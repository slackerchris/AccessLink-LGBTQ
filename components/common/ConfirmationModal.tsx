import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  warningText: string;
  children?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
  confirmDisabled?: boolean;
  confirmButtonText?: string;
  confirmButtonIcon?: keyof typeof Ionicons.glyphMap;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  warningText,
  children,
  onCancel,
  onConfirm,
  isConfirming,
  confirmDisabled = false,
  confirmButtonText = 'Confirm',
  confirmButtonIcon = 'trash',
}) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel} disabled={isConfirming}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.warningSection}>
              <Ionicons name="warning-outline" size={48} color={colors.notification} />
              <Text style={styles.warningTitle}>Permanent Action</Text>
              <Text style={styles.warningText}>{warningText}</Text>
            </View>

            {children && <View style={styles.childrenContainer}>{children}</View>}
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isConfirming}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, (confirmDisabled || isConfirming) && styles.disabledButton]}
              onPress={onConfirm}
              disabled={confirmDisabled || isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator color={colors.headerText} />
              ) : (
                <>
                  <Ionicons name={confirmButtonIcon} size={20} color={colors.headerText} />
                  <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.shadow + '99',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 24,
  },
  warningSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.notification,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  childrenContainer: {
    marginVertical: 16,
  },
  buttonSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.notification,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.headerText,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ConfirmationModal;
