import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AmountData, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { NominationSelector } from 'components/Modal/common/NominationSelector';
import { EarningValidatorSelector } from 'components/Modal/Earning/EarningValidatorSelector';
import { ActivityIndicator, Number, Typography } from 'components/design-system-ui';
import { fetchPoolTarget } from 'messaging/index';
import { store } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

interface Props {
  chainValue: string;
  fromValue: string;
  poolInfo: YieldPoolInfo;
  nominators: NominationInfo[];
  fromValidator?: string;
  toValidator?: string;
  onChangeFromValidator: (value: string) => void;
  onChangeToValidator: (value: string) => void;
  setTargetLoading: (value: boolean) => void;
  disabled?: boolean;
}

interface AlphaTokenBalanceProps {
  bondedValue: string;
  decimals: number;
  symbol: string;
  nativeTokenBalance: AmountData;
  isLoading?: boolean;
  error?: string | null;
  label?: string;
}

export const AlphaTokenBalance = ({
  bondedValue,
  decimals,
  error,
  isLoading,
  label,
  nativeTokenBalance,
  symbol,
}: AlphaTokenBalanceProps) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  if (error) {
    return (
      <View style={stylesheet.balanceWrapper}>
        <Typography.Text style={stylesheet.errorText}>{error}</Typography.Text>
      </View>
    );
  }

  return (
    <View style={stylesheet.balanceWrapper}>
      <Typography.Text style={stylesheet.balanceLabel}>{`${
        label || i18n.inputLabel.availableBalance
      }:`}</Typography.Text>

      {isLoading ? (
        <ActivityIndicator size={14} indicatorColor={theme.colorTextTertiary} />
      ) : (
        <View style={stylesheet.balanceValueWrapper}>
          <Number
            size={14}
            decimal={nativeTokenBalance.decimals || 0}
            suffix={nativeTokenBalance.symbol}
            value={nativeTokenBalance.value}
            intColor={theme.colorTextTertiary}
            decimalColor={theme.colorTextTertiary}
            unitColor={theme.colorTextTertiary}
          />
          <Typography.Text style={stylesheet.balanceLabel}>{i18n.common.and}</Typography.Text>
          <Number
            size={14}
            decimal={decimals}
            suffix={symbol}
            value={bondedValue}
            intColor={theme.colorTextTertiary}
            decimalColor={theme.colorTextTertiary}
            unitColor={theme.colorTextTertiary}
          />
        </View>
      )}
    </View>
  );
};

export const AlphaTokenTransferSection = ({
  chainValue,
  disabled,
  fromValidator,
  fromValue,
  nominators,
  onChangeFromValidator,
  onChangeToValidator,
  poolInfo,
  setTargetLoading,
  toValidator,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const [forceFetchValidator, setForceFetchValidator] = useState(false);

  useEffect(() => {
    let unmount = false;

    if (fromValue || forceFetchValidator) {
      setTargetLoading(true);
      const slug = poolInfo?.slug || '';

      fetchPoolTarget({ slug })
        .then(result => {
          if (!unmount) {
            store.dispatch({ type: 'earning/updatePoolTargets', payload: result });
          }
        })
        .catch(console.error)
        .finally(() => {
          if (!unmount) {
            setTargetLoading(false);
            setForceFetchValidator(false);
          }
        });
    }

    return () => {
      unmount = true;
      // avoid keeping the loading state when this section is unmounted while fetching
      setTargetLoading(false);
    };
  }, [forceFetchValidator, fromValue, poolInfo?.slug, setTargetLoading]);

  return (
    <View style={stylesheet.container}>
      <NominationSelector
        chain={chainValue}
        disabled={disabled || !fromValue}
        isChangeValidator
        label={i18n.inputLabel.selectFromValidator}
        nominators={nominators}
        poolInfo={poolInfo}
        selectedValue={fromValidator || ''}
        onSelectItem={onChangeFromValidator}
      />

      <EarningValidatorSelector
        chain={chainValue}
        from={fromValue}
        slug={poolInfo.slug}
        disabled={disabled || !fromValue}
        label={i18n.inputLabel.selectToValidator}
        originValidator={fromValidator}
        selectedValidator={toValidator}
        setForceFetchValidator={setForceFetchValidator}
        validatorLoading={false}
        onSelectItem={onChangeToValidator}
      />
    </View>
  );
};

function createStylesheet(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      marginBottom: theme.marginXXS,
    },
    balanceWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.sizeXXS,
      marginBottom: theme.marginSM,
    },
    balanceValueWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    balanceLabel: {
      color: theme.colorTextTertiary,
    },
    errorText: {
      color: theme.colorError,
    },
  });
}
