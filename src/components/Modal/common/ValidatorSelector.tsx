import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useGetValidatorList, { ValidatorDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Button, Icon, SelectItem } from 'components/design-system-ui';
import { Keyboard, ListRenderItemInfo } from 'react-native';
import { StakingValidatorItem } from 'components/common/StakingValidatorItem';
import { getValidatorKey } from 'utils/transaction/stake';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { useSelectValidators } from 'hooks/screen/Transaction/useSelectValidators';
import useGetChainStakingMetadata from 'hooks/screen/Staking/useGetChainStakingMetadata';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import {
  ArrowCounterClockwise,
  CheckCircle,
  MagnifyingGlass,
  SortAscending,
  SortDescending,
} from 'phosphor-react-native';
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
import { EmptyList } from 'components/EmptyList';
import { FullSizeSelectModal } from 'components/common/SelectModal';

enum SortKey {
  COMMISSION = 'commission',
  RETURN = 'return',
  MIN_STAKE = 'min-stake',
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
  isSingleSelect?: boolean;
  validatorLoading: boolean;
  selectedValidator?: string;
  disabled?: boolean;
}

const searchFunction = (items: ValidatorDataType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();

  return items.filter(
    ({ identity, address }) =>
      address.toLowerCase().includes(lowerCaseSearchString) ||
      (identity ? identity.toLowerCase().includes(lowerCaseSearchString) : false),
  );
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
const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 140;
export const ValidatorSelector = ({
  chain,
  onSelectItem,
  from,
  isSingleSelect: _isSingleSelect,
  validatorLoading,
  selectedValidator,
  disabled,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const toastRef = useRef<ToastContainer>(null);
  const items = useGetValidatorList(chain, StakingType.NOMINATED) as ValidatorDataType[];
  const [detailItem, setDetailItem] = useState<ValidatorDataType | undefined>(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const nominatorMetadata = useGetNominatorInfo(chain, StakingType.NOMINATED, from);
  const chainStakingMetadata = useGetChainStakingMetadata(chain);
  const maxCount = chainStakingMetadata?.maxValidatorPerNominator || 1;
  const nominations = useMemo(() => nominatorMetadata[0]?.nominations, [nominatorMetadata]);
  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(chain), [chain]);
  const isSingleSelect = useMemo(() => _isSingleSelect || !isRelayChain, [_isSingleSelect, isRelayChain]);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainInfo = chainInfoMap[chain];
  const networkPrefix = _getChainSubstrateAddressPrefix(chainInfo);
  const {
    changeValidators,
    onApplyChangeValidators,
    onCancelSelectValidator,
    onChangeSelectedValidator,
    onInitValidators,
  } = useSelectValidators(maxCount, onSelectItem, isSingleSelect, undefined, toastRef);
  const hasReturn = useMemo(() => items[0]?.expectedReturn !== undefined, [items]);
  const validatorSelectModalRef = useRef<ModalRef>();
  const sortingModalRef = useRef<ModalRef>();
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

    result.push({
      desc: false,
      label: i18n.stakingScreen.lowestActiveStake,
      value: SortKey.MIN_STAKE,
    });

    return result;
  }, [hasReturn]);
  const [sortSelection, setSortSelection] = useState<SortKey>(SortKey.DEFAULT);

  const resultList = useMemo(() => {
    return [...items].sort((a: ValidatorDataType, b: ValidatorDataType) => {
      switch (sortSelection) {
        case SortKey.COMMISSION:
          return a.commission - b.commission;
        case SortKey.RETURN:
          return (b.expectedReturn || 0) - (a.expectedReturn || 0);
        case SortKey.MIN_STAKE:
          return new BigN(a.minBond).minus(b.minBond).toNumber();
        case SortKey.DEFAULT:
        default:
          return 0;
      }
    });
  }, [items, sortSelection]);

  useEffect(() => {
    const defaultValue =
      nominations?.map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity)).join(',') || '';
    const selected = isSingleSelect ? '' : defaultValue;
    onInitValidators(defaultValue, selected);
    onSelectItem && onSelectItem(selected);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nominations, onInitValidators, isSingleSelect]);

  const nominatorValueList = useMemo(() => {
    return nominations && nominations.length
      ? nominations.map(item => getValidatorKey(item.validatorAddress, item.validatorIdentity))
      : [];
  }, [nominations]);

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
          label: i18n.buttonTitles.applyValidators(changeValidators.length),
          onPressApplyBtn: () => {
            onApplyChangeValidators();
            validatorSelectModalRef?.current?.onCloseModal();
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
            label={i18n.common.selectStakingValidator(getValidatorLabel(chain).toLowerCase())}
            loading={validatorLoading}
            placeholder={i18n.common.selectStakingValidator(getValidatorLabel(chain).toLowerCase())}
          />
        )}
        rightIconOption={{
          icon: ({ color }) => <Icon phosphorIcon={SortAscending} size="md" iconColor={color} />,
          onPress: () => sortingModalRef?.current?.onOpenModal(),
        }}
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
        placeholder={i18n.common.searchStakingValidator(getValidatorLabel(chain).toLowerCase())}
        title={i18n.common.selectStakingValidator(getValidatorLabel(chain).toLowerCase())}>
        <>
          {detailItem && (
            <ValidatorSelectorDetailModal
              detailModalVisible={detailModalVisible}
              detailItem={detailItem}
              networkPrefix={networkPrefix}
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
                icon={<Icon phosphorIcon={ArrowCounterClockwise} size={'md'} />}
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
};
