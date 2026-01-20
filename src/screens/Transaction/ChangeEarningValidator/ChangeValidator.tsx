import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ValidatorDataType } from 'types/earning';
import { NominationInfo, SubmitChangeValidatorStaking, YieldPoolType } from '@subwallet/extension-base/types';
import { VoidFunction } from 'types/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ExtrinsicType, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { ChainRecommendValidator } from '@subwallet/extension-base/constants';
import { AppModalContext } from 'providers/AppModalContext';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { fetchStaticData } from 'utils/fetchStaticData';
import { useSelectValidators } from 'hooks/screen/Transaction/useSelectValidators';
import { getValidatorKey } from 'utils/transaction';
import { changeEarningValidator } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { Button, Icon, PageIcon, SelectItem, Typography } from 'components/design-system-ui';
import { EmptyValidator } from 'components/EmptyValidator';
import { FlatListScreen } from 'components/FlatListScreen';
import BigN from 'bignumber.js';
import { StyleSheet, View } from 'react-native';
import {
  ArrowsClockwise,
  CheckCircle,
  Info,
  MagnifyingGlass,
  SortAscending,
  SortDescending,
  ThumbsUp,
} from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import { FontSemiBold } from 'styles/sharedStyles';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { StakingValidatorItem } from 'components/common/StakingValidatorItem';
import DotBadge from 'components/design-system-ui/badge/DotBadge';
import { ModalRef } from 'types/modalRef';
import { ValidatorSelectorDetailModal } from 'components/Modal/common/ValidatorSelectorDetailModal';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import { TransactionDone } from '../TransactionDone';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { ChangeEarningValidatorValues } from 'screens/Transaction/ChangeEarningValidator/ChangeBittensorValidator';
import { SectionItem } from 'components/LazySectionList';

interface Props {
  chain: string;
  from: string;
  slug: string;
  items: ValidatorDataType[];
  nominations: NominationInfo[];
  isSingleSelect?: boolean;
  setForceFetchValidator: (val: boolean) => void;
  onCancel?: VoidFunction;
}

enum ValidatorGroup {
  RECOMMEND = 'recommend',
  OTHERS = 'others',
}

interface ValidatorDataTypeItem extends ValidatorDataType {
  group: ValidatorGroup;
}

const sortSection = (a: SectionItem<ValidatorDataTypeItem>, b: SectionItem<ValidatorDataTypeItem>) => {
  return b.title.localeCompare(a.title);
};

enum SortKey {
  COMMISSION = 'commission',
  RETURN = 'return',
  MIN_STAKE = 'min-stake',
  NOMINATING = 'nominating',
  DEFAULT = 'default',
}

interface SortOption {
  label: string;
  value: SortKey;
  desc: boolean;
}

const filterOptions = [
  {
    label: 'Active validator',
    value: '1',
  },
  {
    label: 'Waiting list',
    value: '2',
  },
  {
    label: 'Locked',
    value: '3',
  },
  {
    label: 'Destroying',
    value: '4',
  },
];

