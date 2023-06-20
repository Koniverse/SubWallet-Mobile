import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import { TokenBalanceItemType } from 'types/balance';
import { itemWrapperStyle } from 'screens/Home/Crypto/layers/shared';
import { TokenBalanceItem } from 'components/common/TokenBalanceItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import i18n from 'utils/i18n/i18n';

interface Props {
  onSelectItem: (item: TokenBalanceItemType) => void;
  items: TokenBalanceItemType[];
  isShowBalance: boolean;
}

const searchFunction = (items: TokenBalanceItemType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(({ symbol }) => symbol.toLowerCase().includes(lowerCaseSearchString));
};

function _TokenSearchModal({ onSelectItem, items, isShowBalance }: Props, ref: ForwardedRef<any>) {
  const theme = useSubWalletTheme().swThemes;

  const _onPressItem = useCallback(
    (item: TokenBalanceItemType) => {
      return () => {
        onSelectItem(item);
      };
    },
    [onSelectItem],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
      return (
        <View key={item.slug} style={{ paddingHorizontal: 16 }}>
          <TokenBalanceItem
            style={[itemWrapperStyle, { backgroundColor: theme.colorBgSecondary }]}
            onPress={_onPressItem(item)}
            {...item}
            isShowBalance={isShowBalance}
          />
        </View>
      );
    },
    [_onPressItem, isShowBalance, theme.colorBgSecondary],
  );

  return (
    <FullSizeSelectModal
      ref={ref}
      items={items}
      selectedValueMap={{}}
      selectModalType={'single'}
      renderCustomItem={renderItem}
      searchFunc={searchFunction}
      isShowInput={false}
      title={i18n.header.selectToken}
      placeholder={i18n.placeholder.searchToken}
      closeModalAfterSelect={true}
    />
  );
}

export const TokenSearchModal = forwardRef(_TokenSearchModal);
