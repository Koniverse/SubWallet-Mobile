import React, { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { TokenSelector, TokenItemType, TokenSelectorItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import BigN from 'bignumber.js';
import { ActivityIndicator, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapTokenSelectField } from 'components/Field/SwapTokenSelect';
import { formatNumberString, swapCustomFormatter } from '@subwallet/extension-base/utils';
import { BN_TEN } from 'utils/chainBalances';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { OptionType } from 'components/common/FilterModal';

interface Props {
  tokenSelectorItems: TokenItemType[];
  assetValue: string;
  chainValue: string;
  chainInfo: _ChainInfo;
  swapValue: BigN | string | number;
  onSelectToken?: (item: string) => void;
  toAsset?: _ChainAsset;
  decimals: number;
  loading?: boolean;
}

export const SwapToField = ({
  tokenSelectorItems,
  assetValue,
  chainValue,
  chainInfo,
  onSelectToken,
  swapValue,
  toAsset,
  decimals,
  loading,
}: Props) => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const tokenSelectorRef = useRef<ModalRef>();
  const theme = useSubWalletTheme().swThemes;
  const chainName = chainInfo ? _getChainName(chainInfo) : '';

  const filterOptions: OptionType[] = useMemo(() => {
    const uniqueOriginChains = Array.from(new Set(tokenSelectorItems.map(item => item.originChain)));

    const result = uniqueOriginChains.map(originChain => {
      return {
        label: _getChainName(chainInfoMap[originChain]),
        value: originChain,
      };
    });

    result.sort((a, b) => {
      const priority: Record<string, number> = {
        polkadot: 0,
        ethereum: 1,
      };

      const aPriority = priority[a.value] ?? 2;
      const bPriority = priority[b.value] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Sort by priority first
      }

      // If both have same priority (i.e., both are not polkadot/ethereum), sort by label
      return a.label.localeCompare(b.label);
    });

    return result;
  }, [chainInfoMap, tokenSelectorItems]);

  const filterFunction = useCallback((items: TokenSelectorItemType[], filters: string[]) => {
    return items.filter(item => {
      if (!filters.length) {
        return true;
      }

      for (const filter of filters) {
        if (item.originChain === filter) {
          return true;
        }
      }

      return false;
    });
  }, []);

  const convertedDestinationSwapValue = useMemo(() => {
    const convertValue = new BigN(swapValue).div(BN_TEN.pow(decimals));

    if (convertValue.toString().includes('e')) {
      return formatNumberString(convertValue.toString());
    } else {
      return convertValue.toString();
    }
  }, [decimals, swapValue]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colorBgSecondary,
        paddingBottom: theme.paddingXS,
        borderRadius: theme.borderRadiusLG,
        zIndex: 1,
        position: 'relative',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.padding,
          paddingVertical: theme.paddingXS,
        }}>
        <Typography.Text size={'sm'} style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
          {'To'}
        </Typography.Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}>
        <View style={{ flex: 1 }}>
          <TokenSelector
            items={tokenSelectorItems}
            selectedValueMap={{ [assetValue]: true }}
            onSelectItem={item => onSelectToken && onSelectToken(item.slug)}
            defaultValue={assetValue}
            showAddBtn={false}
            acceptDefaultValue={true}
            tokenSelectorRef={tokenSelectorRef}
            isShowFilterBtn={true}
            filterOptions={filterOptions}
            filterFunction={filterFunction}
            renderSelected={() => (
              <SwapTokenSelectField
                style={{ marginBottom: 0, marginLeft: 4 }}
                logoKey={assetValue}
                subLogoKey={chainValue}
                value={toAsset?.symbol}
                subValue={chainName}
                showIcon
              />
            )}
            selectedValue={assetValue}
          />
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: theme.paddingSM }}>
          {loading ? (
            <ActivityIndicator size={20} indicatorColor={theme.colorTextLight4} />
          ) : (
            <Typography.Text ellipsis numberOfLines={1} style={{ color: theme.colorTextLight4 }}>
              {swapCustomFormatter(convertedDestinationSwapValue)}
            </Typography.Text>
          )}
          {/*<Number value={getConvertedInputValue} decimal={0} />*/}
        </View>
      </View>
    </View>
  );
};
