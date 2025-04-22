import React, { useCallback, useContext, useEffect } from 'react';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { Keyboard, ListRenderItemInfo } from 'react-native';
import { ModalRef } from 'types/modalRef';
import { AccountChainAddress } from 'types/account';
import useGetAccountChainAddresses from 'hooks/account/useGetAccountChainAddresses';
import { AccountProxy } from '@subwallet/extension-base/types';
import { AccountChainAddressItem } from 'components/common/SelectModal/parts/AccountChainAddressItem';
import { AppModalContext } from 'providers/AppModalContext';
import { VoidFunction } from 'types/index';
import useHandleTonAccountWarning from 'hooks/account/useHandleTonAccountWarning';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TON_CHAINS } from '@subwallet/extension-base/services/earning-service/constants';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';

interface Props {
  accountProxy: AccountProxy;
  selectedValueMap: Record<string, boolean>;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  accountSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  onCancel: VoidFunction;
}

export const AccountChainAddressesSelector = ({
  accountProxy,
  selectedValueMap,
  disabled,
  renderSelected,
  accountSelectorRef,
  closeModalAfterSelect,
  isShowContent,
  isShowInput,
  children,
  onCancel: _onCancel,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const onHandleTonAccountWarning = useHandleTonAccountWarning(() => {
    accountSelectorRef?.current?.closeModal?.();
  });
  const { addressQrModal, selectAddressFormatModal } = useContext(AppModalContext);
  const toast = useToast();
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();

  const openSelectAddressFormatModal = useCallback(
    (item: AccountChainAddress) => {
      selectAddressFormatModal.setSelectAddressFormatModalState({
        visible: true,
        name: item.name,
        address: item.address,
        chainSlug: item.slug,
        onBack: selectAddressFormatModal.hideSelectAddressFormatModal,
        navigation: navigation,
      });
    },
    [navigation, selectAddressFormatModal],
  );

  const onShowQr = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        Keyboard.dismiss();
        const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);
        const processFunction = () => {
          addressQrModal.setAddressQrModal({
            visible: true,
            address: item.address,
            selectNetwork: item.slug,
            onBack: addressQrModal.hideAddressQrModal,
            navigation: navigation,
          });
        };

        if (isPolkadotUnifiedChain) {
          openSelectAddressFormatModal(item);
        } else {
          setTimeout(() => {
            onHandleTonAccountWarning(item.accountType, processFunction);
          }, 300);
        }
      };
    },
    [addressQrModal, checkIsPolkadotUnifiedChain, navigation, onHandleTonAccountWarning, openSelectAddressFormatModal],
  );

  const onPressCopyBtn = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        Keyboard.dismiss();
        const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

        const processFunction = () => {
          toast.hideAll();
          toast.show(i18n.common.copiedToClipboard);
          Clipboard.setString(item.address);
        };

        if (isPolkadotUnifiedChain) {
          openSelectAddressFormatModal(item);
        } else {
          onHandleTonAccountWarning(item.accountType, processFunction);
        }
      };
    },
    [checkIsPolkadotUnifiedChain, onHandleTonAccountWarning, openSelectAddressFormatModal, toast],
  );

  const onPressInfoButton = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        Keyboard.dismiss();
        setTimeout(() => openSelectAddressFormatModal(item), 100);
      };
    },
    [openSelectAddressFormatModal],
  );

  const renderCustomItem = ({ item }: ListRenderItemInfo<AccountChainAddress>) => {
    const isPolkadotUnifiedChain = checkIsPolkadotUnifiedChain(item.slug);

    return (
      <AccountChainAddressItem
        key={item.slug}
        item={item}
        onPressQrButton={onShowQr(item)}
        onPressCopyButton={onPressCopyBtn(item)}
        onPress={onShowQr(item)}
        isShowInfoButton={isPolkadotUnifiedChain}
        onPressInfoButton={onPressInfoButton(item)}
      />
    );
  };

  const searchFunc = useCallback((currentItems: AccountChainAddress[], searchString: string) => {
    return currentItems.filter(item => {
      return item.name.toLowerCase().includes(searchString.toLowerCase());
    });
  }, []);

  useEffect(() => {
    if (addressQrModal.addressModalState.visible) {
      addressQrModal.setAddressQrModal(prev => {
        if (!prev || !TON_CHAINS.includes(prev.selectNetwork || '')) {
          return prev;
        }

        const targetAddress = items.find(i => i.slug === prev.selectNetwork)?.address;

        if (!targetAddress) {
          return prev;
        }

        return {
          ...prev,
          address: targetAddress,
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, addressQrModal.addressModalState.visible]);

  return (
    <>
      <FullSizeSelectModal
        items={items}
        selectedValueMap={selectedValueMap}
        selectModalType={'single'}
        disabled={disabled}
        flatListStyle={{ paddingHorizontal: theme.padding }}
        renderSelected={renderSelected}
        placeholder={'Enter network name'}
        title={'Select address'}
        ref={accountSelectorRef}
        closeModalAfterSelect={closeModalAfterSelect}
        isShowContent={isShowContent}
        renderCustomItem={renderCustomItem}
        searchFunc={searchFunc}
        keyExtractor={item => item.slug}
        estimatedItemSize={60}
        isShowInput={isShowInput}>
        {children}
      </FullSizeSelectModal>
    </>
  );
};
