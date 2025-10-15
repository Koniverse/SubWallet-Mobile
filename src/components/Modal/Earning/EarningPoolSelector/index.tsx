import { useGetPoolTargetList, useYieldPositionDetail } from 'hooks/earning';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Icon, Typography } from 'components/design-system-ui';
import { NominationPoolDataType } from 'types/earning';
import i18n from 'utils/i18n/i18n';
import { Keyboard, ListRenderItemInfo, View } from 'react-native';
import { StakingPoolItem } from 'components/common/StakingPoolItem';
import { PoolSelectorField } from 'components/Field/PoolSelector';
import { PoolSelectorDetailModal } from 'components/Modal/common/PoolSelectorDetailModal';
import { MagnifyingGlass, SortAscending, ThumbsUp } from 'phosphor-react-native';
import { ModalRef } from 'types/modalRef';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { EmptyValidator } from 'components/EmptyValidator';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { SectionItem } from 'components/LazySectionList';
import { FontSemiBold } from 'styles/sharedStyles';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { YieldPoolType } from '@subwallet/extension-base/types';
import DotBadge from 'components/design-system-ui/badge/DotBadge';
import { fetchStaticData } from 'utils/fetchStaticData';
import { useToast } from 'react-native-toast-notifications';
import { EarningPoolSortModal } from 'components/Modal/Earning/EarningPoolSelector/EarningPoolSortModal';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';

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

export enum EarningPoolSelectorSortKey {
  MEMBER = 'member',
  TOTAL_POOLED = 'total-pooled',
  DEFAULT = 'default',
}

