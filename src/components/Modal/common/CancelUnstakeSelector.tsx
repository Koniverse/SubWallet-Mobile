import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, TouchableOpacity } from 'react-native';
import { SwFullSizeModal } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { UnstakingInfo } from '@subwallet/extension-base/background/KoniTypes';
import { CancelUnstakeSelectorField } from 'components/Field/CancelUnstakeSelector';
import { CancelUnstakeItem } from 'components/common/CancelUnstakeItem';

export interface UnstakeItem extends UnstakingInfo {
  key: string;
}

interface Props {
  chain: string;
  nominators: UnstakingInfo[];
  onSelectItem?: (value: string) => void;
  selectedValue?: string;
  disabled?: boolean;
}

const searchFunction = (items: UnstakeItem[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  return items.filter(({ chain }) => chain?.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={'No pool available'}
      isDanger={false}
    />
  );
};

export const CancelUnstakeSelector = ({ nominators, onSelectItem, selectedValue, disabled }: Props) => {
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const items = useMemo((): UnstakeItem[] => {
    return nominators.map((item, index) => ({ ...item, key: String(index) }));
  }, [nominators]);

  const selectedItem = useMemo(() => {
    return items.find(item => item.key === selectedValue);
  }, [items, selectedValue]);

  useEffect(() => {
    if (!selectedValue) {
      onSelectItem && onSelectItem(items[0]?.key || '');
    } else {
      const existed = items.find(item => item.key === selectedValue);

      if (!existed) {
        onSelectItem && onSelectItem(items[0]?.key || '');
      }
    }
  }, [items, selectedValue, onSelectItem]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<UnstakeItem>) => {
      return (
        <CancelUnstakeItem
          item={item}
          isSelected={item.key === selectedValue}
          onPress={() => {
            onSelectItem && onSelectItem(item.key);
            setSelectModalVisible(false);
          }}
        />
      );
    },
    [onSelectItem, selectedValue],
  );

  return (
    <>
      <TouchableOpacity onPress={() => setSelectModalVisible(true)} disabled={disabled}>
        <CancelUnstakeSelectorField item={selectedItem} label={'Select unstake request'} />
      </TouchableOpacity>

      <SwFullSizeModal modalVisible={selectModalVisible}>
        <FlatListScreen
          autoFocus={true}
          items={items}
          style={FlatListScreenPaddingTop}
          title={'Unstake request'}
          searchFunction={searchFunction}
          renderItem={renderItem}
          onPressBack={() => setSelectModalVisible(false)}
          renderListEmptyComponent={renderListEmptyComponent}
          isShowFilterBtn={false}
        />
      </SwFullSizeModal>
    </>
  );
};
