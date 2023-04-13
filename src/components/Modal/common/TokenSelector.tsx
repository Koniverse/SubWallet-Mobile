import React, { useCallback, useEffect } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { Warning } from 'components/Warning';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenSelectItem } from 'components/TokenSelectItem';

export type TokenItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
};

interface Props {
  modalVisible: boolean;
  onCancel: () => void;
  onSelectItem: (item: TokenItemType) => void;
  items: TokenItemType[];
  title?: string;
  acceptDefaultValue?: boolean;
  defaultValue?: string;
}

const filterFunction = (items: TokenItemType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(({ name }) => name.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={i18n.warningMessage.noTokenAvailable}
      isDanger={false}
    />
  );
};

export const TokenSelector = ({
  modalVisible,
  onCancel,
  onSelectItem,
  items,
  title = i18n.title.token,
  acceptDefaultValue,
  defaultValue,
}: Props) => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  useEffect(() => {
    if (acceptDefaultValue) {
      if (!defaultValue) {
        onSelectItem(items[0]);
      } else {
        const existed = items.find(item => item.slug === defaultValue);

        if (!existed) {
          onSelectItem(items[0]);
        } else {
          onSelectItem(existed);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TokenItemType>) => {
      const { symbol, name, originChain } = item;

      return (
        <TokenSelectItem
          key={`${symbol}-${originChain}`}
          itemName={`${name} (${chainInfoMap[originChain]?.name || ''})`}
          logoKey={symbol.toLowerCase()}
          subLogoKey={originChain}
          isSelected={false}
          onSelectNetwork={() => onSelectItem(item)}
        />
      );
    },
    [chainInfoMap, onSelectItem],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        autoFocus={true}
        items={items}
        style={FlatListScreenPaddingTop}
        title={title}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onCancel}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
