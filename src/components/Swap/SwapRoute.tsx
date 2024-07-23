import { SwapRoute as SwapRouteType } from '@subwallet/extension-base/types/swap';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { View } from 'react-native';
import { Logo, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  swapRoute: SwapRouteType;
}

export const SwapRoute = ({ swapRoute }: Props) => {
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const theme = useSubWalletTheme().swThemes;

  const getSwapRoute = useMemo(() => {
    const results: TokenItemType[] = [];

    swapRoute.path.forEach(slug => {
      const asset = assetRegistryMap[slug];

      if (asset) {
        results.push({
          originChain: asset.originChain,
          slug,
          symbol: asset.symbol,
          name: asset.name,
        });
      }
    });

    return results;
  }, [assetRegistryMap, swapRoute.path]);

  return (
    <View style={{ flexDirection: 'row' }}>
      <View
        style={{
          position: 'absolute',
          height: 2,
          backgroundColor: theme['gray-3'],
          marginTop: 10,
          marginBottom: 16,
          left: 28,
          right: 33,
        }}>
        <View
          style={{
            right: -6,
            top: -4,
            position: 'absolute',
            width: 0,
            height: 0,
            borderTopWidth: 5,
            borderBottomWidth: 5,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftWidth: 9,
            borderLeftColor: theme['gray-3'],
          }}
        />
      </View>
      {getSwapRoute.map((result, index) => {
        const isFirst = index === 0;
        const isLast = index === getSwapRoute.length - 1;

        return (
          <View
            key={index}
            style={[
              { height: 44, gap: 4, justifyContent: 'center', alignItems: 'center', flex: 1 },
              isFirst && { alignItems: 'flex-start' },
              isLast && { alignItems: 'flex-end' },
            ]}>
            <Logo
              isShowSubLogo
              shape={'circle'}
              size={24}
              subNetwork={result.originChain}
              token={result.slug.toLowerCase()}
            />

            <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4 }}>
              {result.symbol}
            </Typography.Text>
          </View>
        );
      })}
    </View>
  );
};
