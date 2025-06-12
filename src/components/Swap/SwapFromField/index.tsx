import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { TokenSelector, TokenItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { InputAmount } from 'components/Input/InputAmount';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getAssetDecimals, _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapTokenSelectField } from 'components/Field/SwapTokenSelect';

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
        <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4 }}>
          {'From'}
        </Typography.Text>
        {/*<TouchableOpacity>*/}
        {/*  <Typography.Text size={'sm'} style={{ color: theme.colorSuccess }}>*/}
        {/*    {'Max'}*/}
        {/*  </Typography.Text>*/}
        {/*</TouchableOpacity>*/}
      </View>

      <View
        style={{
          flexDirection: 'row',
          flex: 1,
        }}>
        <View style={{ minWidth: 160 }}>
          <TokenSelector
            items={tokenSelectorItems}
            selectedValueMap={{ [assetValue]: true }}
            onSelectItem={item => onSelectToken && onSelectToken(item.slug)}
            defaultValue={assetValue}
            showAddBtn={false}
            acceptDefaultValue={true}
            tokenSelectorRef={tokenSelectorRef}
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
          />
        </View>

        <View style={{ flex: 2, paddingRight: theme.paddingSM }}>
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
