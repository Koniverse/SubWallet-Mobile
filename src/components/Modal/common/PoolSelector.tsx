import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, SelectItem } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import { NominationPoolInfo, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import useGetValidatorList, { NominationPoolDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { Keyboard, ListRenderItemInfo } from 'react-native';
import { StakingPoolItem } from 'components/common/StakingPoolItem';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { PREDEFINED_STAKING_POOL } from '@subwallet/extension-base/constants';
import { PoolSelectorField } from 'components/Field/PoolSelector';
import { PoolSelectorDetailModal } from 'components/Modal/common/PoolSelectorDetailModal';
import { ArrowCounterClockwise, MagnifyingGlass, SortAscending, SortDescending } from 'phosphor-react-native';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { EmptyList } from 'components/EmptyList';
import { FullSizeSelectModal } from 'components/common/SelectModal';

interface Props {
  onSelectItem?: (value: string) => void;
  chain: string;
  from: string;
  poolLoading: boolean;
  selectedPool?: NominationPoolInfo;
  disabled?: boolean;
}

interface FilterOption {
  label: string;
  value: NominationPoolDataType['state'];
}

enum SortKey {
  MEMBER = 'member',
  TOTAL_POOLED = 'total-pooled',
  DEFAULT = 'default',
}

interface SortOption {
  label: string;
  value: SortKey;
  desc: boolean;
}

const searchFunction = (items: NominationPoolDataType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  return items.filter(({ name }) => name?.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      title={i18n.emptyScreen.selectorEmptyTitle}
      message={i18n.emptyScreen.selectorEmptyMessage}
      icon={MagnifyingGlass}
    />
  );
};

const filterFunction = (items: NominationPoolDataType[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    for (const filter of filters) {
      switch (filter) {
        case 'Locked':
          if (item.state === 'Locked') {
            return true;
          }
          break;
        case 'Destroying':
          if (item.state === 'Destroying') {
            return true;
          }
          break;
        case 'Open':
          if (item.state === 'Open') {
            return true;
          }
          break;
      }
    }
    return false;
  });
};

export const PoolSelector = ({ chain, onSelectItem, from, poolLoading, selectedPool, disabled }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const items = useGetValidatorList(chain, StakingType.POOLED) as NominationPoolDataType[];
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NominationPoolDataType | undefined>(undefined);
  const nominatorMetadata = useGetNominatorInfo(chain, StakingType.POOLED, from);
  const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);
  const nominationPoolValueList = useMemo((): string[] => {
    return nominatorMetadata[0]?.nominations.map(item => item.validatorAddress) || [];
  }, [nominatorMetadata]);
  const poolSelectorRef = useRef<ModalRef>();
  const sortingModalRef = useRef<ModalRef>();
  const sortingOptions: SortOption[] = [
    {
      desc: false,
      label: i18n.stakingScreen.lowestMember,
      value: SortKey.MEMBER,
    },
    {
      desc: true,
      label: i18n.stakingScreen.highestBonded,
      value: SortKey.TOTAL_POOLED,
    },
  ];

  const FILTER_OPTIONS: FilterOption[] = [
    {
      label: i18n.common.active,
      value: 'Open',
    },
    {
      label: i18n.common.locked,
      value: 'Locked',
    },
    {
      label: i18n.common.destroying,
      value: 'Destroying',
    },
  ];

  const resultList = useMemo(() => {
    return [...items].sort((a: NominationPoolDataType, b: NominationPoolDataType) => {
      switch (sortSelection) {
        case SortKey.MEMBER:
          return a.memberCounter - b.memberCounter;
        case SortKey.TOTAL_POOLED:
          return new BigN(b.bondedAmount).minus(a.bondedAmount).toNumber();
        case SortKey.DEFAULT:
        default:
          return 0;
      }
    });
  }, [items, sortSelection]);

  useEffect(() => {
    const defaultSelectedPool = nominationPoolValueList[0] || String(PREDEFINED_STAKING_POOL[chain] || '');

    onSelectItem && onSelectItem(defaultSelectedPool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nominationPoolValueList]);

  const renderSortingItem = (item: SortOption) => {
    return (
      <SelectItem
        key={item.value}
        label={item.label}
        icon={item.desc ? SortDescending : SortAscending}
        backgroundColor={theme.colorPrimary}
        isSelected={sortSelection === item.value}
        onPress={() => {
          setSortSelection(item.value);
          sortingModalRef?.current?.onCloseModal();
        }}
      />
    );
  };

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NominationPoolDataType>) => {
      const { address, name, id, bondedAmount, symbol, decimals } = item;

      return (
        <StakingPoolItem
          address={address}
          decimals={decimals}
          id={id}
          bondedAmount={bondedAmount}
          name={name}
          symbol={symbol}
          key={id}
          onPress={() => {
            onSelectItem && onSelectItem(item.id.toString());
            poolSelectorRef && poolSelectorRef.current?.onCloseModal();
          }}
          onPressRightButton={() => {
            Keyboard.dismiss();
            setSelectedItem(item);
            setTimeout(() => {
              setDetailModalVisible(true);
            }, 100);
          }}
        />
      );
    },
    [onSelectItem],
  );

  const isDisabled = useMemo(
    () => disabled || !!nominationPoolValueList.length || !items.length,
    [disabled, items.length, nominationPoolValueList.length],
  );

  return (
    <>
      <FullSizeSelectModal
        selectedValueMap={{}}
        selectModalType={'single'}
        items={resultList}
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
        title={i18n.header.selectPool}
        ref={poolSelectorRef}
        renderListEmptyComponent={renderListEmptyComponent}
        disabled={isDisabled}
        isShowFilterBtn={true}
        onBackButtonPress={() => poolSelectorRef?.current?.onCloseModal()}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        onCloseModal={() => setSortSelection(SortKey.DEFAULT)}
        rightIconOption={{
          icon: ({ color }) => <Icon phosphorIcon={SortAscending} size="md" iconColor={color} />,
          onPress: () => sortingModalRef?.current?.onOpenModal(),
        }}
        renderSelected={() => (
          <PoolSelectorField
            disabled={isDisabled}
            onPressBookBtn={() => poolSelectorRef && poolSelectorRef.current?.onOpenModal()}
            onPressLightningBtn={() => poolSelectorRef && poolSelectorRef.current?.onOpenModal()}
            item={selectedPool}
            label={i18n.inputLabel.selectPool}
            loading={poolLoading}
          />
        )}>
        <>
          {!!selectedItem && (
            <PoolSelectorDetailModal
              detailItem={selectedItem}
              detailModalVisible={detailModalVisible}
              setVisible={setDetailModalVisible}
            />
          )}

          <BasicSelectModal
            level={2}
            ref={sortingModalRef}
            title={i18n.header.sorting}
            items={sortingOptions}
            selectedValueMap={{ [sortSelection]: true }}
            renderCustomItem={renderSortingItem}>
            {
              <Button
                icon={<Icon phosphorIcon={ArrowCounterClockwise} size={'md'} />}
                onPress={() => {
                  setSortSelection(SortKey.DEFAULT);
                  sortingModalRef?.current?.onCloseModal();
                }}>
                {i18n.buttonTitles.resetSorting}
              </Button>
            }
          </BasicSelectModal>
        </>
      </FullSizeSelectModal>
    </>
  );
};
