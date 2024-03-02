// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Number, ActivityIndicator } from 'components/design-system-ui';
import { useGetBalance } from 'hooks/balance';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { FontMedium } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

interface BalanceInfo {
  token: string;
  chain: string;
}

interface Props {
  address: string;
  tokens: BalanceInfo[];
  label?: string;
  onBalanceReady?: (rs: boolean) => void;
  style?: StyleProp<ViewStyle>;
  hidden?: boolean;
}

interface PartProps {
  token: string;
  chain: string;
  address: string;
  setLoading: (val: boolean) => void;
  setError: (val: string | null) => void;
  showNetwork: boolean;
  first: boolean;
  showContent: boolean;
}

const parseToLoadingMap = (tokens: BalanceInfo[]): Record<string, boolean> => {
  const result: Record<string, boolean> = {};

  tokens.forEach(({ token }) => {
    result[token] = true;
  });

  return result;
};

const parseToErrorMap = (tokens: BalanceInfo[]): Record<string, string | null> => {
  const result: Record<string, string | null> = {};

  tokens.forEach(({ token }) => {
    result[token] = null;
  });

  return result;
};

const PartComponent: React.FC<PartProps> = (props: PartProps) => {
  const { address, chain, first, setError, setLoading, showContent, showNetwork, token } = props;

  const theme = useSubWalletTheme().swThemes;

  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const { error, isLoading, nativeTokenBalance, nativeTokenSlug, tokenBalance } = useGetBalance(
    chain,
    address,
    token,
    true,
  );

  const balance = useMemo(() => {
    if (token) {
      if (nativeTokenSlug === token) {
        return nativeTokenBalance;
      } else {
        return tokenBalance;
      }
    }

    return undefined;
  }, [nativeTokenBalance, nativeTokenSlug, token, tokenBalance]);

  const suffix = useMemo(() => {
    let result = balance?.symbol || '';

    const chainInfo = chainInfoMap[chain];

    if (showNetwork && chainInfo) {
      result += ` (${chainInfo.name})`;
    }

    return result;
  }, [balance?.symbol, chain, chainInfoMap, showNetwork]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    setError(error);
  }, [error, setError]);

  if (isLoading || !showContent) {
    return null;
  }

  return (
    <>
      {!first && (
        <Typography.Text style={{ fontSize: 14, lineHeight: 22, color: theme.colorTextTertiary, ...FontMedium }}>
          &nbsp;{'and'}&nbsp;
        </Typography.Text>
      )}
      {balance && (
        <Number
          decimal={balance.decimals || 18}
          decimalColor={theme.colorTextTertiary}
          intColor={theme.colorTextTertiary}
          size={14}
          suffix={suffix}
          unitColor={theme.colorTextTertiary}
          value={balance.value}
        />
      )}
    </>
  );
};

const FreeBalanceToYield = (props: Props) => {
  const { address, label, onBalanceReady, tokens, style, hidden } = props;

  const theme = useSubWalletTheme().swThemes;

  const loadingRef = useRef<Record<string, boolean>>(parseToLoadingMap(tokens));
  const errorRef = useRef<Record<string, string | null>>(parseToErrorMap(tokens));

  const showNetwork = useMemo(() => {
    let temp = '';

    for (const { chain } of tokens) {
      if (temp) {
        if (temp !== chain) {
          return true;
        }
      } else {
        temp = chain;
      }
    }

    return false;
  }, [tokens]);

  const [isLoading, _setIsLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  const setLoading = useCallback((slug: string) => {
    return (data: boolean) => {
      loadingRef.current[slug] = data;

      let _isLoading = false;

      for (const loading of Object.values(loadingRef.current)) {
        if (loading) {
          _isLoading = true;
          break;
        }
      }

      _setIsLoading(_isLoading);
    };
  }, []);

  const setError = useCallback((slug: string) => {
    return (data: string | null) => {
      errorRef.current[slug] = data;

      let _error: string | null = null;

      for (const value of Object.values(errorRef.current)) {
        if (value) {
          _error = value;
          break;
        }
      }

      _setError(_error);
    };
  }, []);

  useEffect(() => {
    onBalanceReady?.(!isLoading && !error);
  }, [error, isLoading, onBalanceReady]);

  if (!address && !hidden) {
    return (
      <View style={[{ marginBottom: 12 }, style]}>
        <Typography.Text style={{ color: theme.colorTextTertiary }}>
          Select account to view available balance
        </Typography.Text>
      </View>
    );
  }

  if (!address && !tokens.length) {
    return <></>;
  }

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          marginBottom: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          display: hidden ? 'none' : 'flex',
        },
        style,
      ]}>
      {!error && (
        <Typography.Text
          style={{ fontSize: 14, lineHeight: 22, color: theme.colorTextTertiary, ...FontMedium, paddingRight: 4 }}>
          {label || `${i18n.sendToken.senderAvailableBalance}:`}
        </Typography.Text>
      )}
      {isLoading && <ActivityIndicator size={14} />}
      {error && (
        <Typography.Text style={{ fontSize: 14, lineHeight: 22, color: theme.colorError, ...FontMedium }}>
          {error}
        </Typography.Text>
      )}
      {tokens.map(({ chain, token }, index) => {
        return (
          <PartComponent
            address={address}
            chain={chain}
            first={index === 0}
            key={token}
            setError={setError(token)}
            setLoading={setLoading(token)}
            showContent={!error && !isLoading}
            showNetwork={showNetwork}
            token={token}
          />
        );
      })}
    </View>
  );
};

export default FreeBalanceToYield;
