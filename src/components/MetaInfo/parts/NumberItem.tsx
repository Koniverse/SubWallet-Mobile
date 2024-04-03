import React, { useMemo } from 'react';

import { InfoItemBase, SchemeColor } from '../types';
import BigN from 'bignumber.js';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { View } from 'react-native';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { ActivityIndicator, Number } from 'components/design-system-ui';
import { TextSizeProps } from 'components/design-system-ui/typography';

export interface NumberInfoItem extends Omit<InfoItemBase, 'valueColorSchema'> {
  value: string | number | BigN;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  valueColorSchema?: SchemeColor | 'even-odd';
  size?: TextSizeProps;
  spaceBetween?: boolean;
}

const NumberItem: React.FC<NumberInfoItem> = ({
  decimals = 0,
  label,
  prefix,
  suffix,
  value,
  valueColorSchema,
  loading,
  size,
  spaceBetween = true,
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

  const valueSize = useMemo(() => {
    if (size === 'sm') {
      return 12;
    }

    if (size === 'xs') {
      return 10;
    }

    if (size === 'md') {
      return 16;
    }

    if (size === 'lg') {
      return 20;
    }

    if (size === 'xl') {
      return 24;
    }

    return 14;
  }, [size]);

  return (
    <View style={_style.row}>
      <View style={[_style.col]}>{renderColContent(label, { ..._style.label, ...labelGeneralStyle }, size)}</View>
      <View style={[_style.col, spaceBetween && _style['col.grow'], _style['col.to-right']]}>
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
            size={valueSize}
          />
        )}
      </View>
    </View>
  );
};

export default NumberItem;
