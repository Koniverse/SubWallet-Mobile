import React, { useCallback, useEffect } from 'react';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ListRenderItemInfo } from '@shopify/flash-list';

export type TokenItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
};

interface Props {
  items: TokenItemType[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: TokenItemType) => void;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  tokenSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<TokenItemType>) => JSX.Element;
  defaultValue?: string;
  acceptDefaultValue?: boolean;
  onCloseAccountSelector?: () => void;
  showAddBtn?: boolean;
}

export const TokenSelector = ({
  items,
  selectedValueMap,
  onSelectItem,
  disabled,
  renderSelected,
  tokenSelectorRef,
  closeModalAfterSelect,
  isShowContent,
  isShowInput,
  children,
  renderCustomItem,
  defaultValue,
  acceptDefaultValue,
  onCloseAccountSelector,
  showAddBtn = true,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  useEffect(() => {
    setAdjustPan();
  }, []);

  const _onSelectItem = (item: TokenItemType) => {
    onSelectItem && onSelectItem(item);
  };

  const renderListEmptyComponent = useCallback(() => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
        addBtnLabel={showAddBtn ? i18n.header.importToken : undefined}
        onPressAddBtn={
          showAddBtn
            ? () => {
                onCloseAccountSelector && onCloseAccountSelector();
                tokenSelectorRef?.current?.onCloseModal();
                navigation.navigate('ImportToken');
              }
            : undefined
        }
      />
    );
  }, [navigation, onCloseAccountSelector, showAddBtn, tokenSelectorRef]);

  return (
    <FullSizeSelectModal
      items={items}
      selectedValueMap={selectedValueMap}
      selectModalType={'single'}
      selectModalItemType={'token'}
      title={i18n.header.selectToken}
      onSelectItem={_onSelectItem}
      ref={tokenSelectorRef}
      renderSelected={renderSelected}
      placeholder={i18n.placeholder.searchToken}
      closeModalAfterSelect={closeModalAfterSelect}
      isShowContent={isShowContent}
      isShowInput={isShowInput}
      renderCustomItem={renderCustomItem}
      defaultValue={defaultValue}
      acceptDefaultValue={acceptDefaultValue}
      renderListEmptyComponent={renderListEmptyComponent}
      disabled={disabled}>
      {children}
    </FullSizeSelectModal>
  );
};
