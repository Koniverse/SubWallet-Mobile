import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH } from 'constants/index';
import { useGetCurrentAuth } from 'hooks/auth/useGetCurrentAuth';
import { ChainItemType } from 'types/index';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { stripUrl } from '@subwallet/extension-base/utils';
import { switchCurrentNetworkAuthorization } from 'messaging/settings';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { NetworkField } from 'components/Field/Network';
import i18n from 'utils/i18n/i18n';

export interface SwitchNetworkAuthorizeModalProps {
  authUrlInfo: AuthUrlInfo;
  onComplete: (authInfo: AuthUrls) => void;
  needsTabAuthCheck?: boolean;
}

type Props = SwitchNetworkAuthorizeModalProps & {
  onCancel: () => void;
};

const networkTypeSupported = AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH;

const SwitchNetworkAuthorizeModal: React.FC<Props> = ({
  authUrlInfo,
  onComplete,
  needsTabAuthCheck,
  onCancel,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [loading, setLoading] = useState(false);
  const [networkSelected, setNetworkSelected] = useState(authUrlInfo.currentNetworkMap[networkTypeSupported] || '');
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const currentAuthByActiveTab = useGetCurrentAuth();

  const networkItems = useMemo(() => {
    return Object.values(chainInfoMap).reduce<ChainItemType[]>((acc, chainInfo) => {
      if (_isChainEvmCompatible(chainInfo) && networkTypeSupported === 'evm') {
        acc.push({ name: chainInfo.name, slug: chainInfo.slug });
      }

      return acc;
    }, []);
  }, [chainInfoMap]);

  const onSelectNetwork = useCallback(selectedNetwork => {
    setNetworkSelected(selectedNetwork);
  }, []);

  useEffect(() => {
    let isSync = true;

    if (networkSelected && networkSelected !== authUrlInfo.currentNetworkMap[networkTypeSupported]) {
      const url = stripUrl(authUrlInfo.url);

      if (isSync) {
        setLoading(true);
      }

      switchCurrentNetworkAuthorization({
        networkKey: networkSelected,
        authSwitchNetworkType: networkTypeSupported,
        url,
      })
        .then(({ list }) => {
          onComplete(list);
        })
        .catch(console.error)
        .finally(() => {
          onCancel();

          if (isSync) {
            setNetworkSelected('');
            setLoading(false);
          }
        });
    }

    return () => {
      isSync = false;
    };
  }, [authUrlInfo, networkSelected, onCancel, onComplete]);

  useEffect(() => {
    if (needsTabAuthCheck && currentAuthByActiveTab && currentAuthByActiveTab.id !== authUrlInfo.id) {
      onCancel();
    }
  }, [authUrlInfo.id, currentAuthByActiveTab, needsTabAuthCheck, onCancel]);

  const renderSelected = useCallback(() => {
    return (
      <NetworkField
        networkKey={networkSelected}
        outerStyle={{ marginBottom: 0 }}
        placeholder={i18n.placeholder.selectChain}
        showIcon
        disabled={loading}
      />
    );
  }, [loading, networkSelected]);

  return (
    <ChainSelector
      items={networkItems}
      selectedValueMap={{}}
      onSelectItem={onSelectNetwork}
      renderSelected={renderSelected}
    />
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({});
}

export default SwitchNetworkAuthorizeModal;