export const ChangeValidator = ({
  chain,
  from,
  slug,
  items,
  nominations,
  isSingleSelect: _isSingleSelect = false,
  setForceFetchValidator,
  onCancel,
}: Props) => {
  const sortingModalRef = useRef<ModalRef>();
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewDetailItem, setViewDetailItem] = useState<ValidatorDataType | undefined>(undefined);
  const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);
  const [selectedValidators, setSelectedValidators] = useState<ValidatorInfo[]>([]);
  const [defaultValidatorMap, setDefaultValidatorMap] = useState<Record<string, ChainRecommendValidator>>({});
  const { confirmModal } = useContext(AppModalContext);

  const { onTransactionDone: onDone, transactionDoneInfo } = useTransaction<ChangeEarningValidatorValues>(
    'change-earning-validator',
    {
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {},
    },
  );

  const onPreCheck = usePreCheckAction(from);
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, setTransactionDone);

  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[slug];
  const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;

  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
  const isSingleSelect = useMemo(() => _isSingleSelect || !isRelayChain, [_isSingleSelect, isRelayChain]);
  const hasReturn = useMemo(() => items[0]?.expectedReturn !== undefined, [items]);

  const ValidatorGroupNameMap = useMemo(
    () => ({
      [ValidatorGroup.RECOMMEND]: 'recommended',
      [ValidatorGroup.OTHERS]: 'others',
    }),
    [],
  );

  const maxPoolMembersValue = useMemo(() => {
    if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
      return poolInfo.maxPoolMembers;
    }

    return undefined;
  }, [poolInfo]);

  const sortingOptions: SortOption[] = useMemo(() => {
    const result: SortOption[] = [
      {
        desc: false,
        label: i18n.stakingScreen.lowestCommission,
        value: SortKey.COMMISSION,
      },
    ];

    if (hasReturn) {
      result.push({
        desc: true,
        label: i18n.stakingScreen.highestReturn,
        value: SortKey.RETURN,
      });
    }

    if (nominations && nominations.length > 0) {
      result.push({
        desc: true,
        label: i18n.stakingScreen.nomination,
        value: SortKey.NOMINATING,
      });
    }

    result.push({
      desc: false,
      label: i18n.stakingScreen.lowestActiveStake,
      value: SortKey.MIN_STAKE,
    });

    return result;
  }, [hasReturn, nominations]);

  const { changeValidators, onChangeSelectedValidator } = useSelectValidators(
    chain,
    maxCount,
    undefined,
    isSingleSelect,
    undefined,
  );

  const fewValidators = changeValidators.length > 1;

  const handleApplyLabel = useCallback(
    (changeValidatorLength: number) => {
      if (!fewValidators) {
        return i18n.formatString(i18n.buttonTitles.applyValidator, changeValidatorLength);
      } else {
        return i18n.formatString(i18n.buttonTitles.applyValidators, changeValidatorLength);
      }
    },
    [fewValidators],
  );

  const nominatorValueList = useMemo(() => {
    return nominations && nominations.length
      ? nominations.map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity))
      : [];
  }, [nominations]);

  const sortValidator = useCallback(
    (a: ValidatorDataType, b: ValidatorDataType) => {
      const aKey = getValidatorKey(a.address, a.identity).split('___')[0];
      const bKey = getValidatorKey(b.address, b.identity).split('___')[0];

      // Compare address only in case nominatorValueList lacks identity but validator keys include it
      const hasA = nominatorValueList.some(nom => nom.startsWith(aKey));
      const hasB = nominatorValueList.some(nom => nom.startsWith(bKey));

      if (hasA && !hasB) {
        return -1;
      }

      if (!hasA && hasB) {
        return 1;
      }

      return 0;
    },
    [nominatorValueList],
  );

  const recommendedAddresses = useMemo(
    () => defaultValidatorMap[chain]?.preSelectValidators?.split(',') || [],
    [chain, defaultValidatorMap],
  );

  const resultList = useMemo((): ValidatorDataType[] => {
    return [...items]
      .sort((a: ValidatorDataType, b: ValidatorDataType) => {
        switch (sortSelection) {
          case SortKey.COMMISSION:
            return a.commission - b.commission;
          case SortKey.RETURN:
            return (b.expectedReturn || 0) - (a.expectedReturn || 0);
          case SortKey.MIN_STAKE:
            return new BigN(a.minBond).minus(b.minBond).toNumber();
          case SortKey.NOMINATING:
            return sortValidator(a, b);

          case SortKey.DEFAULT:
            if (a.isCrowded && !b.isCrowded) {
              return 1;
            } else if (!a.isCrowded && b.isCrowded) {
              return -1;
            } else {
              return 0;
            }

          default:
            return 0;
        }
      })
      .map(item => {
        if (recommendedAddresses.includes(item.address)) {
          return { ...item, group: ValidatorGroup.RECOMMEND };
        } else {
          return { ...item, group: ValidatorGroup.OTHERS };
        }
      });
  }, [items, recommendedAddresses, sortSelection, sortValidator]);

  const filterFunction = (_items: ValidatorDataTypeItem[], filters: string[]) => {
    if (!filters.length) {
      return _items;
    }

    return _items;
    // return items.filter(item => {
    //   for (const filter of filters) {
    //     switch (filter) {
    //       case ''
    //     }
    //   }
    // })
  };

  const searchFunction = (__items: ValidatorDataTypeItem[], searchString: string) => {
    const lowerCaseSearchString = searchString.toLowerCase();

    return lowerCaseSearchString
      ? __items.filter(
          ({ identity, address }) =>
            identity?.toLowerCase().includes(lowerCaseSearchString) ||
            address.toLowerCase().includes(lowerCaseSearchString),
        )
      : __items;
  };

  const isNoValidatorChanged = useMemo(() => {
    if (changeValidators.length !== nominatorValueList.length) {
      return false;
    }

    const selectedSet = new Set(changeValidators);

    return nominatorValueList.every(validator => selectedSet.has(validator));
  }, [changeValidators, nominatorValueList]);

  const submit = useCallback(
    (target: ValidatorInfo[]) => {
      const submitData: SubmitChangeValidatorStaking = {
        slug: poolInfo.slug,
        address: from,
        amount: '0',
        selectedValidators: target,
      };

      setSubmitLoading(true);

      setTimeout(() => {
        changeEarningValidator(submitData)
          .then(onSuccess)
          .catch(onError)
          .finally(() => {
            setSubmitLoading(false);
          });
      }, 300);
    },
    [poolInfo.slug, from, onError, onSuccess],
  );

  const onPressSubmit = useCallback(
    (values: { target: ValidatorInfo[] }) => {
      const { target } = values;

      if (isNoValidatorChanged) {
        confirmModal.setConfirmModal({
          visible: true,
          message:
            'Your new selections of validators is the same as the original selection. Do you still want to continue?',
          title: 'No changes detected!',
          customIcon: <PageIcon icon={Info} color={theme.colorInfo} />,
          cancelBtnTitle: i18n.buttonTitles.cancel,
          completeBtnTitle: i18n.buttonTitles.continue,
          onCancelModal: confirmModal.hideConfirmModal,
          onCompleteModal: () => {
            confirmModal.hideConfirmModal();
            submit(target);
          },
        });

        return;
      }

      submit(target);
    },
    [isNoValidatorChanged, submit, confirmModal, theme.colorInfo],
  );

  const onResetSort = useCallback(() => {
    setSortSelection(SortKey.DEFAULT);
    sortingModalRef?.current?.onCloseModal();
  }, []);

  const onChangeSortOpt = useCallback((value: string) => {
    setSortSelection(value as SortKey);
    sortingModalRef?.current?.onCloseModal();
  }, []);

  const onPressItem = useCallback(
    (value: string) => {
      onChangeSelectedValidator(value);
    },
    [onChangeSelectedValidator],
  );

  const onPressMore = useCallback((item: ValidatorDataType) => {
    return () => {
      setViewDetailItem(item);
      setDetailModalVisible(true);
    };
  }, []);

  const renderEmpty = useCallback(() => {
    return (
      <EmptyValidator
        isDataEmpty={items.length === 0}
        onClickReload={setForceFetchValidator}
        validatorTitle={'validators'}
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={'Please change your search criteria try again'}
      />
    );
  }, [items.length, setForceFetchValidator]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ValidatorDataTypeItem>) => {
      const key = getValidatorKey(item.address, item.identity);
      const keyBase = key.split('___')[0];
      const selected = changeValidators.includes(key);
      const nominated =
        nominatorValueList.includes(key) || nominatorValueList.some(nom => nom.split('___')[0] === keyBase);

      return (
        <StakingValidatorItem
          validatorInfo={item}
          key={key}
          isSelected={selected}
          isNominated={nominated}
          onPress={onPressItem}
          onPressRightButton={onPressMore(item)}
          apy={item?.expectedReturn?.toString() || '0'}
        />
      );
    },
    [changeValidators, nominatorValueList, onPressItem, onPressMore],
  );

  useEffect(() => {
    fetchStaticData<Record<string, ChainRecommendValidator>>('direct-nomination-validator')
      .then(earningValidatorRecommendation => {
        setDefaultValidatorMap(earningValidatorRecommendation);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const selected = changeValidators
      .map(key => {
        const [address] = key.split('___');

        return items.find(item => item.address === address);
      })
      .filter((item): item is ValidatorDataType => !!item)
      .map(item => ({ ...item }));

    setSelectedValidators(selected);
  }, [changeValidators, items]);

  useEffect(() => {
    if (!confirmModal.confirmModalState.visible) {
      setSortSelection(SortKey.DEFAULT);
      setTimeout(() => {
        // sectionRef.current?.setSearchValue('');
      }, 100);
    }
  }, [confirmModal.confirmModalState.visible]);

  const renderSortingItem = (item: SortOption) => {
    return (
      <SelectItem
        key={item.value}
        label={item.label}
        icon={item.desc ? SortDescending : SortAscending}
        backgroundColor={theme.colorPrimary}
        isSelected={sortSelection === item.value}
        onPress={() => onChangeSortOpt(item.value)}
      />
    );
  };

  const renderSectionHeader = useCallback(
    (item: string) => {
      if (defaultValidatorMap?.[chain]) {
        return (
          <View style={styles.header}>
            <Typography.Text size={'sm'} style={styles.titleStyle}>
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
    [chain, defaultValidatorMap, styles.header, styles.titleStyle, theme],
  );

  const groupBy = useMemo(
    () => (item: ValidatorDataTypeItem) => {
      const priority = item.group === ValidatorGroup.RECOMMEND ? '1' : '0';
      return `${priority}|${ValidatorGroupNameMap[item.group]}`;
    },
    [ValidatorGroupNameMap],
  );

  const grouping = useMemo(() => {
    return { groupBy, sortSection, renderSectionHeader };
  }, [groupBy, renderSectionHeader]);

  const rightIconOption = useMemo(
    () => ({
      icon: () => (
        <DotBadge dot={sortSelection !== SortKey.DEFAULT}>
          <Icon phosphorIcon={SortAscending} size="md" />
        </DotBadge>
      ),
      onPress: () => sortingModalRef?.current?.onOpenModal(),
    }),
    [sortSelection],
  );

  return (
    <>
      {!isTransactionDone ? (
        <>
          <FlatListScreen
            items={resultList}
            onPressBack={onCancel}
            rightIconOption={rightIconOption}
            grouping={grouping}
            renderItem={renderItem}
            renderListEmptyComponent={renderEmpty}
            filterFunction={filterFunction}
            estimatedItemSize={58}
            searchFunction={searchFunction}
            filterOptions={filterOptions}
            title={'Select validators'}
            afterListItem={
              <View style={{ paddingHorizontal: theme.padding, paddingBottom: theme.padding, marginTop: theme.margin }}>
                <Button
                  icon={
                    <Icon
                      phosphorIcon={CheckCircle}
                      weight={'fill'}
                      iconColor={!changeValidators.length || submitLoading ? theme.colorTextTertiary : theme.colorWhite}
                    />
                  }
                  disabled={!changeValidators.length || submitLoading}
                  loading={submitLoading}
                  onPress={onPreCheck(
                    () => onPressSubmit({ target: selectedValidators }),
                    ExtrinsicType.CHANGE_EARNING_VALIDATOR,
                  )}>
                  {handleApplyLabel(changeValidators.length)}
                </Button>
              </View>
            }
          />

          <BasicSelectModal
            level={2}
            ref={sortingModalRef}
            title={i18n.header.sorting}
            items={sortingOptions}
            selectedValueMap={{ [sortSelection]: true }}
            onBackButtonPress={() => sortingModalRef.current?.onCloseModal()}
            renderCustomItem={renderSortingItem}>
            <Button
              style={styles.buttonStyle}
              icon={<Icon phosphorIcon={ArrowsClockwise} size={'md'} />}
              onPress={onResetSort}>
              {i18n.buttonTitles.resetSorting}
            </Button>
          </BasicSelectModal>

          {viewDetailItem && (
            <ValidatorSelectorDetailModal
              chain={chain}
              maxPoolMembersValue={maxPoolMembersValue}
              detailItem={viewDetailItem}
              detailModalVisible={detailModalVisible}
              setVisible={setDetailModalVisible}
            />
          )}
        </>
      ) : (
        <TransactionDone
          transactionDoneInfo={transactionDoneInfo}
          extrinsicType={ExtrinsicType.CHANGE_EARNING_VALIDATOR}
        />
      )}
    </>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    header: {
      paddingBottom: theme.sizeXS,
      paddingHorizontal: theme.size,
      backgroundColor: theme.colorBgDefault,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    titleStyle: {
      color: theme.colorTextLight3,
      textTransform: 'uppercase',
      ...FontSemiBold,
    },
    buttonStyle: { marginTop: theme.margin },
  });
}
