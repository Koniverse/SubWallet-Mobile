import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { MoreOptionItemType, MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import React, { useCallback, useMemo, useRef } from 'react';
import { ArrowsLeftRight, Plugs, PlugsConnected, Shield, ShieldSlash, X } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { changeAuthorization, forgetSite, toggleAuthorization } from 'messaging/settings';
import { updateAuthUrls } from 'stores/updater';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { ModalRef } from 'types/modalRef';
import SwitchNetworkAuthorizeModal from 'components/Modal/SwitchNetworkAuthorizeModal';

interface Props {
  authInfo: AuthUrlInfo;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export const DAppConfigurationModal: React.FC<Props> = ({ authInfo, navigation, setModalVisible, modalVisible }) => {
  const chainSelectorRef = useRef<ModalRef>();
  const theme = useSubWalletTheme().swThemes;

  const dAppAccessDetailMoreOptions: MoreOptionItemType[] = useMemo(() => {
    const isAllowed = authInfo.isAllowed;
    const isEvmAuthorize = authInfo.accountAuthTypes.includes('evm');

    const options = [
      {
        key: 'forgetSite',
        icon: X,
        backgroundColor: theme['yellow-6'],
        name: i18n.common.forgetSite,
        onPress: () => {
          forgetSite(authInfo.id, updateAuthUrls).catch(console.error);
          navigation.canGoBack() && navigation.goBack();
        },
      },
    ];

    if (isAllowed) {
      options.push(
        {
          key: 'disconnectAll',
          icon: Plugs,
          name: i18n.common.disconnectAll,
          // @ts-ignore
          backgroundColor: theme['gray-3'],
          onPress: () => {
            changeAuthorization(false, authInfo.id, updateAuthUrls).catch(console.error);
            setModalVisible(false);
          },
        },
        {
          key: 'connectAll',
          icon: PlugsConnected,
          name: i18n.common.connectAll,
          backgroundColor: theme['green-6'],
          onPress: () => {
            changeAuthorization(true, authInfo.id, updateAuthUrls).catch(console.error);
            setModalVisible(false);
          },
        },
      );
    }

    if (isEvmAuthorize) {
      options.push({
        key: 'switchNetwork',
        name: 'Switch network',
        icon: ArrowsLeftRight,
        // @ts-ignore
        backgroundColor: theme['geekblue-6'],
        onPress: () => {
          chainSelectorRef?.current?.onOpenModal();
        },
      });
    }

    options.push({
      key: 'blockOrUnblock',
      name: isAllowed ? i18n.common.block : i18n.common.unblock,
      icon: isAllowed ? ShieldSlash : Shield,
      // @ts-ignore
      backgroundColor: isAllowed ? theme['red-6'] : theme['green-6'],
      onPress: () => {
        toggleAuthorization(authInfo.id)
          .then(({ list }) => {
            updateAuthUrls(list);
          })
          .catch(console.error);
        setModalVisible(false);
      },
    });

    return options;
  }, [authInfo.isAllowed, authInfo.accountAuthTypes, authInfo.id, theme, navigation, setModalVisible]);

  const onComplete = useCallback((list: AuthUrls) => {
    updateAuthUrls(list);
  }, []);

  return (
    <>
      <MoreOptionModal
        modalVisible={modalVisible}
        moreOptionList={dAppAccessDetailMoreOptions}
        setModalVisible={setModalVisible}
      />

      <SwitchNetworkAuthorizeModal
        selectorRef={chainSelectorRef}
        onComplete={onComplete}
        authUrlInfo={authInfo}
        onCancel={() => chainSelectorRef?.current?.onCloseModal()}
        needsTabAuthCheck={true}
      />
    </>
  );
};
