import React, { useCallback } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import { TokenBalanceItemType } from 'types/balance';
import { itemWrapperStyle } from 'screens/Home/Crypto/layers/shared';
import { TokenBalanceItem } from 'components/common/TokenBalanceItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { EmptyList } from 'components/EmptyList';
import { Coins } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props {
  onSelectItem: (item: TokenBalanceItemType) => void;
  items: TokenBalanceItemType[];
  isShowBalance: boolean;
  tokenSearchRef: React.MutableRefObject<ModalRef | undefined>;
}

const searchFunction = (items: TokenBalanceItemType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(({ symbol }) => symbol.toLowerCase().includes(lowerCaseSearchString));
};

export const TokenSearchModal = ({ onSelectItem, items, isShowBalance, tokenSearchRef }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();

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
      ref={tokenSearchRef}
      items={items}
      selectedValueMap={{}}
      selectModalType={'single'}
      renderCustomItem={renderItem}
      searchFunc={searchFunction}
      isShowInput={false}
      title={i18n.header.selectToken}
      placeholder={i18n.placeholder.searchToken}
      closeModalAfterSelect={true}
      renderListEmptyComponent={() => (
        <EmptyList
          icon={Coins}
          title={i18n.emptyScreen.tokenEmptyTitle}
          message={i18n.emptyScreen.tokenEmptyMessage}
          addBtnLabel={i18n.header.importToken}
          onPressAddBtn={() => {
            tokenSearchRef?.current?.onCloseModal();
            navigation.navigate('ImportToken');
          }}
        />
      )}
    />
  );
};
