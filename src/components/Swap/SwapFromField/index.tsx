import React, { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
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
        <TouchableOpacity>
          <Typography.Text size={'sm'} style={{ color: theme.colorSuccess }}>
            {'Max'}
          </Typography.Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
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
                value={fromAsset?.symbol}
                subValue={chainName}
                showIcon
              />
            )}
          />
        </View>

        <View style={{ flex: 2, alignItems: 'flex-end', paddingRight: theme.paddingSM }}>
          <InputAmount
            value={amountValue || ''}
            maxValue={'1'} // TODO
            onChangeValue={onChangeInput}
            decimals={decimals}
            showMaxButton={false}
            placeholder={'Amount'}
          />

          {/*<Number value={getConvertedInputValue} decimal={0} />*/}
        </View>
      </View>
    </View>
  );
};
