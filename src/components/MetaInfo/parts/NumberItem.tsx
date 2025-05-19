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
import { SwNumberProps } from 'components/design-system-ui/number';

export interface NumberInfoItem extends Omit<InfoItemBase, 'valueColorSchema'> {
  value: string | number | BigN;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  valueColorSchema?: SchemeColor | 'even-odd';
  size?: TextSizeProps;
  spaceBetween?: boolean;
  suffixNode?: React.ReactNode;
  metadata?: Record<string, number>;
  customFormatter?: SwNumberProps['customFormatter'];
  formatType?: SwNumberProps['formatType'];
  unitColor?: SwNumberProps['unitColor'];
  intColor?: SwNumberProps['intColor'];
  decimalColor?: SwNumberProps['decimalColor'];
}

const NumberItem: React.FC<NumberInfoItem> = ({
  decimals = 0,
  label,
  prefix,
  suffix,
  suffixNode,
  value,
  valueColorSchema,
  loading,
  size,
  spaceBetween = true,
  metadata,
  customFormatter,
  formatType,
  unitColor,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Number
              value={value}
              decimal={decimals}
              suffix={suffix}
              prefix={prefix}
              intColor={valueColorSchema === 'even-odd' ? theme.colorTextLight2 : undefined}
              decimalColor={valueColorSchema === 'even-odd' ? theme.colorTextLight4 : undefined}
              unitColor={valueColorSchema === 'even-odd' ? theme.colorTextLight2 : unitColor ? unitColor : undefined}
              textStyle={valueStyle}
              size={valueSize}
              metadata={metadata}
              formatType={formatType}
              customFormatter={customFormatter}
            />
            {suffixNode}
          </View>
        )}
      </View>
    </View>
  );
};

export default NumberItem;
