import React, { useMemo, useRef } from 'react';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { WCNetworkInput } from 'components/WalletConnect/Network/WCNetworkInput';
import { ModalRef } from 'types/modalRef';
import { WCNetworkItem } from 'components/WalletConnect/Network/WCNetworkItem';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

interface Props {
  networks: WalletConnectChainInfo[];
}

export const WCNetworkSelected = ({ networks }: Props) => {
  const modalRef = useRef<ModalRef>();
  const theme = useSubWalletTheme().swThemes;
  const connectedNetworks = useMemo(() => networks.filter(network => network.supported), [networks]);
  const connectedNetworksMap = useMemo(() => {
    return connectedNetworks.reduce((o, key) => Object.assign(o, { [key.slug]: key.supported }), {});
  }, [connectedNetworks]);

  const showNetworks = useMemo((): WalletConnectChainInfo[] => {
    const _connectedNetworks = networks.filter(network => network.supported);
    const unSupportNetworks = networks.filter(network => !network.supported);

    const unSupportNetwork: WalletConnectChainInfo | null = unSupportNetworks.length
      ? {
          supported: false,
          chainInfo: {
            slug: '',
            name:
              unSupportNetworks.length <= 1
                ? i18n.message.unknownNetwork
                : i18n.formatString(i18n.message.unknownNetworks, unSupportNetworks.length),
          },
          slug: '',
        }
      : null;

    return [..._connectedNetworks, ...(unSupportNetwork ? [unSupportNetwork] : [])];
  }, [networks]);

  const renderItem = (item: WalletConnectChainInfo) => {
    return <WCNetworkItem item={item} selectedValueMap={connectedNetworksMap} />;
  };

  const networkNumber = connectedNetworks.length;
  return (
    <BasicSelectModal
      ref={modalRef}
      isUseModalV2={false}
      items={showNetworks}
      titleTextAlign={'center'}
      title={i18n.header.selectNetwork}
      selectedValueMap={connectedNetworksMap}
      isShowInput={true}
      isUseForceHidden={false}
      onBackButtonPress={() => modalRef?.current?.onCloseModal()}
      renderSelected={() => (
        <WCNetworkInput
          networks={connectedNetworks}
          content={
            networkNumber === 1
              ? i18n.message.connectedOneNetworkConnected
              : (i18n.formatString(i18n.message.connectedNetworkConnected, networkNumber) as string)
          }
          onPress={() => {}}
        />
      )}
      disabled={!networkNumber}
      beforeListItem={
        <Typography.Text
          style={{
            ...FontSemiBold,
            color: theme.colorWhite,
            paddingBottom: theme.paddingXS,
          }}>
          {networkNumber === 1
            ? i18n.message.connectedOneNetworkConnected
            : (i18n.formatString(i18n.message.connectedNetworkConnected, networkNumber) as string)}
        </Typography.Text>
      }
      renderCustomItem={renderItem}
    />
  );
};
