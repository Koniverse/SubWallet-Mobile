import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CheckCircleIcon, XCircleIcon } from 'phosphor-react-native';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { WrappedTransactionSignerSelectorItem } from 'components/AccountProxy/WrappedTransactionSignerSelectorItem';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';
import { WrappedTransactionSigner } from 'types/wrappedTransaction';
import i18n from 'utils/i18n/i18n';

export interface WrappedTransactionSignerSelectorModalProps {
  chainSlug: string;
  targetAddress: string;
  selectedSigner: WrappedTransactionSigner | null;
  signerItems: WrappedTransactionSigner[];
  onSelectSigner: (signer: WrappedTransactionSigner) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export const WrappedTransactionSignerSelectorModal = ({
  chainSlug,
  modalVisible,
  onSelectSigner,
  selectedSigner,
  setModalVisible,
  signerItems,
  targetAddress,
}: WrappedTransactionSignerSelectorModalProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const account = useGetAccountByAddress(targetAddress);
  const isMultisigTransaction = !!account?.isMultisig;

  /**
   * A proxied account can also sign for itself, so it heads the list. A multisig
   * account cannot, so only the resolved signatories are offered.
   */
  const fullList = useMemo<WrappedTransactionSigner[]>(() => {
    if (!account || account.isMultisig) {
      return signerItems;
    }

    return [
      {
        kind: 'substrate_proxy',
        isProxiedAccount: true,
        address: targetAddress,
        proxyId: account.proxyId,
      },
      ...signerItems,
    ];
  }, [account, signerItems, targetAddress]);

  const [selected, setSelected] = useState<WrappedTransactionSigner | null>(selectedSigner);

  const onSelect = useCallback((item: WrappedTransactionSigner) => () => setSelected(item), []);

  const onCancelSelectSigner = useCallback(() => {
    setSelected(selectedSigner ?? null);
    setModalVisible(false);
  }, [selectedSigner, setModalVisible]);

  const onConfirmSelectSigner = useCallback(() => {
    if (selected) {
      onSelectSigner(selected);
      setModalVisible(false);
    }
  }, [onSelectSigner, selected, setModalVisible]);

  // Preselect the first available signer so the confirmation can start preparing the
  // wrapped transaction without an extra tap.
  useEffect(() => {
    if (!selectedSigner && fullList.length) {
      onSelectSigner(fullList[0]);
    }
  }, [fullList, onSelectSigner, selectedSigner]);

  useEffect(() => {
    setSelected(selectedSigner);
  }, [selectedSigner]);

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      onChangeModalVisible={onCancelSelectSigner}
      modalTitle={i18n.multisig.selectAccountTitle}
      titleTextAlign={'center'}
      isUseForceHidden={false}>
      <Typography.Text style={styles.description}>
        {isMultisigTransaction ? i18n.multisig.selectMultisigSigningAccount : i18n.multisig.selectSigningAccount}
      </Typography.Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {fullList.map(item => (
          <WrappedTransactionSignerSelectorItem
            key={`${item.address}-${item.kind}-${item.substrateProxyType || ''}`}
            chainSlug={chainSlug}
            signerItem={item}
            showUnselectIcon
            isSelected={
              !!selected &&
              isSameAddress(selected.address, item.address) &&
              selected.substrateProxyType === item.substrateProxyType
            }
            onPress={onSelect(item)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          block
          type={'secondary'}
          icon={<Icon phosphorIcon={XCircleIcon} weight={'fill'} />}
          onPress={onCancelSelectSigner}>
          {i18n.multisig.cancel}
        </Button>
        <Button
          block
          disabled={!selected}
          icon={
            <Icon
              phosphorIcon={CheckCircleIcon}
              weight={'fill'}
              iconColor={selected ? theme.colorWhite : theme.colorTextLight5}
            />
          }
          onPress={onConfirmSelectSigner}>
          {i18n.multisig.select}
        </Button>
      </View>
    </SwModal>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    description: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      textAlign: 'center',
      marginBottom: theme.marginSM,
    },
    list: {
      width: '100%',
      maxHeight: 320,
    },
    listContent: {
      gap: theme.sizeXS,
      paddingBottom: theme.paddingXS,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.sizeXS,
      width: '100%',
      paddingTop: theme.size,
    },
  });
}

export default WrappedTransactionSignerSelectorModal;
