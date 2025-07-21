import { _ChainAsset } from '@subwallet/chain-list/types';
import React from 'react';
import { View } from 'react-native';
import { NumberDisplay, Typography } from 'components/design-system-ui';
import { _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { swapNumberMetadata } from '@subwallet/extension-base/utils';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  rateValue: number;
  fromAssetInfo?: _ChainAsset;
  toAssetInfo?: _ChainAsset;
  size?: number;
}

const QuoteRateDisplay: React.FC<Props> = (props: Props) => {
  const { fromAssetInfo, rateValue, toAssetInfo, size = 12 } = props;
  const theme = useSubWalletTheme().swThemes;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <NumberDisplay
        textStyle={{ ...FontSemiBold }}
        size={size}
        decimal={0}
        suffix={_getAssetSymbol(fromAssetInfo)}
        value={1}
      />
      <Typography.Text size={'sm'} style={{ color: theme.colorTextLight1, ...FontSemiBold }}>
        &nbsp;~&nbsp;
      </Typography.Text>
      <NumberDisplay
        textStyle={{ ...FontSemiBold }}
        decimal={0}
        size={size}
        metadata={swapNumberMetadata}
        suffix={_getAssetSymbol(toAssetInfo)}
        value={rateValue}
      />
    </View>
  );
};

export default QuoteRateDisplay;
