/**
 * Fixed Modal Component
 * Wraps React Native Modal to address pointerEvents deprecation warning
 */

import React from 'react';
import { Modal as RNModal, ModalProps } from 'react-native';

interface FixedModalProps extends Omit<ModalProps, 'pointerEvents'> {
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

export const Modal: React.FC<FixedModalProps> = ({ 
  pointerEvents, 
  style, 
  children, 
  ...props 
}) => {
  // Move pointerEvents to style if provided
  const modalStyle = [
    style,
    pointerEvents ? { pointerEvents } : undefined
  ].filter(Boolean);

  return (
    <RNModal
      {...props}
      style={modalStyle.length > 0 ? modalStyle : style}
    >
      {children}
    </RNModal>
  );
};

export default Modal;
