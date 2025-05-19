import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ScrollView, View } from 'react-native';
import { PencilSimpleLine } from 'phosphor-react-native';
import { FeeOptionItem } from 'components/Modal/TransactionFee/FeeEditor/FeeOptionItem';
import BigN from 'bignumber.js';
import { _SUPPORT_TOKEN_PAY_FEE_GROUP } from '@subwallet/extension-base/constants';
import { InputAmount } from 'components/Input/InputAmount';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { BN_TEN, BN_ZERO, formatNumber } from '@subwallet/extension-base/utils';
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
  const timeOutRef = useRef<NodeJS.Timeout>();
  const [validating, setValidating] = useState(false);
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

  const formConfig = useMemo(
    () => ({
      maxFeeValue: {
        name: 'maxFeeValue',
        value: feeDefaultValue?.maxFeePerGas || '',
      },
      priorityFeeValue: {
        name: 'priorityFeeValue',
        value: feeDefaultValue?.maxPriorityFeePerGas || '',
      },
      customValue: {
        name: 'customValue',
        value: '',
      },
    }),
    [feeDefaultValue?.maxFeePerGas, feeDefaultValue?.maxPriorityFeePerGas],
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
      customMaxFeeValidateFunc(maxFeeValue),
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

  const { formState, onChangeValue, onUpdateErrors } = useFormControl(formConfig, {
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

  const customMaxFeeValidateFunc = useCallback(
    async (value: string) => {
      let result: string[] = [];

      if (!value) {
        result = ['Amount is required'];
      }

      if (feeOptionsInfo && 'baseGasFee' in feeOptionsInfo) {
        const baseGasFee = feeOptionsInfo.baseGasFee;
        const minFee = new BigN(baseGasFee || 0).multipliedBy(1.5);

        if (baseGasFee && value && new BigN(value).lte(minFee)) {
          const message = `Max fee per gas must be higher than ${formatNumber(minFee, 9, s => s)} GWEI`;
          result = [message];
        }

        if (new BigN(value).lte(BN_ZERO)) {
          result = ['The maximum fee must be greater than 0'];
        }
      }

      return result;
    },
    [feeOptionsInfo],
  );

  const customPriorityValidateFunc = useCallback(async (value: string) => {
    let result: string[] = [];

    if (!value) {
      return result;
    }

    if (new BigN(value).lt(BN_ZERO)) {
      result = ['The priority fee must be equal or greater than 0'];
    }

    return result;
  }, []);

  const customValueValidateFunc = useCallback(async (value: string) => {
    let result: string[] = [];

    if (!value) {
      return result;
    }

    if (new BigN(value).lt(BN_ZERO)) {
      result = ['The custom value must be greater than 0'];
    }

    return result;
  }, []);

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (amount) {
      if (formState.data.maxFeeValue) {
        setValidating(true);
        timeOutRef.current = setTimeout(() => {
          customMaxFeeValidateFunc(formState.data.maxFeeValue)
            .then(res => {
              onUpdateErrors('maxFeeValue')(res);
            })
            .catch((error: Error) => console.log('error validate max fee', error.message))
            .finally(() => {
              if (amount) {
                setValidating(false);
              }
            });
        }, 500);
      } else {
        setValidating(false);
      }
    }

    return () => {
      amount = false;
    };
  }, [customMaxFeeValidateFunc, formState.data.accountName, formState.data.maxFeeValue, onUpdateErrors]);

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }

    if (amount) {
      setValidating(true);
      timeOutRef.current = setTimeout(() => {
        customPriorityValidateFunc(formState.data.priorityFeeValue)
          .then(res => {
            onUpdateErrors('priorityFeeValue')(res);
          })
          .catch((error: Error) => console.log('error validate priorityFeeValue', error.message))
          .finally(() => {
            if (amount) {
              setValidating(false);
            }
          });
      }, 500);
    }

    return () => {
      amount = false;
    };
  }, [customPriorityValidateFunc, formState.data.priorityFeeValue, onUpdateErrors]);

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }

    if (amount) {
      setValidating(true);
      timeOutRef.current = setTimeout(() => {
        customValueValidateFunc(formState.data.customValue)
          .then(res => {
            onUpdateErrors('customValue')(res);
          })
          .catch((error: Error) => console.log('error validate customValue', error.message))
          .finally(() => {
            if (amount) {
              setValidating(false);
            }
          });
      }, 500);
    }

    return () => {
      amount = false;
    };
  }, [customValueValidateFunc, formState.data.customValue, onUpdateErrors]);

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

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      onChangeModalVisible={() => {
        setModalVisible(false);
      }}
      modalTitle={'Edit fee'}
      titleTextAlign={'center'}
      isUseModalV2
      footer={
        <View style={{ paddingTop: theme.padding }}>
          <Button disabled={validating} loading={validating} onPress={onPressSubmit}>
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
            {feeType !== 'evm' && <Button size={'xs'} icon={<Icon phosphorIcon={PencilSimpleLine} size={'sm'} />} />}
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
