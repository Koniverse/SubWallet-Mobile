// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Icon, SwFullSizeModal } from 'components/design-system-ui';
import { SubHeader } from 'components/SubHeader';
import useCheckCamera from 'hooks/common/useCheckCamera';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { QrCode } from 'phosphor-react-native';
import React, { useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import i18n from 'utils/i18n/i18n';

import createStyle from './styles';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: JSX.Element;
  visible: boolean;
  onOpenScan: () => void;
  setVisible: (arg: boolean) => void;
}

const DisplayPayloadModal: React.FC<Props> = (props: Props) => {
  const { children, onOpenScan, visible, setVisible } = props;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const onClose = () => setVisible(false);
  const insets = useSafeAreaInsets();
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const checkCamera = useCheckCamera();

  return (
    <SwFullSizeModal
      modalBaseV2Ref={modalBaseV2Ref}
      setVisible={setVisible}
      modalVisible={visible}
      isUseForceHidden={false}
      onBackButtonPress={onClose}>
      <SafeAreaView
        style={{
          flex: 1,
          width: '100%',
          paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 8,
          paddingBottom: insets.bottom + theme.padding,
        }}>
        <View style={styles.container}>
          <SubHeader title={i18n.common.confirm} onPressBack={onClose} />
          <View style={styles.body}>{children}</View>
          <Button
            style={styles.footer}
            onPress={checkCamera(onOpenScan)}
            icon={<Icon phosphorIcon={QrCode} weight="fill" />}>
            {i18n.common.scanQr}
          </Button>
        </View>
      </SafeAreaView>
    </SwFullSizeModal>
  );
};

export default DisplayPayloadModal;
