import React, { useMemo, useRef } from 'react';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { WCNetworkInput } from 'components/WalletConnect/Network/WCNetworkInput';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { WCNetworkItem } from 'components/WalletConnect/Network/WCNetworkItem';
import i18n from 'utils/i18n/i18n';

interface Props {
  networks: WalletConnectChainInfo[];
}

export const WCNetworkSupported = ({ networks }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const modalRef = useRef<ModalRef>();
  const supportedNetworksMap = useMemo(() => {
    return networks.reduce((o, key) => Object.assign(o, { [key.slug]: key.supported }), {});
  }, [networks]);

  const renderItem = (item: WalletConnectChainInfo) => {
    return <WCNetworkItem item={item} selectedValueMap={supportedNetworksMap} />;
  };

  const networkNumber = networks.length;
  return (
    <BasicSelectModal
      isUseModalV2={false}
      ref={modalRef}
      items={networks}
      isUseForceHidden={false}
      titleTextAlign={'center'}
      title={i18n.message.supportedNetworks}
      selectedValueMap={supportedNetworksMap}
      isShowInput={true}
      disabled={!networkNumber}
      renderSelected={() => (
        <WCNetworkInput networks={networks} content={i18n.message.networkSupported(networkNumber)} onPress={() => {}} />
      )}
      beforeListItem={
        <Typography.Text
          style={{
            ...FontSemiBold,
            color: theme.colorWhite,
            paddingBottom: theme.paddingXS,
          }}>
          {i18n.message.networkSupported(networkNumber)}
        </Typography.Text>
      }
      renderCustomItem={renderItem}
    />
  );
};
