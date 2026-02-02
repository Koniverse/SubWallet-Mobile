import React, { useCallback, useMemo, useRef } from 'react';
import i18n from 'utils/i18n/i18n';
import { NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { StakingNominationItem } from 'components/common/StakingNominationItem';
import { NominationSelectorField } from 'components/Field/NominationSelector';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';

interface Props {
  nominators: NominationInfo[];
  chain: string;
  selectedValue: string;
  onSelectItem: (value: string) => void;
  disabled?: boolean;
  label: string;
  poolInfo: YieldPoolInfo;
  isChangeValidator?: boolean;
  placeholder?: string;
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

export const NominationSelector = ({
  nominators,
  selectedValue,
  onSelectItem,
  disabled,
  label,
  poolInfo,
  isChangeValidator,
  chain,
  placeholder,
}: Props) => {
  const collatorRef = useRef<ModalRef | null>(null);
  const selectedCollator = useMemo(() => {
    return nominators.find(item => item.validatorAddress === selectedValue);
  }, [nominators, selectedValue]);

  const handleValidatorLabel = useMemo(() => {
    const _label = getValidatorLabel(chain);

    return _label !== 'dApp' ? _label.toLowerCase() : _label;
  }, [chain]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NominationInfo>) => {
      return (
        <StakingNominationItem
          isChangeValidator={isChangeValidator}
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
    [isChangeValidator, onSelectItem, poolInfo, selectedValue],
  );

  return (
    <>
      <FullSizeSelectModal
        items={nominators}
        selectedValueMap={selectedCollator ? { [selectedCollator.validatorAddress]: true } : {}}
        selectModalType={'single'}
        title={`Select a ${handleValidatorLabel}` || placeholder || i18n.inputLabel.selectValidator}
        disabled={disabled}
        renderSelected={() => <NominationSelectorField label={label} item={selectedCollator} placeholder={label} />}
        ref={collatorRef}
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
        placeholder={placeholder}
      />
    </>
  );
};
