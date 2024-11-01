import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VoidFunction } from 'types/index';
import { SwModal, Typography } from 'components/design-system-ui';
import { ResponseGetAllTonWalletContractVersion } from '@subwallet/extension-base/types';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import { TonWalletContractItem, TonWalletContractItemType } from 'components/Item/TonWalletContract';
import { TonWalletContractVersion } from '@subwallet/keyring/types';
import { tonGetAllWalletContractVersion } from 'messaging/accounts';
import { useToast } from 'react-native-toast-notifications';

interface Props {
  address: string;
  onCancel?: VoidFunction;
  chainSlug: string;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export const TonWalletContractSelectorModal = ({ address, chainSlug, modalVisible, setModalVisible }: Props) => {
  const chainInfo = useFetchChainInfo(chainSlug);
  const toast = useToast();
  const [tonWalletContractVersionData, setTonWalletContractVersionData] =
    useState<ResponseGetAllTonWalletContractVersion | null>(null);
  const accountInfo = useGetAccountByAddress(address);
  const [selectedContractVersion, setSelectedContractVersion] = useState<TonWalletContractVersion | undefined>(
    accountInfo ? (accountInfo.tonContractVersion as TonWalletContractVersion) : undefined,
  );

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

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      isUseModalV2
      modalTitle={'Wallet address & version'}
      titleTextAlign={'center'}>
      <Typography.Text>
        <Typography.Text>{'TON wallets have '}</Typography.Text>
        <Typography.Text>{'multiple versions'}</Typography.Text>
        <Typography.Text>
          {', each with its own wallet address and balance. Select a version with the address you want to get'}
        </Typography.Text>
      </Typography.Text>

      {resultList.map(item => (
        <TonWalletContractItem {...item} onPress={onPressItem(item.version)} />
      ))}
    </SwModal>
  );
};