export interface EarningPoolSelectorSortOption {
  label: string;
  value: EarningPoolSelectorSortKey;
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
        case 'Blocked':
          if (item.state === 'Blocked') {
            return true;
          }
          break;
      }
    }
    return false;
  });
};

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
  {
    label: i18n.common.blocked,
    value: 'Blocked',
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
    const { hideAll, show } = useToast();

    const poolSelectorRef = useRef<ModalRef>();
    const sortingModalRef = useRef<ModalRef>();

    const [sortSelection, setSortSelection] = useState<EarningPoolSelectorSortKey>(EarningPoolSelectorSortKey.DEFAULT);
    const nominationPoolValueList = useMemo((): string[] => {
      return compound?.nominations.map(item => item.validatorAddress) || [];
    }, [compound]);
    const [defaultPoolMap, setDefaultPoolMap] = useState<Record<string, number[]>>({});

    const EarningPoolGroupNameMap = useMemo(
      () => ({
        [EarningPoolGroup.RECOMMEND]: 'recommended',
        [EarningPoolGroup.OTHERS]: 'others',
      }),
      [],
    );

    const defaultSelectPool = defaultPoolMap?.[chain];

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
      (item: string) => {
        if (defaultPoolMap?.[chain] && defaultPoolMap?.[chain].length) {
          return (
            <View
              style={{
                paddingBottom: theme.sizeXS,
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
                {`${item.split('|')[1]}`}
              </Typography.Text>
              {item.includes('recommended') && (
                <Icon phosphorIcon={ThumbsUp} iconColor={theme['cyan-6']} size={'xs'} weight={'fill'} />
              )}
            </View>
          );
        } else {
          return <></>;
        }
      },
      [chain, defaultPoolMap, theme],
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
        .map(item => {
          const _disabled = item.isCrowded || item.state === 'Blocked';

          return { ...item, disabled: _disabled };
        })
        .sort((a: NominationPoolDataType, b: NominationPoolDataType) => {
          if (defaultPoolMap?.[chain] && defaultPoolMap?.[chain].length) {
            const isRecommendedA = defaultPoolMap?.[chain].includes(a.id);
            const isRecommendedB = defaultPoolMap?.[chain].includes(b.id);

            switch (sortSelection) {
              case EarningPoolSelectorSortKey.MEMBER:
                if (isRecommendedA && !isRecommendedB) {
                  return -1;
                } else if (!isRecommendedA && isRecommendedB) {
                  return 1;
                } else {
                  return a.memberCounter - b.memberCounter;
                }
              case EarningPoolSelectorSortKey.TOTAL_POOLED:
                if (isRecommendedA && !isRecommendedB) {
                  return -1;
                } else if (!isRecommendedA && isRecommendedB) {
                  return 1;
                } else {
                  return new BigN(b.bondedAmount).minus(a.bondedAmount).toNumber();
                }
              case EarningPoolSelectorSortKey.DEFAULT:
              default:
                if (isRecommendedA && !isRecommendedB) {
                  return -1;
                } else if (!isRecommendedA && isRecommendedB) {
                  return 1;
                }

                if (a.disabled && !b.disabled) {
                  return 1;
                } else if (!a.disabled && b.disabled) {
                  return -1;
                }

                return 0;
            }
          } else {
            switch (sortSelection) {
              case EarningPoolSelectorSortKey.MEMBER:
                return a.memberCounter - b.memberCounter;
              case EarningPoolSelectorSortKey.TOTAL_POOLED:
                return new BigN(b.bondedAmount).minus(a.bondedAmount).toNumber();
              case EarningPoolSelectorSortKey.DEFAULT:
              default:
                if (a.disabled && !b.disabled) {
                  return 1;
                } else if (!a.disabled && b.disabled) {
                  return -1;
                }

                return 0;
            }
          }
        })
        .map(item => {
          if (defaultPoolMap?.[chain] && defaultPoolMap?.[chain].includes(item.id)) {
            return { ...item, group: EarningPoolGroup.RECOMMEND };
          } else {
            return { ...item, group: EarningPoolGroup.OTHERS };
          }
        });
    }, [chain, defaultPoolMap, items, sortSelection]);
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

    const onPressSortingItem = useCallback((item: EarningPoolSelectorSortOption) => {
      setSortSelection(item.value);
      sortingModalRef?.current?.onCloseModal();
    }, []);

    const onPressItem = useCallback(
      (item: NominationPoolDataTypeItem) => {
        if (item.state === 'Blocked') {
          hideAll();
          show('This pool is blocked. Select another to continue', { type: 'normal' });
          return;
        }
        onSelectItem && onSelectItem(item.id.toString());
        poolSelectorRef && poolSelectorRef.current?.onCloseModal();
      },
      [hideAll, onSelectItem, show],
    );
    const onPressRightIconButton = useCallback((item: NominationPoolDataTypeItem) => {
      Keyboard.dismiss();
      setSelectedItem(item);
      delayActionAfterDismissKeyboard(() => setDetailModalVisible(true));
    }, []);

    const onPressResetSortingItem = useCallback(() => {
      setSortSelection(EarningPoolSelectorSortKey.DEFAULT);
      sortingModalRef?.current?.onCloseModal();
    }, []);

    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<NominationPoolDataTypeItem>) => {
        const { address, name, id, bondedAmount, symbol, decimals, isProfitable } = item;

        return (
          <StakingPoolItem
            address={address}
            disabled={item.isCrowded}
            disabledUI={item.state === 'Blocked'}
            decimals={decimals}
            id={id}
            isProfitable={isProfitable}
            bondedAmount={bondedAmount}
            name={name}
            symbol={symbol}
            key={id}
            onPress={() => onPressItem(item)}
            onPressRightButton={() => onPressRightIconButton(item)}
          />
        );
      },
      [onPressItem, onPressRightIconButton],
    );

    useEffect(() => {
      fetchStaticData<Record<string, number[]>>('nomination-pool-recommendation')
        .then(earningPoolRecommendation => {
          setDefaultPoolMap(earningPoolRecommendation);
        })
        .catch(console.error);
    }, []);

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

    const renderSelected = useCallback(
      () => (
        <PoolSelectorField
          disabled={isDisabled}
          onPressBookBtn={() => poolSelectorRef && poolSelectorRef.current?.onOpenModal()}
          // onPressLightningBtn={onPressLightningBtn}
          showLightingBtn={false}
          item={selectedPool}
          label={i18n.inputLabel.pool}
          loading={poolLoading}
          recommendIds={defaultPoolMap?.[chain]}
        />
      ),
      [chain, defaultPoolMap, isDisabled, poolLoading, selectedPool],
    );

    const rightIconOption = useMemo(
      () => ({
        icon: () => (
          <DotBadge dot={sortSelection !== EarningPoolSelectorSortKey.DEFAULT}>
            <Icon phosphorIcon={SortAscending} size="md" />
          </DotBadge>
        ),
        onPress: () => sortingModalRef?.current?.onOpenModal(),
      }),
      [sortSelection],
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
          filterOptions={FILTER_OPTIONS}
          filterFunction={filterFunction}
          onCloseModal={() => setSortSelection(EarningPoolSelectorSortKey.DEFAULT)}
          rightIconOption={rightIconOption}
          grouping={grouping}
          keyExtractor={item => {
            if (typeof item === 'string') {
              return item;
            } else {
              return item.address;
            }
          }}
          estimatedItemSize={82}
          renderSelected={renderSelected}>
          <>
            {!!selectedItem && (
              <PoolSelectorDetailModal
                detailItem={selectedItem}
                detailModalVisible={detailModalVisible}
                setVisible={setDetailModalVisible}
                maxPoolMembersValue={maxPoolMembersValue}
              />
            )}

            <EarningPoolSortModal
              sortingModalRef={sortingModalRef}
              sortSelection={sortSelection}
              onPressResetSorting={onPressResetSortingItem}
              onPressItem={onPressSortingItem}
            />
          </>
        </FullSizeSelectModal>
      </>
    );
  },
);
