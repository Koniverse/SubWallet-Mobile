import React, { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { TokenSelector, TokenItemType, TokenSelectorItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { InputAmount } from 'components/Input/InputAmount';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getAssetDecimals, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapTokenSelectField } from 'components/Field/SwapTokenSelect';
import { FontSemiBold } from 'styles/sharedStyles';
import { OptionType } from 'components/common/FilterModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

interface Props {
  tokenSelectorItems: TokenItemType[];
  assetValue: string;
  chainValue: string;
  chainInfo: _ChainInfo;
  amountValue?: string;
  onSelectToken?: (tokenSlug: string) => void;
  fromAsset?: _ChainAsset;
  onChangeInput: (value: string, isInValid?: boolean) => void;
}

type DebounceFunc<T extends any[]> = (func: (...args: T) => void, delay: number) => (...args: T) => void;

const debounce: DebounceFunc<[string, boolean | undefined]> = (func, delay) => {
  let timer: NodeJS.Timeout;

  return function (value, isInValid) {
    clearTimeout(timer);
    timer = setTimeout(() => func(value, isInValid), delay);
  };
};

export const SwapFromField = ({
  tokenSelectorItems,
  assetValue,
  chainValue,
  chainInfo,
  onSelectToken,
  amountValue,
  onChangeInput,
  fromAsset,
}: Props) => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const tokenSelectorRef = useRef<ModalRef>();
  const decimals = _getAssetDecimals(fromAsset);
  const theme = useSubWalletTheme().swThemes;
  const chainName = chainInfo ? _getChainName(chainInfo) : '';

  const onChangeAmount = useCallback(
    (value: string, isInValid?: boolean) => {
      const debouncedOnChangeAmount = debounce(onChangeInput, 500);

      debouncedOnChangeAmount(value, isInValid);
    },
    [onChangeInput],
  );

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colorBgSecondary,
        paddingBottom: theme.paddingXS,
        borderRadius: theme.borderRadiusLG,
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
          {'From'}
        </Typography.Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
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
                value={fromAsset?.symbol}
                subValue={chainName}
                showIcon
              />
            )}
            selectedValue={assetValue}
          />
        </View>

        <View style={{ flex: 1, paddingRight: theme.paddingXS }}>
          <InputAmount
            value={amountValue || ''}
            maxValue={'1'} // TODO
            onChangeValue={onChangeAmount}
            decimals={decimals}
            showMaxButton={false}
            placeholder={'Amount'}
            textAlign={'right'}
            externalStyle={{ color: theme.colorWhite }}
          />

          {/*<Number value={getConvertedInputValue} decimal={0} />*/}
        </View>
      </View>
    </View>
  );
};
