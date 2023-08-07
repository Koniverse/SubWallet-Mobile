import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ListRenderItemInfo } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { UnstakingInfo } from '@subwallet/extension-base/background/KoniTypes';
import { CancelUnstakeSelectorField } from 'components/Field/CancelUnstakeSelector';
import { CancelUnstakeItem } from 'components/common/CancelUnstakeItem';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';

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

export const CancelUnstakeSelector = ({ nominators, onSelectItem, selectedValue, disabled }: Props) => {
  const cancelUnstakeRef = useRef<ModalRef>();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.toString(), selectedValue]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<UnstakeItem>) => {
      return (
        <CancelUnstakeItem
          item={item}
          isSelected={item.key === selectedValue}
          onPress={() => {
            onSelectItem && onSelectItem(item.key);
            cancelUnstakeRef && cancelUnstakeRef.current?.onCloseModal();
          }}
        />
      );
    },
    [onSelectItem, selectedValue],
  );

  return (
    <>
      <FullSizeSelectModal
        items={items}
        selectedValueMap={selectedValue ? { [selectedValue]: true } : {}}
        selectModalType={'single'}
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
        title={i18n.header.unstakeRequest}
        disabled={disabled}
        ref={cancelUnstakeRef}
        onBackButtonPress={() => cancelUnstakeRef?.current?.onCloseModal()}
        renderSelected={() => (
          <CancelUnstakeSelectorField item={selectedItem} label={i18n.inputLabel.selectAnUnstakeRequest} />
        )}
      />
    </>
  );
};
