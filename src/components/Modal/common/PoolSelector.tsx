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
import { ArrowsClockwise, MagnifyingGlass, SortAscending, SortDescending } from 'phosphor-react-native';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { EmptyValidator } from 'components/EmptyValidator';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';

interface Props {
  onSelectItem?: (value: string) => void;
  chain: string;
  from: string;
  poolLoading: boolean;
  selectedPool?: NominationPoolInfo;
  disabled?: boolean;
  setForceFetchValidator: (val: boolean) => void;
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

export const PoolSelector = ({
  chain,
  onSelectItem,
  from,
  poolLoading,
  selectedPool,
  disabled,
  setForceFetchValidator,
}: Props) => {
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
  const defaultSelectPool = Object.assign({}, PREDEFINED_STAKING_POOL, { vara_network: 29 })[chain];
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

  const renderListEmptyComponent = useCallback(() => {
    return (
      <EmptyValidator
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
        icon={MagnifyingGlass}
        validatorTitle={getValidatorLabel(chain).toLowerCase()}
        isDataEmpty={items.length === 0}
        onClickReload={setForceFetchValidator}
      />
    );
  }, [chain, items.length, setForceFetchValidator]);

  useEffect(() => {
    const defaultSelectedPool = nominationPoolValueList[0] || String(defaultSelectPool || '');

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
      const { address, name, id, bondedAmount, symbol, decimals, isProfitable } = item;

      return (
        <StakingPoolItem
          address={address}
          decimals={decimals}
          id={id}
          isProfitable={isProfitable}
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

  const onPressLightningBtn = useCallback(() => {
    const poolId = defaultSelectPool;

    poolId !== undefined && onSelectItem && onSelectItem(String(poolId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

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
            onPressLightningBtn={onPressLightningBtn}
            showLightingBtn={!!defaultSelectPool}
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
                style={{ marginTop: 16 }}
                icon={<Icon phosphorIcon={ArrowsClockwise} size={'md'} />}
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
