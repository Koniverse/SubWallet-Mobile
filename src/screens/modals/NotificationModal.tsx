import React from 'react';
import { Text, View } from 'react-native';
import { ModalProp } from 'react-native-modalfy';
import { Button } from 'components/Button';
import { ModalfyParams } from 'react-native-modalfy/src/types';

export interface NotificationModalProps {
  type: string;
  message: string;
  func: () => void;
}

export function NotificationModal({
  modal: { closeModal, getParam },
}: ModalProp<ModalfyParams, NotificationModalProps>) {
  const message = getParam('message');
  const type = getParam('type');
  const run = () => {
    return () => {
      getParam('func', () => {})();
    };
  };
  const closeModalAction = () => {
    return () => {
      getParam('func', () => {})();
      closeModal('NotificationModal');
    };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', height: 600, padding: 100 }}>
      <Text style={{ color: 'red' }}>
        Hello this is a {type} modal: {message}
      </Text>
      <Button title={'Callback'} onPress={run()} />
      <Button title={'Close'} onPress={closeModalAction()} />
    </View>
  );
}
