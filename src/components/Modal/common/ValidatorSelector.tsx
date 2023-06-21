import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useGetValidatorList, { ValidatorDataType } from 'hooks/screen/Staking/useGetValidatorList';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ListRenderItemInfo } from 'react-native';
import { StakingValidatorItem } from 'components/common/StakingValidatorItem';
import { getValidatorKey } from 'utils/transaction/stake';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { useSelectValidators } from 'hooks/screen/Transaction/useSelectValidators';
import useGetChainStakingMetadata from 'hooks/screen/Staking/useGetChainStakingMetadata';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { CheckCircle } from 'phosphor-react-native';
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
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';

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
  const validatorSelectModalRef = useRef<ModalRef>();
  const { changeValidators, onApplyChangeValidators, onChangeSelectedValidator, onInitValidators } =
    useSelectValidators(
      maxCount,
      onSelectItem,
      isSingleSelect,
      () => validatorSelectModalRef && validatorSelectModalRef.current?.onCloseModal(),
      toastRef,
    );

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
            setDetailItem(item);
            setDetailModalVisible(true);
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
        items={items}
        selectedValueMap={{}}
        selectModalType={'multi'}
        ref={validatorSelectModalRef}
        disabled={!chain || !from || disabled}
        applyBtn={{
          icon: CheckCircle,
          label: `Apply ${changeValidators.length} validators`,
          onPressApplyBtn: onApplyChangeValidators,
          applyBtnDisabled: !changeValidators.length,
        }}
        onBackButtonPress={() => validatorSelectModalRef?.current?.onCloseModal()}
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
        renderCustomItem={renderItem}
        searchFunc={searchFunction}
        placeholder={i18n.common.searchStakingValidator(getValidatorLabel(chain).toLowerCase())}
        title={i18n.common.selectStakingValidator(getValidatorLabel(chain).toLowerCase())}>
        {detailItem && (
          <ValidatorSelectorDetailModal
            detailModalVisible={detailModalVisible}
            detailItem={detailItem}
            onCancel={() => setDetailModalVisible(false)}
            networkPrefix={networkPrefix}
          />
        )}

        {
          <Toast
            duration={TOAST_DURATION}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={OFFSET_BOTTOM}
          />
        }
      </FullSizeSelectModal>
    </>
  );
};
