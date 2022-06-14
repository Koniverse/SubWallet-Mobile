import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { sharedStyles } from 'styles/sharedStyles';
import Loading from 'components/Loading';

interface Props {
  isLoading: boolean;
}

export const ChainBalance = ({ isLoading }: Props) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        chainBalanceMainArea: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 16,
          paddingBottom: 16,
        },
        chainBalancePart1: {
          flexDirection: 'row',
        },
        textStyle: {
          ...sharedStyles.mainText,
          fontWeight: '500',
          color: theme.textColor,
        },
        subTextStyle: {
          ...sharedStyles.mainText,
          color: theme.textColor2,
        },
        chainBalanceMetaWrapper: {
          paddingLeft: 16,
        },
        chainBalancePart2: {
          alignItems: 'flex-end',
        },
        chainBalanceSeparator: {
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          marginLeft: 56,
        },
      }),
    [theme],
  );

  return (
    <View style={{ width: '100%' }}>
      <View style={styles.chainBalanceMainArea}>
        <View style={styles.chainBalancePart1}>
          {getNetworkLogo('polkadot', 40)}
          <View style={styles.chainBalanceMetaWrapper}>
            <Text style={styles.textStyle}>Polkadot Relay Chain</Text>
            <Text style={styles.subTextStyle}>{toShort('12indbLeXK6wt77TvzHbnm13NEk79fozg5rE8JyREHgwGr79')}</Text>
          </View>
        </View>

        {isLoading && (
          <View style={styles.chainBalancePart2}>
            <Loading width={40} height={40} />
          </View>
        )}

        {!isLoading && (
          <View style={styles.chainBalancePart2}>
            <Text style={styles.textStyle}>1200 DOT</Text>
            <Text style={styles.subTextStyle}>$1,800</Text>
          </View>
        )}
      </View>

      <View style={styles.chainBalanceSeparator} />
    </View>
  );
};
