import React, { useRef } from 'react';
import { View } from 'react-native';
import { TokenSelector, TokenItemType } from 'components/Modal/common/TokenSelector';
import { ModalRef } from 'types/modalRef';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _getChainName } from '@subwallet/extension-base/services/chain-service/utils';
import BigN from 'bignumber.js';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapTokenSelectField } from 'components/Field/SwapTokenSelect';

interface Props {
  tokenSelectorItems: TokenItemType[];
  assetValue: string;
  chainValue: string;
  chainInfo: _ChainInfo;
  swapValue: BigN;
  onSelectToken?: (item: string) => void;
  toAsset?: _ChainAsset;
}

export const SwapToField = ({
  tokenSelectorItems,
  assetValue,
  chainValue,
  chainInfo,
  onSelectToken,
  swapValue,
  toAsset,
}: Props) => {
  const tokenSelectorRef = useRef<ModalRef>();
  // const decimals = _getAssetDecimals(toAsset);
  // const priceId = _getAssetPriceId(toAsset);
  // const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const theme = useSubWalletTheme().swThemes;
  const chainName = chainInfo ? _getChainName(chainInfo) : '';

  // const getConvertedInputValue = useMemo(() => {
  //   if (swapValue) {
  //     const price = priceMap[priceId] || 0;
  //
  //     return swapValue.div(BN_TEN.pow(decimals || 0)).multipliedBy(price);
  //   }
  //
  //   return BN_ZERO;
  // }, [decimals, priceId, priceMap, swapValue]);

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
        <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4 }}>
          {'To'}
        </Typography.Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}>
        <View>
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
                value={toAsset?.symbol}
                subValue={chainName}
                showIcon
              />
            )}
          />
        </View>

        <View style={{ flex: 2, alignItems: 'flex-end', paddingRight: theme.padding }}>
          <Typography.Text style={{ color: theme.colorTextLight4 }}>{swapValue.toString()}</Typography.Text>

          {/*<Number value={getConvertedInputValue} decimal={0} />*/}
        </View>
      </View>
    </View>
  );
};
