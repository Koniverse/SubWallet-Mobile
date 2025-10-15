import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { useGetPoolTargetList, useYieldPositionDetail } from 'hooks/earning';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Button, Icon, SelectItem } from 'components/design-system-ui';
import { Keyboard, ListRenderItemInfo, Platform } from 'react-native';
import { StakingValidatorItem } from 'components/common/StakingValidatorItem';
import { getValidatorKey } from 'utils/transaction/stake';
import { useSelectValidators } from 'hooks/screen/Transaction/useSelectValidators';
import { ArrowsClockwise, CheckCircle, MagnifyingGlass, SortAscending, SortDescending } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ValidatorSelectorField } from 'components/Field/ValidatorSelector';
import { ValidatorSelectorDetailModal } from 'components/Modal/common/ValidatorSelectorDetailModal';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import { ColorMap } from 'styles/color';
import ToastContainer from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { ModalRef } from 'types/modalRef';
import { BasicSelectModal } from 'components/common/SelectModal/BasicSelectModal';
import BigN from 'bignumber.js';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { EmptyValidator } from 'components/EmptyValidator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ValidatorDataType } from 'types/earning';
import { useKeyboardVisible } from 'hooks/useKeyboardVisible';
import { NominationInfo, YieldPoolType } from '@subwallet/extension-base/types';
import DotBadge from 'components/design-system-ui/badge/DotBadge';
import { autoSelectValidatorOptimally } from 'utils/earning';
import { fetchStaticData } from 'utils/fetchStaticData';
import { ChainRecommendValidator } from '@subwallet/extension-base/constants';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';

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

interface Props {
  onSelectItem?: (value: string) => void;
  chain: string;
  from: string;
  slug: string;
  isSingleSelect?: boolean;
  validatorLoading: boolean;
  selectedValidator?: string;
  disabled?: boolean;
  setForceFetchValidator: (val: boolean) => void;
  defaultValidatorAddress?: string;
}

const searchFunction = (items: ValidatorDataType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  return items.filter(
    ({ identity, address }) =>
      address.toLowerCase().includes(lowerCaseSearchString) ||
      (identity ? identity.toLowerCase().includes(lowerCaseSearchString) : false),
  );
};

export interface ValidatorSelectorRef {
  resetValue: () => void;
  onOpenModal: () => void;
}

