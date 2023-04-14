import React, { useCallback, useMemo, useState } from 'react';
import { SwFullSizeModal } from 'components/design-system-ui';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import { NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ListRenderItemInfo, TouchableOpacity } from 'react-native';
import { StakingNominationItem } from 'components/common/StakingNominationItem';
import { NominationSelectorField } from 'components/Field/NominationSelector';

interface Props {
  nominators: NominationInfo[];
  selectedValue: string;
  onSelectItem: (value: string) => void;
  disabled?: boolean;
}

const searchFunction = (items: NominationInfo[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  return items.filter(({ validatorIdentity }) => validatorIdentity?.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={'No collator available'}
      isDanger={false}
    />
  );
};

export const NominationSelector = ({ nominators, selectedValue, onSelectItem }: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const selectedCollator = useMemo(() => {
    return nominators.find(item => item.validatorAddress === selectedValue);
  }, [nominators, selectedValue]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NominationInfo>) => {
      return (
        <StakingNominationItem
          nominationInfo={item}
          isSelected={item.validatorAddress === selectedValue}
          onSelectItem={value => {
            onSelectItem(value);
            setModalVisible(false);
          }}
        />
      );
    },
    [onSelectItem, selectedValue],
  );

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <NominationSelectorField label={'Select validator'} item={selectedCollator} />
      </TouchableOpacity>

      <SwFullSizeModal modalVisible={modalVisible}>
        <FlatListScreen
          autoFocus={true}
          items={nominators}
          style={FlatListScreenPaddingTop}
          title={'Select collator'}
          searchFunction={searchFunction}
          renderItem={renderItem}
          onPressBack={() => setModalVisible(false)}
          renderListEmptyComponent={renderListEmptyComponent}
          isShowFilterBtn={false}
        />
      </SwFullSizeModal>
    </>
  );
};
