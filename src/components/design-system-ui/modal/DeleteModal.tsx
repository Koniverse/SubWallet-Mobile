import React from 'react';
import { Text } from 'react-native';
import SwModal from './SwModal';
import Button from '../button';
import styles from './style';

interface DeleteModalProps {
  visible: boolean;
  title: string;
  message: string;
  onDelete: () => void;
}

const DeleteModal = ({ visible, title, message, onDelete }: DeleteModalProps) => {
  const renderFooter = () => <Button type="danger" shape="round" onPress={onDelete} />;
  return (
    <SwModal modalVisible={visible} modalTitle={title} footer={renderFooter()}>
      <Text>{message}</Text>
    </SwModal>
  );
};

export default DeleteModal;
