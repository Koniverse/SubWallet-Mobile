// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainConnectionStatus } from '@subwallet/extension-base/services/chain-service/types';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useToast } from 'react-native-toast-notifications';
import { enableChain, updateAssetSetting } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { AppModalContext } from 'providers/AppModalContext';

export default function useAssetChecker() {
  const { chainInfoMap, chainStateMap, chainStatusMap } = useSelector((root: RootState) => root.chainStore);
  const { assetRegistry, assetSettingMap } = useSelector((root: RootState) => root.assetRegistry);
  const [enablingAsset, setEnablingAsset] = useState<string | null>(null);
  const asset = useRef<string | null>(null);
  const { hideAll, show } = useToast();
  const { confirmModal } = useContext(AppModalContext);

  useEffect(() => {
    if (enablingAsset && assetSettingMap[enablingAsset]?.visible) {
      const assetInfo = assetRegistry[enablingAsset];
      const message = `${assetInfo?.symbol} is turned on.`;

      hideAll();
      show(message, { type: 'success' });
      setEnablingAsset(null);
    }
  }, [enablingAsset, chainInfoMap, chainStateMap, assetSettingMap, assetRegistry, hideAll, show]);

  return useCallback(
    (assetSlug: string) => {
      if (asset.current === assetSlug) {
        return;
      }

      asset.current = assetSlug;
      const assetSetting = assetSettingMap[assetSlug];
      const assetInfo = assetRegistry[assetSlug];
      const chainState = chainStateMap[assetInfo.originChain];
      const chainInfo = chainInfoMap[assetInfo.originChain];
      const chainStatus = chainStatusMap[assetInfo.originChain];

      if ((assetInfo && !assetSetting) || !assetSetting.visible) {
        const message = `${assetInfo?.symbol} on ${chainInfo?.name} is not ready to use, do you want to turn it on?`;

        const _onEnabled = () => {
          updateAssetSetting({
            tokenSlug: assetSlug,
            assetSetting: { visible: true },
            autoEnableNativeToken: true,
          })
            .then(() => {
              setEnablingAsset(assetSlug);
              hideAll();
              show(`${assetInfo?.symbol} is turning on.`, { type: 'success' });
            })
            .catch(console.error);
        };

        setTimeout(() => {
          confirmModal.setConfirmModal({
            visible: true,
            completeBtnTitle: i18n.buttonTitles.enable,
            message: message,
            title: i18n.common.enableChain,
            onCancelModal: () => {
              confirmModal.hideConfirmModal();
            },
            onCompleteModal: () => {
              _onEnabled();
              setTimeout(() => confirmModal.hideConfirmModal(), 300);
            },
            messageIcon: assetInfo.originChain,
          });
        }, 700);
      } else if (!!assetSetting?.visible && !chainState?.active) {
        enableChain(assetInfo.originChain, false).catch(console.error);
      } else if (chainStatus && chainStatus.connectionStatus === _ChainConnectionStatus.DISCONNECTED) {
        const message = `Chain ${chainInfo?.name} is disconnected`;

        hideAll();
        show(message, { type: 'danger' });
      }
    },
    [assetRegistry, assetSettingMap, chainInfoMap, chainStateMap, chainStatusMap, confirmModal, hideAll, show],
  );
}
