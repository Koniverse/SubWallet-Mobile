import React, { useCallback } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { Warning } from 'components/Warning';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { ChainInfo } from 'types/index';
import { NetworkSelectItem } from 'components/NetworkSelectItem';

interface Props {
  modalVisible: boolean;
  onCancel: () => void;
  onSelectItem: (item: ChainInfo) => void;
  items: ChainInfo[];
  title?: string;
  acceptDefaultValue?: boolean;
  defaultValue?: string;
}

const filterFunction = (items: ChainInfo[], searchString: string) => {
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

export const ChainSelector = ({ modalVisible, onCancel, onSelectItem, items, title = i18n.title.chain }: Props) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChainInfo>) => {
      return (
        <NetworkSelectItem
          itemName={item.name}
          itemKey={item.slug}
          onSelectNetwork={() => onSelectItem(item)}
          showSeparator={false}
          iconSize={20}
        />
      );
    },
    [onSelectItem],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        autoFocus={true}
        items={items}
        style={FlatListScreenPaddingTop}
        title={title}
        isShowFilterBtn={false}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onCancel}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
