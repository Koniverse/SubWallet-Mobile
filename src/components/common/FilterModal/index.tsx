import React from 'react';
import { FadersHorizontal } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { ModalRef } from 'types/modalRef';
import { noop } from 'utils/function';

export type OptionType = {
  label: string;
  value: string;
};

export interface FilterModalProps {
  modalTitle?: string;
  options: OptionType[];
  onChangeOption?: (value: string, isChecked: boolean) => void;
  onApplyFilter?: () => void;
  optionSelectionMap: Record<string, boolean>;
  filterModalRef: React.MutableRefObject<ModalRef | undefined>;
}

const FilterModal = ({
  options,
  modalTitle = i18n.header.filter,
  onChangeOption,
  onApplyFilter,
  optionSelectionMap,
  filterModalRef,
}: FilterModalProps) => {
  return (
    <>
      <BasicSelectModal
        level={2}
        title={modalTitle}
        items={options}
        selectedValueMap={optionSelectionMap}
        selectModalType={'multi'}
        onBackButtonPress={() => filterModalRef?.current?.onCloseModal()}
        selectModalItemType={'filter'}
        onSelectItem={item => onChangeOption && onChangeOption(item.value, !optionSelectionMap[item.value])}
        isShowInput={false}
        ref={filterModalRef}
        applyBtn={{
          label: i18n.buttonTitles.applyFilter,
          icon: FadersHorizontal,
          onPressApplyBtn: onApplyFilter || noop,
        }}
      />
    </>
  );
};

export default FilterModal;
