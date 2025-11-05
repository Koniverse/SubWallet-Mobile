import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH } from 'constants/index';
import { useGetCurrentAuth } from 'hooks/auth/useGetCurrentAuth';
import { ChainInfo, ChainItemType } from 'types/index';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { stripUrl } from '@subwallet/extension-base/utils';
import { switchCurrentNetworkAuthorization } from 'messaging/settings';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { ModalRef } from 'types/modalRef';
import { useToast } from 'react-native-toast-notifications';

export interface SwitchNetworkAuthorizeModalProps {
  selectorRef?: React.MutableRefObject<ModalRef | undefined>;
  authUrlInfo: AuthUrlInfo;
  onComplete: (authInfo: AuthUrls) => void;
  needsTabAuthCheck?: boolean;
  renderSelectModalBtn?: (onOpenModal: React.Dispatch<React.SetStateAction<boolean>>) => JSX.Element;
}

type Props = SwitchNetworkAuthorizeModalProps & {
  onCancel: () => void;
};

const networkTypeSupported = AUTHORIZE_TYPE_SUPPORTS_NETWORK_SWITCH;

const SwitchNetworkAuthorizeModal: React.FC<Props> = ({
  selectorRef,
  authUrlInfo,
  onComplete,
  needsTabAuthCheck,
  onCancel,
  renderSelectModalBtn,
}: Props) => {
  const toast = useToast();
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

  const onSelectNetwork = useCallback(
    (item: ChainInfo) => {
      setNetworkSelected(item.slug);
      if (item.slug && item.slug !== authUrlInfo.currentNetworkMap[networkTypeSupported]) {
        const url = stripUrl(authUrlInfo.url);

        setLoading(true);

        switchCurrentNetworkAuthorization({
          networkKey: item.slug,
          authSwitchNetworkType: networkTypeSupported,
          url,
        })
          .then(({ list }) => {
            onComplete(list);
          })
          .catch(console.error)
          .finally(() => {
            onCancel();
            setLoading(false);
          });
      }
      toast.hideAll();
      toast.show('Switched network successfully');
    },
    [authUrlInfo.currentNetworkMap, authUrlInfo.url, onCancel, onComplete, toast],
  );

  useEffect(() => {
    if (needsTabAuthCheck && currentAuthByActiveTab && currentAuthByActiveTab.id !== authUrlInfo.id) {
      onCancel();
    }
  }, [authUrlInfo.id, currentAuthByActiveTab, needsTabAuthCheck, onCancel]);

  return (
    <ChainSelector
      chainSelectorRef={selectorRef}
      items={networkItems}
      selectedValueMap={{ [networkSelected]: true }}
      onSelectItem={onSelectNetwork}
      renderSelectModalBtn={renderSelectModalBtn}
      disabled={loading}
      extraData={networkSelected}
    />
  );
};

export default SwitchNetworkAuthorizeModal;
