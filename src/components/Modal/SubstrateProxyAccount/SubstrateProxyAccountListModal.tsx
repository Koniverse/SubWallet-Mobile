import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { SwModal } from 'components/design-system-ui';
import { SubstrateProxyAccountSelectorItem } from 'components/SubstrateProxyAccount';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { getSubstrateProxyAddressKey } from 'utils/substrateProxy';

interface Props {
  substrateProxyAccounts: SubstrateProxyAccountItem[];
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  /**
   * `ModalBase` force-hides any modal while a confirmation is queued, so a caller that
   * renders this *inside* a confirmation has to opt out or it never shows.
   */
  isUseForceHidden?: boolean;
}

/** Read-only listing of the proxies affected by a transaction. */
export const SubstrateProxyAccountListModal = ({
  isUseForceHidden = true,
  modalVisible,
  setModalVisible,
  substrateProxyAccounts,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const onCloseModal = useCallback(() => setModalVisible(false), [setModalVisible]);

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      onChangeModalVisible={onCloseModal}
      onBackButtonPress={onCloseModal}
      modalTitle={i18n.substrateProxy.proxyAccount}
      titleTextAlign={'center'}
      isUseForceHidden={isUseForceHidden}>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {substrateProxyAccounts.map(item => (
          <SubstrateProxyAccountSelectorItem
            key={getSubstrateProxyAddressKey(item.substrateProxyAddress, item.substrateProxyType)}
            substrateProxyAccount={item}
            showCheckedIcon={false}
          />
        ))}
      </ScrollView>
    </SwModal>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    list: {
      width: '100%',
      maxHeight: 400,
    },
    listContent: {
      gap: theme.sizeXS,
      paddingBottom: theme.paddingXS,
    },
  });
}

export default SubstrateProxyAccountListModal;
