import React, { useCallback, useMemo, useRef } from 'react';
import i18n from 'utils/i18n/i18n';
import { NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ListRenderItemInfo } from 'react-native';
import { StakingNominationItem } from 'components/common/StakingNominationItem';
import { NominationSelectorField } from 'components/Field/NominationSelector';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { YieldPoolInfo } from '@subwallet/extension-base/types';

interface Props {
  nominators: NominationInfo[];
  selectedValue: string;
  onSelectItem: (value: string) => void;
  disabled?: boolean;
  label: string;
  poolInfo: YieldPoolInfo;
}

const searchFunction = (items: NominationInfo[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  return items.filter(({ validatorIdentity, validatorAddress }) => {
    return (
      validatorIdentity?.toLowerCase().includes(lowerCaseSearchString) ||
      validatorAddress?.toLowerCase().includes(lowerCaseSearchString)
    );
  });
};

export const NominationSelector = ({ nominators, selectedValue, onSelectItem, disabled, label, poolInfo }: Props) => {
  const collatorRef = useRef<ModalRef>();
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
            collatorRef?.current?.onCloseModal();
          }}
          poolInfo={poolInfo}
        />
      );
    },
    [onSelectItem, poolInfo, selectedValue],
  );

  return (
    <>
      <FullSizeSelectModal
        items={nominators}
        selectedValueMap={selectedCollator ? { [selectedCollator.validatorAddress]: true } : {}}
        selectModalType={'single'}
        title={i18n.header.selectCollator}
        disabled={disabled}
        renderSelected={() => <NominationSelectorField label={label} item={selectedCollator} placeholder={label} />}
        ref={collatorRef}
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
      />
    </>
  );
};
