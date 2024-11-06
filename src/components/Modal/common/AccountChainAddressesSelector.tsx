import React, { useCallback, useContext } from 'react';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ListRenderItemInfo } from 'react-native';
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

interface Props {
  accountProxy: AccountProxy;
  selectedValueMap: Record<string, boolean>;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  accountSelectorRef?: React.MutableRefObject<ModalRef>;
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
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const items: AccountChainAddress[] = useGetAccountChainAddresses(accountProxy);
  const onHandleTonAccountWarning = useHandleTonAccountWarning(() => {
    accountSelectorRef?.current?.closeModal?.();
  });
  const { addressQrModal } = useContext(AppModalContext);
  const toast = useToast();

  const onShowQr = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        const processFunction = () => {
          addressQrModal.setAddressQrModal({
            visible: true,
            address: item.address,
            selectNetwork: item.slug,
            onBack: addressQrModal.hideAddressQrModal,
          });
        };

        onHandleTonAccountWarning(item.accountType, processFunction);
      };
    },
    [addressQrModal, onHandleTonAccountWarning],
  );

  const onPressCopyBtn = useCallback(
    (item: AccountChainAddress) => {
      return () => {
        const processFunction = () => {
          toast.hideAll();
          toast.show(i18n.common.copiedToClipboard);
          Clipboard.setString(item.address);
        };

        onHandleTonAccountWarning(item.accountType, processFunction);
      };
    },
    [onHandleTonAccountWarning, toast],
  );

  const renderCustomItem = ({ item }: ListRenderItemInfo<AccountChainAddress>) => {
    return (
      <AccountChainAddressItem
        key={item.slug}
        item={item}
        onPressQrButton={onShowQr(item)}
        onPressCopyButton={onPressCopyBtn(item)}
        onPress={onShowQr(item)}
      />
    );
  };

  const searchFunc = useCallback((currentItems: AccountChainAddress[], searchString: string) => {
    return currentItems.filter(item => {
      return item.name.toLowerCase().includes(searchString.toLowerCase());
    });
  }, []);

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
