import React, { useCallback } from 'react';
import { ListRenderItemInfo } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

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
  tokenSelectorRef?: React.Ref<any>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<TokenItemType>) => JSX.Element;
  defaultValue?: string;
  acceptDefaultValue?: boolean;
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
}: Props) => {
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);

  const searchFunc = useCallback(
    (_items: TokenItemType[], searchString: string) => {
      const lowerCaseSearchString = searchString.toLowerCase();

      return (_items as TokenItemType[]).filter(
        ({ symbol, originChain }) =>
          symbol.toLowerCase().includes(lowerCaseSearchString) ||
          chainInfoMap[originChain]?.name?.toLowerCase().includes(lowerCaseSearchString),
      );
    },
    [chainInfoMap],
  );

  return (
    <FullSizeSelectModal
      items={items}
      selectedValueMap={selectedValueMap}
      selectModalType={'single'}
      selectModalItemType={'token'}
      searchFunc={searchFunc}
      title={i18n.header.selectToken}
      onSelectItem={onSelectItem}
      ref={tokenSelectorRef}
      renderSelected={renderSelected}
      placeholder={i18n.placeholder.searchToken}
      closeModalAfterSelect={closeModalAfterSelect}
      isShowContent={isShowContent}
      isShowInput={isShowInput}
      renderCustomItem={renderCustomItem}
      defaultValue={defaultValue}
      acceptDefaultValue={acceptDefaultValue}
      disabled={disabled}>
      {children}
    </FullSizeSelectModal>
  );
};
