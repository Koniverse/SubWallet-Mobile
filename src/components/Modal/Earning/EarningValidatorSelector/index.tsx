import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { useGetPoolTargetList, useYieldPositionDetail } from 'hooks/earning';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Button, Icon, SelectItem } from 'components/design-system-ui';
import { Keyboard, ListRenderItemInfo } from 'react-native';
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

    const nominations = useMemo(() => compound?.nominations || [], [compound]);
    const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
    const isSingleSelect = useMemo(() => _isSingleSelect || !isRelayChain, [_isSingleSelect, isRelayChain]);
    const hasReturn = useMemo(() => items[0]?.expectedReturn !== undefined, [items]);

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
    } = useSelectValidators(maxCount, onSelectItem, isSingleSelect, undefined, toastRef);

    const [detailItem, setDetailItem] = useState<ValidatorDataType | undefined>(undefined);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - insets.bottom - insets.top - 50;

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
      }),
      [resetValidatorSelector],
    );

    useEffect(() => {
      const defaultValue =
        nominations?.map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity)).join(',') || '';
      const selected = isSingleSelect ? '' : defaultValue;
      onInitValidators(defaultValue, selected);
      onSelectItem && onSelectItem(selected);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nominations, onInitValidators, isSingleSelect]);

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
        const selected = changeValidators.includes(key);
        const nominated = nominatorValueList.includes(key);

        return (
          <StakingValidatorItem
            validatorInfo={item}
            onPress={onChangeSelectedValidator}
            onPressRightButton={() => {
              Keyboard.dismiss();
              setDetailItem(item);
              setTimeout(() => {
                setDetailModalVisible(true);
              }, 100);
            }}
            isNominated={nominated}
            isSelected={selected}
          />
        );
      },
      [changeValidators, nominatorValueList, onChangeSelectedValidator],
    );

    return (
      <>
        <FullSizeSelectModal
          items={resultList}
          selectedValueMap={{}}
          selectModalType={'multi'}
          ref={validatorSelectModalRef}
          disabled={!chain || !from || disabled}
          applyBtn={{
            icon: CheckCircle,
            label: applyLabel,
            onPressApplyBtn: () => {
              onApplyChangeValidators();
              validatorSelectModalRef?.current?.closeModal && validatorSelectModalRef?.current?.closeModal();
            },
            applyBtnDisabled: !changeValidators.length,
          }}
          onBackButtonPress={() => validatorSelectModalRef?.current?.onCloseModal()}
          onCloseModal={() => {
            setSortSelection(SortKey.DEFAULT);
            onCancelSelectValidator();
          }}
          renderListEmptyComponent={renderListEmptyComponent}
          renderSelected={() => (
            <ValidatorSelectorField
              onPressLightningBtn={() => validatorSelectModalRef?.current?.onOpenModal()}
              onPressBookBtn={() => validatorSelectModalRef?.current?.onOpenModal()}
              value={selectedValidator}
              label={
                i18n.formatString(
                  i18n.common.selectStakingValidator,
                  getValidatorLabel(chain) === 'dApp'
                    ? getValidatorLabel(chain)
                    : getValidatorLabel(chain).toLowerCase(),
                ) as string
              }
              loading={validatorLoading}
              placeholder={
                i18n.formatString(
                  i18n.common.selectStakingValidator,
                  getValidatorLabel(chain) === 'dApp'
                    ? getValidatorLabel(chain)
                    : getValidatorLabel(chain).toLowerCase(),
                ) as string
              }
            />
          )}
          rightIconOption={{
            icon: ({ color }) => <Icon phosphorIcon={SortAscending} size="md" iconColor={color} />,
            onPress: () => sortingModalRef?.current?.onOpenModal(),
          }}
          renderCustomItem={renderItem}
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

            {
              <Toast
                duration={TOAST_DURATION}
                normalColor={ColorMap.notification}
                ref={toastRef}
                placement={'bottom'}
                offsetBottom={OFFSET_BOTTOM}
              />
            }
          </>
        </FullSizeSelectModal>
      </>
    );
  },
);
