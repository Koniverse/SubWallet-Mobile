import React, { useEffect, useMemo } from 'react';
import { ListRenderItemInfo } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import BigN from 'bignumber.js';
import useAccountBalance from 'hooks/screen/useAccountBalance';
import useChainAssets from 'hooks/chain/useChainAssets';
import { _getMultiChainAsset, _isAssetFungibleToken } from '@subwallet/extension-base/services/chain-service/utils';
import { sortTokenByValue } from 'utils/sort/token';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export type TokenItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
  free?: BigN;
  price?: number;
  decimals?: number;
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
  isShowBalance?: boolean;
  selectedAccount?: string;
}

const convertChainActivePriority = (active?: boolean) => (active ? 1 : 0);

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
  isShowBalance,
  selectedAccount,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  useEffect(() => {
    setAdjustPan();
  }, []);
  const { chainStateMap } = useSelector((state: RootState) => state.chainStore);
  const assetRegistry = useChainAssets({}).chainAssetRegistry;

  const tokenGroupMap = useMemo(() => {
    return Object.values(assetRegistry).reduce((_tokenGroupMap: Record<string, string[]>, chainAsset) => {
      const multiChainAsset = _getMultiChainAsset(chainAsset);
      const tokenGroupKey = multiChainAsset || chainAsset.slug;

      if (_tokenGroupMap[tokenGroupKey]) {
        _tokenGroupMap[tokenGroupKey].push(chainAsset.slug);
      } else {
        _tokenGroupMap[tokenGroupKey] = [chainAsset.slug];
      }

      return _tokenGroupMap;
    }, {});
  }, [assetRegistry]);

  const { tokenBalanceMap } = useAccountBalance(tokenGroupMap, true, true, selectedAccount);

  const filteredItems = useMemo((): TokenItemType[] => {
    const raw = items.filter(item => {
      const chainAsset = assetRegistry[item.slug];

      return chainAsset ? _isAssetFungibleToken(chainAsset) : false;
    });

    isShowBalance &&
      raw.sort((a, b) => {
        return sortTokenByValue(tokenBalanceMap[a.slug], tokenBalanceMap[b.slug]);
      });

    raw.sort((a, b) => {
      return (
        convertChainActivePriority(chainStateMap[b.originChain]?.active) -
        convertChainActivePriority(chainStateMap[a.originChain]?.active)
      );
    });

    return raw;
  }, [assetRegistry, chainStateMap, isShowBalance, items, tokenBalanceMap]);

  const _onSelectItem = (item: TokenItemType) => {
    onSelectItem && onSelectItem(item);
  };

  return (
    <FullSizeSelectModal
      items={filteredItems}
      selectedValueMap={selectedValueMap}
      onBackButtonPress={() => tokenSelectorRef?.current?.onCloseModal()}
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
      isShowBalance={isShowBalance}
      tokenBalanceMap={tokenBalanceMap}
      renderListEmptyComponent={() => {
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
      }}
      disabled={disabled}>
      {children}
    </FullSizeSelectModal>
  );
};
