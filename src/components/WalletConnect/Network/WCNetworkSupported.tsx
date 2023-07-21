import React, { useMemo, useRef } from 'react';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { WCNetworkInput } from 'components/WalletConnect/Network/WCNetworkInput';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { WCNetworkItem } from 'components/WalletConnect/Network/WCNetworkItem';

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
      ref={modalRef}
      items={networks}
      titleTextAlign={'center'}
      title={'Supported networks'}
      selectedValueMap={supportedNetworksMap}
      isShowInput={true}
      disabled={!networkNumber}
      renderSelected={() => (
        <WCNetworkInput networks={networks} content={`${networkNumber} networks support`} onPress={() => {}} />
      )}
      beforeListItem={
        <Typography.Text
          style={{
            ...FontSemiBold,
            color: theme.colorWhite,
            paddingBottom: theme.paddingXS,
          }}>{`${networkNumber} networks support`}</Typography.Text>
      }
      renderCustomItem={renderItem}
    />
  );
};
