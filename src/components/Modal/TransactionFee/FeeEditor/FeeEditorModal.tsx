import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EvmEIP1559FeeOption,
  FeeCustom,
  FeeDefaultOption,
  FeeDetail,
  FeeOptionKey,
  TransactionFee,
} from '@subwallet/extension-base/types';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Button, Icon, Logo, SwModal, Typography, Number } from 'components/design-system-ui';
import { SwTab, TabItem } from 'components/design-system-ui/tab';
import { Platform, ScrollView, View } from 'react-native';
import { PencilSimpleLineIcon } from 'phosphor-react-native';
import { FeeOptionItem } from 'components/Modal/TransactionFee/FeeEditor/FeeOptionItem';
import BigN from 'bignumber.js';
import { _SUPPORT_TOKEN_PAY_FEE_GROUP } from '@subwallet/extension-base/constants';
import { InputAmount } from 'components/Input/InputAmount';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import { BN_TEN, BN_ZERO, formatNumber, isEvmEIP1559FeeDetail } from '@subwallet/extension-base/utils';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { deviceHeight } from 'constants/index';

interface Props {
  feeOptionsInfo?: FeeDetail;
  onSelectOption: (option: TransactionFee) => void;
  symbol: string;
  decimals: number;
  tokenSlug: string;
  priceValue: number;
  feeType?: string;
  listTokensCanPayFee?: TokenHasBalanceInfo[];
  onSetTokenPayFee: (token: string) => void;
  currentTokenPayFee?: string;
  chainValue?: string;
  selectedFeeOption?: TransactionFee;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

enum ViewMode {
  RECOMMENDED = 'recommended',
  CUSTOM = 'custom',
}

const OPTIONS: FeeDefaultOption[] = ['slow', 'average', 'fast'];

export const FeeEditorModal = ({
  modalVisible,
  setModalVisible,
  chainValue,
  decimals,
  feeOptionsInfo,
  feeType,
  onSelectOption,
  priceValue,
  selectedFeeOption,
  symbol,
  tokenSlug,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [currentViewMode, setViewMode] = useState<string>(
    selectedFeeOption?.feeOption === 'custom' ? 'custom' : 'recommended',
  );
  const [optionSelected, setOptionSelected] = useState<TransactionFee | undefined>(selectedFeeOption);
  const { currencyData } = useSelector((state: RootState) => state.price);

  const _onSelectOption = useCallback((option: TransactionFee) => {
    return () => {
      setOptionSelected(option);
    };
  }, []);

  const calculateEstimateFee = useCallback(
    (optionKey: FeeOptionKey) => {
      const optionValue = feeOptionsInfo?.options?.[optionKey] as EvmEIP1559FeeOption;

      if (!optionValue) {
        return null;
      }

      if (feeOptionsInfo && 'gasLimit' in feeOptionsInfo) {
        return new BigN(optionValue.maxFeePerGas).multipliedBy(feeOptionsInfo.gasLimit).toFixed(0) || 0;
      }

      return 0;
    },
    [feeOptionsInfo],
  );

  const renderOption = (option: FeeDefaultOption) => {
    const optionValue = feeOptionsInfo?.options?.[option] as EvmEIP1559FeeOption;
    const feeValue = calculateEstimateFee(option as FeeOptionKey);
    const estimatedWaitTime = optionValue
      ? ((optionValue.maxWaitTimeEstimate || 0) + (optionValue.minWaitTimeEstimate || 0)) / 2
      : 0;

    const isSelected = optionSelected
      ? optionSelected?.feeOption === option
      : feeOptionsInfo?.options?.default === option;

    return (
      <FeeOptionItem
        time={estimatedWaitTime}
        type={option}
        feeValueInfo={{
          value: feeValue || 0,
          decimals: decimals,
          symbol: symbol,
        }}
        isSelected={isSelected}
        key={option}
        onPress={_onSelectOption({ feeOption: option })}
      />
    );
  };

  useEffect(() => {
    if (feeType === 'substrate') {
      setViewMode(ViewMode.CUSTOM);
    }
  }, [feeType]);

  const feeDefaultValue = useMemo(() => {
    if (selectedFeeOption && selectedFeeOption.feeOption === 'custom' && selectedFeeOption.feeCustom) {
      return selectedFeeOption.feeCustom as EvmEIP1559FeeOption;
    }

    const defaultOption = feeOptionsInfo?.options?.default;

    if (defaultOption) {
      return feeOptionsInfo?.options?.[defaultOption] as EvmEIP1559FeeOption;
    }

    return undefined;
  }, [feeOptionsInfo?.options, selectedFeeOption]);

  const minRequiredMaxFeePerGas = useMemo(() => {
    if (isEvmEIP1559FeeDetail(feeOptionsInfo)) {
      const baseGasFee = new BigN(feeOptionsInfo.baseGasFee);
      const priorityFee = feeOptionsInfo?.options?.slow?.maxPriorityFeePerGas || 0;

      return baseGasFee.multipliedBy(1.5).plus(priorityFee).integerValue(BigN.ROUND_CEIL);
    }

    return undefined;
  }, [feeOptionsInfo]);

  const customPriorityValidateFunc = useCallback(
    (value: string) => {
      let result: string[] = [];
      if (!value) {
        return result;
      }

      if (new BigN(value).lt(BN_ZERO)) {
        result = ['The priority fee must be equal or greater than 0'];
      }

      if (isEvmEIP1559FeeDetail(feeOptionsInfo)) {
        const fastOption = feeOptionsInfo?.options?.fast;

        if (fastOption?.maxPriorityFeePerGas) {
          const fastPriorityMax = new BigN(fastOption.maxPriorityFeePerGas).multipliedBy(2);

          if (new BigN(value).gt(fastPriorityMax)) {
            result = ['Priority fee is higher than necessary. You may pay more than needed'];
          }
        }
      }

      return result;
    },
    [feeOptionsInfo],
  );

  const customValueValidateFunc = useCallback((value: string) => {
    let result: string[] = [];

    if (!value) {
      return result;
    }

    if (new BigN(value).lt(BN_ZERO)) {
      result = ['The custom value must be greater than 0'];
    }

    return result;
  }, []);

  const customMaxFeeValidateFunc = useCallback(
    (value: string, formValue: Record<string, string>) => {
      let result: string[] = [];

      if (!value) {
        result = ['Amount is required'];
      }

      if (new BigN(value).lte(BN_ZERO)) {
        result = ['The maximum fee must be greater than 0'];
      }

      const priorityFeeValue = formValue.priorityFeeValue;

      if (priorityFeeValue && value && new BigN(value).lt(new BigN(priorityFeeValue))) {
        result = ['Max fee cannot be lower than priority fee'];
      }

      if (isEvmEIP1559FeeDetail(feeOptionsInfo)) {
        if (minRequiredMaxFeePerGas && value && new BigN(value).lt(minRequiredMaxFeePerGas)) {
          const message = `Max fee per gas must be higher than ${formatNumber(
            minRequiredMaxFeePerGas,
            9,
            s => s,
          )} GWEI`;
          result = [message];
        }

        const fastOption = feeOptionsInfo?.options?.fast;

        if (minRequiredMaxFeePerGas && fastOption?.maxFeePerGas) {
          const fastMax = new BigN(fastOption.maxFeePerGas).multipliedBy(2);

          if (new BigN(value).gt(fastMax) && fastMax.gt(minRequiredMaxFeePerGas)) {
            result = ['Max fee is higher than necessary'];
          }
        }
      }

      return result;
    },
    [feeOptionsInfo, minRequiredMaxFeePerGas],
  );

  const formConfig = useMemo(
    (): FormControlConfig => ({
      maxFeeValue: {
        name: 'maxFeeValue',
        value: feeDefaultValue?.maxFeePerGas || '',
        validateFunc: customMaxFeeValidateFunc,
      },
      priorityFeeValue: {
        name: 'priorityFeeValue',
        value: feeDefaultValue?.maxPriorityFeePerGas || '',
        validateFunc: customPriorityValidateFunc,
      },
      customValue: {
        name: 'customValue',
        value: '',
        validateFunc: customValueValidateFunc,
      },
    }),
    [
      customMaxFeeValidateFunc,
      customPriorityValidateFunc,
      customValueValidateFunc,
      feeDefaultValue?.maxFeePerGas,
      feeDefaultValue?.maxPriorityFeePerGas,
    ],
  );

  const _onSubmitCustomOption = async (formState: FormState) => {
    let rs: FeeCustom;

    const { customValue, maxFeeValue, priorityFeeValue } = formState.data;

    if (feeType === 'evm') {
      rs = { maxFeePerGas: maxFeeValue as string, maxPriorityFeePerGas: priorityFeeValue as string };
    } else {
      rs = { tip: customValue as string };
    }

    const [rs1, rs2] = await Promise.all([
      customMaxFeeValidateFunc(maxFeeValue, formState.data),
      customPriorityValidateFunc(priorityFeeValue),
    ]);

    if (rs1 && rs2 && !rs1.length && !rs2.length) {
      onSelectOption({ feeCustom: rs, feeOption: 'custom' });
      setModalVisible(false);
    }
  };

  const onPressSubmit = () => {
    if (currentViewMode === ViewMode.RECOMMENDED) {
      if (optionSelected) {
        onSelectOption(optionSelected);

        setModalVisible(false);
      }
    } else {
      _onSubmitCustomOption(formState).then(() => setModalVisible(false));
    }
  };

  const { formState, onChangeValue } = useFormControl(formConfig, {
    onSubmitForm: onPressSubmit,
  });

  const convertedCustomEvmFee = useMemo(() => {
    const maxFeeValue = formState.data.maxFeeValue || feeDefaultValue?.maxFeePerGas;

    if (maxFeeValue && feeOptionsInfo && 'gasLimit' in feeOptionsInfo) {
      return new BigN(maxFeeValue).multipliedBy(feeOptionsInfo.gasLimit);
    }

    return BN_ZERO;
  }, [feeDefaultValue?.maxFeePerGas, feeOptionsInfo, formState.data.maxFeeValue]);

  const convertedCustomEvmFeeToUSD = useMemo(() => {
    return convertedCustomEvmFee.multipliedBy(priceValue).dividedBy(BN_TEN.pow(decimals));
  }, [convertedCustomEvmFee, decimals, priceValue]);

  const viewOptions = useMemo((): TabItem[] => {
    return [
      { label: 'Recommend', value: ViewMode.RECOMMENDED, onPress: () => {} },
      { label: 'Custom', value: ViewMode.CUSTOM, onPress: () => {} },
    ];
  }, []);

  const onChangeViewMode = useCallback((viewMode: string) => {
    setViewMode(viewMode);
  }, []);

  const convertedCustomValue = useMemo(() => formState.data.customValue, [formState.data.customValue]);

  const transformAmount = useMemo(
    () => (!!convertedCustomValue && new BigN(convertedCustomValue).multipliedBy(priceValue)) || 0,
    [convertedCustomValue, priceValue],
  );

  const renderCustomValueField = () => (
    <>
      <Number
        value={transformAmount}
        decimal={decimals}
        prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
        suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
      />

      <InputAmount
        decimals={decimals}
        disable={decimals === 0}
        maxValue={'1'}
        value={formState.data.customValue}
        onChangeValue={onChangeValue('customValue')}
        showMaxButton={false}
      />
    </>
  );

  const renderEvmFeeFields = () => (
    <View style={{ gap: theme.sizeXS }}>
      <InputAmount
        decimals={9}
        placeholder={'Enter amount'}
        value={formState.data.maxFeeValue}
        maxValue={'0'}
        onChangeValue={onChangeValue('maxFeeValue')}
        label={'Max fee (GWEI)'}
        showMaxButton={false}
        errorMessages={formState.errors.maxFeeValue}
      />

      <InputAmount
        label={'Priority fee (GWEI)'}
        decimals={9}
        placeholder={'Enter amount'}
        value={formState.data.priorityFeeValue}
        maxValue={'0'}
        onChangeValue={onChangeValue('priorityFeeValue')}
        showMaxButton={false}
        errorMessages={formState.errors.priorityFeeValue}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Number
          decimalColor={theme.colorTextLight4}
          intColor={theme.colorTextLight4}
          unitColor={theme.colorTextLight4}
          size={14}
          value={convertedCustomEvmFee}
          decimal={decimals}
          suffix={symbol}
        />
        <Number
          decimalColor={theme.colorTextLight4}
          intColor={theme.colorTextLight4}
          unitColor={theme.colorTextLight4}
          size={14}
          value={convertedCustomEvmFeeToUSD}
          decimal={0}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
        />
      </View>
    </View>
  );

  const disabledSubmitBtn = useMemo(() => {
    return (
      !!formState.errors.customValue.length ||
      !!formState.errors.maxFeeValue.length ||
      !!formState.errors.priorityFeeValue.length
    );
  }, [formState.errors.customValue, formState.errors.maxFeeValue, formState.errors.priorityFeeValue]);

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      onChangeModalVisible={() => {
        setModalVisible(false);
      }}
      isAllowSwipeDown={Platform.OS === 'ios'}
      modalTitle={'Edit fee'}
      titleTextAlign={'center'}
      isUseModalV2
      footer={
        <View style={{ paddingTop: theme.padding }}>
          <Button disabled={disabledSubmitBtn && currentViewMode === 'custom'} onPress={onPressSubmit}>
            {'Apply fee'}
          </Button>
        </View>
      }>
      <ScrollView
        style={{ maxHeight: deviceHeight * 0.4 }}
        keyboardShouldPersistTaps={'handled'}
        showsVerticalScrollIndicator={false}>
        {feeType === 'evm' && (
          <SwTab tabs={viewOptions} selectedValue={currentViewMode} onSelectType={onChangeViewMode} />
        )}

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.colorBgSecondary,
            borderRadius: theme.borderRadiusLG,
            marginBottom: theme.marginXS,
            padding: theme.paddingSM,
            justifyContent: 'space-between',
          }}>
          <Typography.Text style={{ color: theme.colorTextTertiary }}>{'Fee paid in'}</Typography.Text>
          <View style={{ flexDirection: 'row' }}>
            <Logo size={24} isShowSubLogo={false} token={tokenSlug.toLowerCase()} shape={'circle'} />
            <Typography.Text style={{ paddingLeft: theme.paddingXS, color: theme.colorWhite }}>
              {symbol}
            </Typography.Text>
            {feeType !== 'evm' && <Button size={'xs'} icon={<Icon phosphorIcon={PencilSimpleLineIcon} size={'sm'} />} />}
          </View>
        </View>

        {currentViewMode === 'recommended' && <View style={{ gap: theme.sizeXS }}>{OPTIONS.map(renderOption)}</View>}

        {currentViewMode === 'custom' && (
          <>
            {feeType === 'evm'
              ? renderEvmFeeFields()
              : chainValue && _SUPPORT_TOKEN_PAY_FEE_GROUP.assetHub.includes(chainValue)
              ? null
              : renderCustomValueField()}
          </>
        )}
      </ScrollView>
    </SwModal>
  );
};
