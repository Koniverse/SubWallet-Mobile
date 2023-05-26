import React, { useMemo } from 'react';

import { InfoItemBase, SchemeColor } from '../types';
import BigN from 'bignumber.js';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { View } from 'react-native';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { ActivityIndicator, Number } from 'components/design-system-ui';

export interface NumberInfoItem extends Omit<InfoItemBase, 'valueColorSchema'> {
  value: string | number | BigN;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  valueColorSchema?: SchemeColor | 'even-odd';
}

const NumberItem: React.FC<NumberInfoItem> = ({
  decimals = 0,
  label,
  prefix,
  suffix,
  value,
  valueColorSchema,
  loading,
}: NumberInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);

  const valueStyle = useMemo(() => {
    return {
      ..._style.value,
      ...(valueColorSchema !== 'even-odd' && valueGeneralStyle),
      ...(valueColorSchema && valueColorSchema !== 'even-odd' && { color: getSchemaColor(valueColorSchema, theme) }),
    };
  }, [_style.value, theme, valueColorSchema, valueGeneralStyle]);

  return (
    <View style={_style.row}>
      <View style={[_style.col]}>{renderColContent(label, { ..._style.label, ...labelGeneralStyle })}</View>
      <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
        {loading ? (
          <ActivityIndicator size={20} />
        ) : (
          <Number
            value={value}
            decimal={decimals}
            suffix={suffix}
            prefix={prefix}
            intColor={valueColorSchema === 'even-odd' ? theme.colorTextLight2 : undefined}
            decimalColor={valueColorSchema === 'even-odd' ? theme.colorTextLight4 : undefined}
            unitColor={valueColorSchema === 'even-odd' ? theme.colorTextLight2 : undefined}
            textStyle={valueStyle}
            size={valueStyle.fontSize}
          />
        )}
      </View>
    </View>
  );
};

export default NumberItem;
