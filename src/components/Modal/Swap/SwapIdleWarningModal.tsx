import { Button, Icon, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Info } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  onPressOk: () => void;
}

export const SwapIdleWarningModal = ({ modalVisible, setModalVisible, onPressOk }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const footer = useMemo(
    () => (
      <Button
        onPress={onPressOk}
        style={{ marginTop: theme.margin }}
        icon={<Icon phosphorIcon={Info} weight={'fill'} />}>
        {'Yes, show me latest quote'}
      </Button>
    ),
    [onPressOk, theme.margin],
  );

  return (
    <SwModal
      isAllowSwipeDown={false}
      disabledOnPressBackDrop={true}
      footer={footer}
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      titleTextAlign={'center'}
      modalTitle={'Are you  still there?'}>
      <View style={{ alignItems: 'center' }}>
        <PageIcon customSize={112} icon={Info} color={theme['gray-5']} />
        <Typography.Text style={{ color: theme.colorWhite, paddingTop: theme.padding, textAlign: 'center' }}>
          {'We are ready to show you the latest quotes when you want to continue'}
        </Typography.Text>
      </View>
    </SwModal>
  );
};
