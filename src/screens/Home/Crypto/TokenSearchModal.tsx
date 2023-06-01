import React, { useCallback } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { TokenBalanceItemType } from 'types/balance';
import { itemWrapperStyle } from 'screens/Home/Crypto/layers/shared';
import { TokenBalanceItem } from 'components/common/TokenBalanceItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EmptyList } from 'components/EmptyList';
import { Coins } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  onCancel: () => void;
  onSelectItem: (item: TokenBalanceItemType) => void;
  items: TokenBalanceItemType[];
  isShowBalance: boolean;
}

const listStyle = { paddingHorizontal: 16 };

const filterFunction = (items: TokenBalanceItemType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(({ symbol }) => symbol.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <EmptyList icon={Coins} title={i18n.emptyScreen.tokenEmptyTitle} message={i18n.emptyScreen.tokenEmptyMessage} />
  );
};

export const TokenSearchModal = ({ modalVisible, onCancel, onSelectItem, items, isShowBalance }: Props) => {
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
        <View key={item.slug} style={[itemWrapperStyle, { backgroundColor: theme.colorBgSecondary }]}>
          <TokenBalanceItem onPress={_onPressItem(item)} {...item} isShowBalance={isShowBalance} />
        </View>
      );
    },
    [_onPressItem, isShowBalance, theme.colorBgSecondary],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        autoFocus={true}
        items={items}
        isShowFilterBtn={false}
        flatListStyle={listStyle}
        style={FlatListScreenPaddingTop}
        title={i18n.header.selectToken}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onCancel}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