export const EarningValidatorSelector = forwardRef(
  (
    {
      chain,
      onSelectItem,
      from,
      isSingleSelect: _isSingleSelect,
      validatorLoading,
      selectedValidator,
      disabled,
      setForceFetchValidator,
      slug,
      defaultValidatorAddress,
    }: Props,
    ref: React.Ref<ValidatorSelectorRef>,
  ) => {
    const theme = useSubWalletTheme().swThemes;
    const toastRef = useRef<ToastContainer>(null);
    const items = useGetPoolTargetList(slug) as ValidatorDataType[];
    const insets = useSafeAreaInsets();

    const validatorSelectModalRef = useRef<ModalRef>();
    const sortingModalRef = useRef<ModalRef>();

    const { compound } = useYieldPositionDetail(slug, from);

    const { poolInfoMap } = useSelector((state: RootState) => state.earning);
    const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

    const poolInfo = poolInfoMap[slug];
    const maxCount = poolInfo?.statistic?.maxCandidatePerFarmer || 1;

    const chainInfo = chainInfoMap[chain];
    const networkPrefix = _getChainSubstrateAddressPrefix(chainInfo);

    // const cachedNominations = useMemo(() => compound?.nominations || [], [compound]);
    const [nominations] = useState<NominationInfo[]>(compound?.nominations || []);
    const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
    const isSingleSelect = useMemo(() => _isSingleSelect || !isRelayChain, [_isSingleSelect, isRelayChain]);
    const hasReturn = useMemo(() => items[0]?.expectedReturn !== undefined, [items]);

    const maxPoolMembersValue = useMemo(() => {
      if (poolInfo.type === YieldPoolType.NATIVE_STAKING) {
        // todo: should also check chain group for pool
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

    const {
      resetValidatorSelector,
      changeValidators,
      onApplyChangeValidators,
      onCancelSelectValidator,
      onChangeSelectedValidator,
      onInitValidators,
      onAutoSelectValidator,
    } = useSelectValidators(items, maxCount, onSelectItem, isSingleSelect, undefined, toastRef);
    const { keyboardHeight } = useKeyboardVisible();
    const defaultValueRef = useRef({ _default: '_', selected: '_' });
    const [detailItem, setDetailItem] = useState<ValidatorDataType | undefined>(undefined);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [autoValidator, setAutoValidator] = useState('');
    const [defaultPoolMap, setDefaultPoolMap] = useState<Record<string, ChainRecommendValidator>>({});
    const OFFSET_BOTTOM = useMemo(
      () =>
        deviceHeight -
        STATUS_BAR_HEIGHT -
        insets.bottom -
        insets.top -
        50 -
        (Platform.OS === 'android' ? keyboardHeight : 0),
      [insets.bottom, insets.top, keyboardHeight],
    );

    const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);
    const fewValidators = changeValidators.length > 1;
    const applyLabel = useMemo(() => {
      const label = getValidatorLabel(chain);

      if (!fewValidators) {
        switch (label) {
          case 'dApp':
            return i18n.formatString(i18n.buttonTitles.applyDApp, changeValidators.length) as string;
          case 'Collator':
            return i18n.formatString(i18n.buttonTitles.applyCollator, changeValidators.length) as string;
          case 'Validator':
            return i18n.formatString(i18n.buttonTitles.applyValidator, changeValidators.length) as string;
        }
      } else {
        switch (label) {
          case 'dApp':
            return i18n.formatString(i18n.buttonTitles.applyDApps, changeValidators.length) as string;
          case 'Collator':
            return i18n.formatString(i18n.buttonTitles.applyCollators, changeValidators.length) as string;
          case 'Validator':
            return i18n.formatString(i18n.buttonTitles.applyValidators, changeValidators.length) as string;
        }
      }
    }, [chain, changeValidators.length, fewValidators]);

    const nominatorValueList = useMemo(() => {
      return nominations && nominations.length
        ? nominations.map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity))
        : [];
    }, [nominations]);

    const sortValidator = useCallback(
      (a: ValidatorDataType, b: ValidatorDataType) => {
        const aKey = getValidatorKey(a.address, a.identity);
        const bKey = getValidatorKey(b.address, b.identity);

        if (nominatorValueList.includes(aKey) && !nominatorValueList.includes(bKey)) {
          return -1;
        }

        return 1;
      },
      [nominatorValueList],
    );

    const resultList = useMemo(() => {
      return [...items].sort((a: ValidatorDataType, b: ValidatorDataType) => {
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
          default:
            return 0;
        }
      });
    }, [items, sortSelection, sortValidator]);

    const renderListEmptyComponent = useCallback(() => {
      return (
        <EmptyValidator
          title={i18n.emptyScreen.selectorEmptyTitle}
          message={i18n.emptyScreen.selectorEmptyMessage}
          icon={MagnifyingGlass}
          isDataEmpty={items.length === 0}
          validatorTitle={
            getValidatorLabel(chain) === 'dApp' ? getValidatorLabel(chain) : getValidatorLabel(chain).toLowerCase()
          }
          onClickReload={setForceFetchValidator}
        />
      );
    }, [chain, items.length, setForceFetchValidator]);

    useImperativeHandle(
      ref,
      () => ({
        resetValue: () => resetValidatorSelector(),
        onOpenModal: () => {
          validatorSelectModalRef?.current?.onOpenModal?.();
        },
      }),
      [resetValidatorSelector],
    );

    const externalDefaultValue = useMemo(() => {
      let defaultSelectedList: ValidatorDataType[] = [];
      if (defaultValidatorAddress) {
        const defaultValidator = resultList.find(item => item.address === defaultValidatorAddress);
        if (defaultValidator) {
          defaultSelectedList = [defaultValidator];
        } else {
          defaultSelectedList = [];
        }
      }

      return defaultSelectedList;
    }, [defaultValidatorAddress, resultList]);
    //
    // useEffect(() => {
    //   setNominations(old => {
    //     const sortNomination = (a: NominationInfo, b: NominationInfo) => {
    //       if (a.validatorAddress > b.validatorAddress) {
    //         return 1;
    //       } else if (a.validatorAddress < b.validatorAddress) {
    //         return -1;
    //       }
    //
    //       return 0;
    //     };
    //
    //     const oldSorted = old
    //       .sort(sortNomination)
    //       .map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity))
    //       .join('---');
    //     const newSorted = cachedNominations
    //       .sort(sortNomination)
    //       .map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity))
    //       .join('---');
    //
    //     if (oldSorted !== newSorted) {
    //       return cachedNominations;
    //     }
    //
    //     return old;
    //   });
    // }, [cachedNominations]);

    useEffect(() => {
      fetchStaticData<Record<string, ChainRecommendValidator>>('direct-nomination-validator')
        .then(earningPoolRecommendation => {
          setDefaultPoolMap(earningPoolRecommendation);
        })
        .catch(console.error);
    }, []);

    useEffect(() => {
      const recommendValidator = defaultPoolMap[chain];

      if (recommendValidator) {
        setAutoValidator(old => {
          if (old) {
            return old;
          } else {
            const _selectedValidator = autoSelectValidatorOptimally(
              items,
              recommendValidator.maxCount,
              true,
              recommendValidator.preSelectValidators,
            );

            return _selectedValidator.map(item => getValidatorKey(item.address, item.identity)).join(',');
          }
        });
      } else {
        setAutoValidator('');
      }
    }, [chain, defaultPoolMap, items]);

    useEffect(() => {
      const _default =
        nominations?.map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity)).join(',') ||
        autoValidator ||
        '';
      let defaultValue = '';
      if (externalDefaultValue && externalDefaultValue.length) {
        defaultValue = externalDefaultValue.map(item => getValidatorKey(item.address, item.identity)).join(',');
      }

      const selected = defaultValue || defaultValidatorAddress || (isSingleSelect ? '' : _default);

      if (defaultValueRef.current._default === _default && defaultValueRef.current.selected === selected) {
        return;
      }

      onInitValidators(_default, selected);
      onSelectItem && onSelectItem(selected);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSingleSelect, from, defaultValidatorAddress, autoValidator]);

    const applyBtn = useMemo(
      () => ({
        icon: CheckCircle,
        label: applyLabel,
        onPressApplyBtn: () => {
          validatorSelectModalRef?.current?.closeModal?.();
          onApplyChangeValidators();
        },
        applyBtnDisabled: !changeValidators.length,
      }),
      [applyLabel, changeValidators.length, onApplyChangeValidators],
    );

    // const customBtn = useMemo(
    //   () => ({
    //     icon: Lightning,
    //     onPressCustomBtn: () => {
    //       validatorSelectModalRef?.current?.closeModal?.();
    //       onAutoSelectValidator();
    //     },
    //     customBtnDisabled: !items.length,
    //   }),
    //   [items.length, onAutoSelectValidator],
    // );

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
      ({ item }: ListRenderItemInfo<ValidatorDataType>) => {
        const key = getValidatorKey(item.address, item.identity);
        const keyBase = key.split('___')[0];
        const selected = changeValidators.includes(key);
        const nominated =
          nominatorValueList.includes(key) || nominatorValueList.some(nom => nom.split('___')[0] === keyBase);

        return (
          <StakingValidatorItem
            validatorInfo={item}
            onPress={onChangeSelectedValidator}
            onPressRightButton={() => {
              Keyboard.dismiss();
              setDetailItem(item);
              delayActionAfterDismissKeyboard(() => setDetailModalVisible(true));
            }}
            isNominated={nominated}
            isSelected={selected}
          />
        );
      },
      [changeValidators, nominatorValueList, onChangeSelectedValidator],
    );

    const renderSelected = useCallback(
      () => (
        <ValidatorSelectorField
          showLightningBtn={false}
          onPressLightningBtn={() => onAutoSelectValidator()}
          onPressBookBtn={() => validatorSelectModalRef?.current?.onOpenModal()}
          value={selectedValidator}
          label={
            i18n.formatString(
              i18n.common.selectStakingValidator,
              getValidatorLabel(chain) === 'dApp' ? getValidatorLabel(chain) : getValidatorLabel(chain).toLowerCase(),
            ) as string
          }
          loading={validatorLoading}
          placeholder={
            i18n.formatString(
              i18n.common.selectStakingValidator,
              getValidatorLabel(chain) === 'dApp' ? getValidatorLabel(chain) : getValidatorLabel(chain).toLowerCase(),
            ) as string
          }
        />
      ),
      [chain, onAutoSelectValidator, selectedValidator, validatorLoading],
    );

    return (
      <FullSizeSelectModal
        items={resultList}
        selectedValueMap={{}}
        selectModalType={'multi'}
        extraData={JSON.stringify(changeValidators)}
        ref={validatorSelectModalRef}
        disabled={!chain || !from || disabled}
        // customBtn={customBtn}
        applyBtn={applyBtn}
        onCloseModal={() => {
          setSortSelection(SortKey.DEFAULT);
          onCancelSelectValidator();
        }}
        renderListEmptyComponent={renderListEmptyComponent}
        renderSelected={renderSelected}
        rightIconOption={{
          icon: () => (
            <DotBadge dot={sortSelection !== SortKey.DEFAULT}>
              <Icon phosphorIcon={SortAscending} size="md" />
            </DotBadge>
          ),
          onPress: () => sortingModalRef?.current?.onOpenModal(),
        }}
        renderCustomItem={renderItem}
        keyExtractor={item => getValidatorKey(item.address, item.identity)}
        searchFunc={searchFunction}
        placeholder={
          i18n.formatString(
            i18n.common.selectStakingValidator,
            getValidatorLabel(chain) === 'dApp' ? getValidatorLabel(chain) : getValidatorLabel(chain).toLowerCase(),
          ) as string
        }
        title={
          i18n.formatString(
            i18n.common.selectStakingValidator,
            getValidatorLabel(chain) === 'dApp' ? getValidatorLabel(chain) : getValidatorLabel(chain).toLowerCase(),
          ) as string
        }>
        <>
          {detailItem && (
            <ValidatorSelectorDetailModal
              detailModalVisible={detailModalVisible}
              detailItem={detailItem}
              maxPoolMembersValue={maxPoolMembersValue}
              networkPrefix={networkPrefix}
              setVisible={setDetailModalVisible}
              chain={chain}
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
            <Button
              style={{ marginTop: 16 }}
              icon={<Icon phosphorIcon={ArrowsClockwise} size={'md'} />}
              onPress={() => {
                setSortSelection(SortKey.DEFAULT);
                sortingModalRef?.current?.onCloseModal();
              }}>
              {i18n.buttonTitles.resetSorting}
            </Button>
          </BasicSelectModal>

          <Toast
            duration={TOAST_DURATION}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={OFFSET_BOTTOM}
            textStyle={{ textAlign: 'center', ...FontMedium }}
            style={{ borderRadius: 8 }}
          />
        </>
      </FullSizeSelectModal>
    );
  },
);
