import { useGetPoolTargetList, useYieldPositionDetail } from 'hooks/earning';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button, Icon, SelectItem, Typography } from 'components/design-system-ui';
import { NominationPoolDataType } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import { Keyboard, ListRenderItemInfo, View } from 'react-native';
import { StakingPoolItem } from 'components/common/StakingPoolItem';
import { PoolSelectorField } from 'components/Field/PoolSelector';
import { PoolSelectorDetailModal } from 'components/Modal/common/PoolSelectorDetailModal';
import { ArrowsClockwise, MagnifyingGlass, SortAscending, SortDescending, ThumbsUp } from 'phosphor-react-native';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { EmptyValidator } from 'components/EmptyValidator';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { PREDEFINED_EARNING_POOL } from 'constants/stakingScreen';
import { SectionItem } from 'components/LazySectionList';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import { FontSemiBold } from 'styles/sharedStyles';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { YieldPoolType } from '@subwallet/extension-base/types';
import DotBadge from 'components/design-system-ui/badge/DotBadge';

enum EarningPoolGroup {
  RECOMMEND = 'recommend',
  OTHERS = 'others',
}

interface NominationPoolDataTypeItem extends NominationPoolDataType {
  group: EarningPoolGroup;
}

interface Props {
  onSelectItem?: (value: string) => void;
  slug: string;
  chain: string;
  from: string;
  poolLoading: boolean;
  targetPool: string;
  disabled?: boolean;
  setForceFetchValidator: (val: boolean) => void;
  defaultValidatorAddress?: string;
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

const defaultPoolMap = Object.assign({}, PREDEFINED_EARNING_POOL);

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
    label: i18n.common.open,
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

export interface PoolSelectorRef {
  onOpenModal: () => void;
}

const sortSection = (a: SectionItem<NominationPoolDataTypeItem>, b: SectionItem<NominationPoolDataTypeItem>) => {
  return b.title.localeCompare(a.title);
};

export const EarningPoolSelector = forwardRef(
  (
    {
      slug,
      onSelectItem,
      from,
      poolLoading,
      targetPool,
      disabled,
      chain,
      setForceFetchValidator,
      defaultValidatorAddress,
    }: Props,
    ref: React.Ref<PoolSelectorRef>,
  ) => {
    const theme = useSubWalletTheme().swThemes;
    const items = useGetPoolTargetList(slug) as NominationPoolDataType[];
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<NominationPoolDataType | undefined>(undefined);
    const { poolInfoMap } = useSelector((state: RootState) => state.earning);
    const { compound } = useYieldPositionDetail(slug, from);

    const poolSelectorRef = useRef<ModalRef>();
    const sortingModalRef = useRef<ModalRef>();

    const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);
    const nominationPoolValueList = useMemo((): string[] => {
      return compound?.nominations.map(item => item.validatorAddress) || [];
    }, [compound]);

    const EarningPoolGroupNameMap = useMemo(
      () => ({
        [EarningPoolGroup.RECOMMEND]: 'recommended',
        [EarningPoolGroup.OTHERS]: 'others',
      }),
      [],
    );

    const defaultSelectPool = defaultPoolMap[chain];

    const groupBy = useMemo(
      () => (item: NominationPoolDataTypeItem) => {
        const priority = item.group === EarningPoolGroup.RECOMMEND ? '1' : '0';
        return `${priority}|${EarningPoolGroupNameMap[item.group]}`;
      },
      [EarningPoolGroupNameMap],
    );

    const maxPoolMembersValue = useMemo(() => {
      const poolInfo = poolInfoMap[slug];

      if (poolInfo.type === YieldPoolType.NOMINATION_POOL) {
        return poolInfo.maxPoolMembers;
      }

      return undefined;
    }, [poolInfoMap, slug]);

    const renderSectionHeader = useCallback(
      (info: { section: SectionListData<NominationPoolDataTypeItem> }) => {
        if (defaultSelectPool) {
          return (
            <View
              style={{
                paddingBottom: theme.sizeXS,
                marginBottom: -theme.sizeXS,
                paddingHorizontal: theme.size,
                backgroundColor: theme.colorBgDefault,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.sizeXXS,
              }}>
              <Typography.Text
                size={'sm'}
                style={{
                  // paddingTop: theme.sizeXXS,
                  color: theme.colorTextLight3,
                  textTransform: 'uppercase',
                  ...FontSemiBold,
                }}>
                {`${info.section.title.split('|')[1]}`}
              </Typography.Text>
              {info.section.title.includes('recommended') && (
                <Icon phosphorIcon={ThumbsUp} iconColor={theme['cyan-6']} size={'xs'} weight={'fill'} />
              )}
            </View>
          );
        } else {
          return <></>;
        }
      },
      [defaultSelectPool, theme],
    );

    const grouping = useMemo(() => {
      return { groupBy, sortSection, renderSectionHeader };
    }, [groupBy, renderSectionHeader]);

    useImperativeHandle(
      ref,
      () => ({
        onOpenModal: () => {
          poolSelectorRef?.current?.onOpenModal?.();
        },
      }),
      [],
    );

    const selectedPool = useMemo((): NominationPoolDataType | undefined => {
      return items.find(item => item.idStr === targetPool);
    }, [items, targetPool]);

    const resultList: NominationPoolDataTypeItem[] = useMemo(() => {
      return [...items]
        .filter(item => item.state !== 'Blocked')
        .sort((a: NominationPoolDataType, b: NominationPoolDataType) => {
          if (defaultSelectPool) {
            const isRecommendedA = defaultSelectPool.includes(a.id);
            const isRecommendedB = defaultSelectPool.includes(b.id);

            switch (sortSelection) {
              case SortKey.MEMBER:
                if (isRecommendedA && !isRecommendedB) {
                  return -1;
                } else if (!isRecommendedA && isRecommendedB) {
                  return 1;
                } else {
                  return a.memberCounter - b.memberCounter;
                }
              case SortKey.TOTAL_POOLED:
                if (isRecommendedA && !isRecommendedB) {
                  return -1;
                } else if (!isRecommendedA && isRecommendedB) {
                  return 1;
                } else {
                  return new BigN(b.bondedAmount).minus(a.bondedAmount).toNumber();
                }
              case SortKey.DEFAULT:
              default:
                if (isRecommendedA && !isRecommendedB) {
                  return -1;
                } else if (!isRecommendedA && isRecommendedB) {
                  return 1;
                }

                if (a.isCrowded && !b.isCrowded) {
                  return 1;
                } else if (!a.isCrowded && b.isCrowded) {
                  return -1;
                }

                return 0;
            }
          } else {
            switch (sortSelection) {
              case SortKey.MEMBER:
                return a.memberCounter - b.memberCounter;
              case SortKey.TOTAL_POOLED:
                return new BigN(b.bondedAmount).minus(a.bondedAmount).toNumber();
              case SortKey.DEFAULT:
              default:
                if (a.isCrowded && !b.isCrowded) {
                  return 1;
                } else if (!a.isCrowded && b.isCrowded) {
                  return -1;
                }

                return 0;
            }
          }
        })
        .map(item => {
          if (PREDEFINED_EARNING_POOL[chain] && PREDEFINED_EARNING_POOL[chain].includes(item.id)) {
            return { ...item, group: EarningPoolGroup.RECOMMEND };
          } else {
            return { ...item, group: EarningPoolGroup.OTHERS };
          }
        });
    }, [chain, defaultSelectPool, items, sortSelection]);

    const isDisabled = useMemo(
      () => disabled || !!nominationPoolValueList.length || !items.length,
      [disabled, items.length, nominationPoolValueList.length],
    );

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

    const renderSortingItem = useCallback(
      (item: SortOption) => {
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
      },
      [sortSelection, theme.colorPrimary],
    );

    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<NominationPoolDataTypeItem>) => {
        const { address, name, id, bondedAmount, symbol, decimals, isProfitable } = item;

        return (
          <StakingPoolItem
            address={address}
            disabled={item.isCrowded}
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

    useEffect(() => {
      let defaultValue = '';
      if (defaultValidatorAddress) {
        defaultValue = defaultValidatorAddress;
      } else {
        defaultValue =
          nominationPoolValueList[0] ||
          String(defaultSelectPool && defaultSelectPool.length ? defaultSelectPool[0] : '');
      }

      onSelectItem && onSelectItem(defaultValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nominationPoolValueList, items]);

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
          filterOptions={FILTER_OPTIONS}
          filterFunction={filterFunction}
          onCloseModal={() => setSortSelection(SortKey.DEFAULT)}
          rightIconOption={{
            icon: () => (
              <DotBadge dot={sortSelection !== SortKey.DEFAULT}>
                <Icon phosphorIcon={SortAscending} size="md" />
              </DotBadge>
            ),
            onPress: () => sortingModalRef?.current?.onOpenModal(),
          }}
          grouping={grouping}
          renderSelected={() => (
            <PoolSelectorField
              disabled={isDisabled}
              onPressBookBtn={() => poolSelectorRef && poolSelectorRef.current?.onOpenModal()}
              // onPressLightningBtn={onPressLightningBtn}
              showLightingBtn={false}
              item={selectedPool}
              label={i18n.inputLabel.pool}
              loading={poolLoading}
              recommendIds={defaultSelectPool}
            />
          )}>
          <>
            {!!selectedItem && (
              <PoolSelectorDetailModal
                detailItem={selectedItem}
                detailModalVisible={detailModalVisible}
                setVisible={setDetailModalVisible}
                maxPoolMembersValue={maxPoolMembersValue}
              />
            )}

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
  },
);
