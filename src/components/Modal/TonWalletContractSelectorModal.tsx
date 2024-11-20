import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VoidFunction } from 'types/index';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import {
  AccountActions,
  AccountProxyType,
  ResponseGetAllTonWalletContractVersion,
} from '@subwallet/extension-base/types';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import { TonWalletContractItem, TonWalletContractItemType } from 'components/Item/TonWalletContract';
import { TonWalletContractVersion } from '@subwallet/keyring/types';
import { tonAccountChangeWalletContractVersion, tonGetAllWalletContractVersion } from 'messaging/accounts';
import { useToast } from 'react-native-toast-notifications';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { Linking, StyleSheet, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { CheckCircle } from 'phosphor-react-native';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';

interface Props {
  address: string;
  onCancel?: VoidFunction;
  chainSlug: string;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  isOpenFromTokenDetailScreen?: boolean;
  onChangeModalVisible?: VoidFunction;
}

const TON_WALLET_CONTRACT_TYPES_URL = 'https://docs.ton.org/participate/wallets/contracts#how-can-wallets-be-different';

export const TonWalletContractSelectorModal = ({
  address,
  chainSlug,
  modalVisible,
  setModalVisible,
  onCancel,
  isOpenFromTokenDetailScreen,
  onChangeModalVisible,
}: Props) => {
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const chainInfo = useFetchChainInfo(chainSlug);
  const toast = useToast();
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const [tonWalletContractVersionData, setTonWalletContractVersionData] =
    useState<ResponseGetAllTonWalletContractVersion | null>(null);
  const accountInfo = useGetAccountByAddress(address);
  const [selectedContractVersion, setSelectedContractVersion] = useState<TonWalletContractVersion | undefined>(
    accountInfo ? (accountInfo.tonContractVersion as TonWalletContractVersion) : undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    let sync = true;

    if (accountInfo?.address) {
      tonGetAllWalletContractVersion({ address: accountInfo.address, isTestnet: chainInfo?.isTestnet })
        .then(result => {
          if (sync) {
            setTonWalletContractVersionData(result);
          }
        })
        .catch((e: Error) => {
          sync && toast.show(e.message, { type: 'danger' });
        });
    }

    return () => {
      sync = false;
    };
  }, [accountInfo?.address, chainInfo?.isTestnet, toast]);

  const resultList = useMemo((): TonWalletContractItemType[] => {
    if (!tonWalletContractVersionData?.addressMap) {
      return [];
    }

    const addressMap = tonWalletContractVersionData.addressMap;

    return Object.entries(addressMap).map(([version, _address]) => {
      const validVersion = version as TonWalletContractVersion;

      return {
        version: validVersion,
        address: _address,
        isSelected: validVersion === selectedContractVersion,
        chainSlug,
      };
    });
  }, [tonWalletContractVersionData?.addressMap, selectedContractVersion, chainSlug]);

  const onPressItem = useCallback((version: TonWalletContractVersion) => {
    return () => {
      setSelectedContractVersion(version);
    };
  }, []);

  const onConfirmButton = useCallback(() => {
    if (accountInfo?.address && selectedContractVersion) {
      setIsSubmitting(true);

      tonAccountChangeWalletContractVersion({
        proxyId: '',
        address: accountInfo.address,
        version: selectedContractVersion,
      })
        .then(newAddress => {
          setTimeout(() => {
            onCancel?.();
            setIsSubmitting(false);
            const selectedAccount = accountProxies.find(account => account.id === accountInfo.proxyId);
            const isSoloAccount = selectedAccount?.accountType === AccountProxyType.SOLO;
            const hasTonChangeWalletContractVersion = selectedAccount?.accountActions.includes(
              AccountActions.TON_CHANGE_WALLET_CONTRACT_VERSION,
            );
            const shouldNavigate = isOpenFromTokenDetailScreen && isSoloAccount && hasTonChangeWalletContractVersion;

            if (shouldNavigate) {
              Linking.openURL(`subwallet://home/main/tokens/token-groups-detail?slug=${newAddress}`);
            }
          }, 400);
        })
        .catch((e: Error) => {
          toast.show(e.message, { type: 'danger' });
        });
    }
  }, [
    accountInfo?.address,
    accountInfo?.proxyId,
    accountProxies,
    isOpenFromTokenDetailScreen,
    onCancel,
    selectedContractVersion,
    toast,
  ]);

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      onChangeModalVisible={onChangeModalVisible}
      modalTitle={'Wallet address & version'}
      hideWhenCloseApp={true}
      isUseForceHidden={true}
      titleTextAlign={'center'}>
      <Typography.Text style={styles.commonText}>
        <Typography.Text>{'TON wallets have '}</Typography.Text>
        <Typography.Text onPress={() => Linking.openURL(TON_WALLET_CONTRACT_TYPES_URL)} style={styles.highlightText}>
          {'multiple versions'}
        </Typography.Text>
        <Typography.Text>
          {', each with its own wallet address and balance. Select a version with the address you want to get'}
        </Typography.Text>
      </Typography.Text>

      <View style={{ gap: theme.sizeXS, width: '100%' }}>
        {resultList.map(item => (
          <TonWalletContractItem
            {...item}
            key={item.address}
            onPress={onPressItem(item.version)}
            isSelected={selectedContractVersion === item.version}
          />
        ))}
      </View>

      <View style={{ width: '100%', paddingTop: theme.size }}>
        <Button
          disabled={isSubmitting}
          loading={isSubmitting}
          icon={<Icon phosphorIcon={CheckCircle} weight={'fill'} />}
          onPress={onConfirmButton}>
          Confirm
        </Button>
      </View>
    </SwModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    commonText: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeHeading6,
      lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
      textAlign: 'center',
      marginHorizontal: theme.marginLG,
      marginBottom: theme.marginSM,
    },
    highlightText: {
      color: theme.colorPrimary,
      textDecorationLine: 'underline',
    },
    scrollButton: {
      position: 'absolute',
      top: -(theme.sizeXXL + theme.sizeSM),
      right: 0,
    },
    headerText: {
      ...FontSemiBold,
      textAlign: 'center',
      marginHorizontal: theme.paddingLG + theme.paddingXXS,
      color: theme.colorTextBase,
      fontSize: theme.fontSizeHeading4,
      lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
    },
  });
}
