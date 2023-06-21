// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Icon, SwFullSizeModal } from 'components/design-system-ui';
import { SubHeader } from 'components/SubHeader';
import useCheckCamera from 'hooks/common/useCheckCamera';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { QrCode } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { SafeAreaView, View } from 'react-native';
import i18n from 'utils/i18n/i18n';

import createStyle from './styles';

interface Props {
  children: JSX.Element;
  visible: boolean;
  onClose: () => void;
  onOpenScan: () => void;
}

const DisplayPayloadModal: React.FC<Props> = (props: Props) => {
  const { children, onOpenScan, onClose, visible } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const checkCamera = useCheckCamera();

  return (
    <SwFullSizeModal modalVisible={visible} onBackButtonPress={onClose}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.container}>
          <SubHeader title={i18n.common.confirm} onPressBack={onClose} />
          <View style={styles.body}>{children}</View>
          <Button
            style={styles.footer}
            onPress={checkCamera(onOpenScan)}
            icon={<Icon phosphorIcon={QrCode} weight="fill" />}>
            Scan QR
          </Button>
        </View>
      </SafeAreaView>
    </SwFullSizeModal>
  );
};

export default DisplayPayloadModal;
