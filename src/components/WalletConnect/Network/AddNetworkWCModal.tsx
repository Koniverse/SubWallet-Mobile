import React, { useCallback, useMemo } from 'react';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { PlugsConnected } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { View } from 'react-native';
import { RootStackParamList } from 'routes/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  cancelRequest: () => void;
  networkToAdd: string[];
  requestId: string;
  visible: boolean;
  setVisible: (value: boolean) => void;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const AddNetworkWCModal = ({
  visible,
  setVisible,
  networkToAdd,
  cancelRequest,
  requestId,
  navigation,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const onCancel = useCallback(() => {
    setVisible(false);
    cancelRequest();
  }, [cancelRequest, setVisible]);

  const addNetwork = useCallback(() => {
    setVisible(false);
    navigation.replace('ImportNetwork', { chainIds: networkToAdd, id: requestId });
  }, [navigation, networkToAdd, requestId, setVisible]);

  const footer = useMemo(
    () => (
      <View style={{ flexDirection: 'row', width: '100%', gap: theme.paddingSM }}>
        <Button block type={'secondary'} onPress={onCancel}>
          {i18n.buttonTitles.cancel}
        </Button>
        <Button block onPress={addNetwork}>
          {i18n.buttonTitles.addNetwork}
        </Button>
      </View>
    ),
    [addNetwork, onCancel, theme.paddingSM],
  );

  return (
    <SwModal
      isUseForceHidden={false}
      modalTitle={'Add network to connect'}
      modalVisible={visible}
      setVisible={setVisible}
      titleTextAlign={'center'}>
      <View style={{ alignItems: 'center', paddingTop: theme.paddingLG, gap: theme.paddingMD }}>
        <PageIcon icon={PlugsConnected} color={theme.colorWarning} />
        <Typography.Text style={{ color: theme.colorTextTertiary, textAlign: 'center' }}>
          {
            "The network you're connecting to is not yet supported on SubWallet. Add the network first, then connect with WalletConnect again."
          }
        </Typography.Text>
        {footer}
      </View>
    </SwModal>
  );
};
