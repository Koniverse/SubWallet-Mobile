import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import i18n from 'utils/i18n/i18n';
import { Button, Icon, SelectItem } from 'components/design-system-ui';
import { ArrowsClockwise, SortAscending, SortDescending } from 'phosphor-react-native';
import React, { useCallback } from 'react';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { EarningPoolSelectorSortKey, EarningPoolSelectorSortOption } from '../EarningPoolSelector';

interface Props {
  sortingModalRef: React.MutableRefObject<ModalRef | undefined>;
  sortSelection: EarningPoolSelectorSortKey;
  onPressResetSorting: () => void;
  onPressItem: (item: EarningPoolSelectorSortOption) => void;
}

const sortingOptions: EarningPoolSelectorSortOption[] = [
  {
    desc: false,
    label: i18n.stakingScreen.lowestMember,
    value: EarningPoolSelectorSortKey.MEMBER,
  },
  {
    desc: true,
    label: i18n.stakingScreen.highestBonded,
    value: EarningPoolSelectorSortKey.TOTAL_POOLED,
  },
];

export const EarningPoolSortModal = ({ sortingModalRef, sortSelection, onPressResetSorting, onPressItem }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const renderSortingItem = useCallback(
    (item: EarningPoolSelectorSortOption) => {
      return (
        <SelectItem
          key={item.value}
          label={item.label}
          icon={item.desc ? SortDescending : SortAscending}
          backgroundColor={theme.colorPrimary}
          isSelected={sortSelection === item.value}
          onPress={() => onPressItem(item)}
        />
      );
    },
    [onPressItem, sortSelection, theme.colorPrimary],
  );

  return (
    <BasicSelectModal
      level={2}
      ref={sortingModalRef}
      title={i18n.header.sorting}
      items={sortingOptions}
      selectedValueMap={{ [sortSelection]: true }}
      onBackButtonPress={() => sortingModalRef.current?.onCloseModal()}
      renderCustomItem={renderSortingItem}>
      {
        <Button
          style={{ marginTop: 16 }}
          icon={<Icon phosphorIcon={ArrowsClockwise} size={'md'} />}
          onPress={onPressResetSorting}>
          {i18n.buttonTitles.resetSorting}
        </Button>
      }
    </BasicSelectModal>
  );
};
