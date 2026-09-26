import React, { useEffect, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AmountData, NominationInfo } from '@subwallet/extension-base/background/KoniTypes';
import { YieldPoolInfo } from '@subwallet/extension-base/types';
import { NominationSelector } from 'components/Modal/common/NominationSelector';
import { EarningValidatorSelector } from 'components/Modal/Earning/EarningValidatorSelector';
import { fetchPoolTarget } from 'messaging/index';
import { store } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { FreeBalanceDisplay } from 'screens/Transaction/parts/FreeBalanceDisplay';

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
  style?: StyleProp<ViewStyle>;
}

// Same row as the regular FreeBalance ("<native> and <token>") so the label, wrapping and
// spacing match the other tokens; the alpha balance just comes from the staking position.
export const AlphaTokenBalance = ({
  bondedValue,
  decimals,
  error,
  isLoading,
  label,
  nativeTokenBalance,
  style,
  symbol,
}: AlphaTokenBalanceProps) => {
  const tokenBalance = useMemo<AmountData>(
    () => ({ value: bondedValue, decimals, symbol }),
    [bondedValue, decimals, symbol],
  );

  return (
    <FreeBalanceDisplay
      error={error || null}
      isLoading={!!isLoading}
      label={label || i18n.inputLabel.availableBalance}
      nativeTokenBalance={nativeTokenBalance}
      nativeTokenSlug={'native'}
      style={style}
      tokenBalance={tokenBalance}
      tokenSlug={'alpha'}
    />
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
  });
}
