import React, { useMemo } from 'react';

import { InfoItemBase, SchemeColor } from '../types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { View } from 'react-native';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { ActivityIndicator, Typography } from 'components/design-system-ui';
import { TextSizeProps } from 'components/design-system-ui/typography';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

export interface TextInfoItem extends Omit<InfoItemBase, 'valueColorSchema'> {
  value: string;
  valueColorSchema?: SchemeColor;
  valueFontWeight?: 'regular' | 'semibold';
  valueSize?: TextSizeProps;
  ellipsis?: boolean;
}

const TextItem: React.FC<TextInfoItem> = ({
  label,
  value,
  valueColorSchema,
  valueFontWeight,
  loading,
  valueSize,
  ellipsis,
}: TextInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);

  const valueStyle = useMemo(() => {
    return {
      ..._style.value,
      ...valueGeneralStyle,
      ...(valueColorSchema && { color: getSchemaColor(valueColorSchema, theme) }),
      ...(valueFontWeight === 'semibold' ? FontSemiBold : FontMedium),
    };
  }, [_style.value, theme, valueColorSchema, valueFontWeight, valueGeneralStyle]);

  return (
    <View style={_style.row}>
      <View style={[_style.col]}>{renderColContent(label, { ..._style.label, ...labelGeneralStyle })}</View>
      <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
        {loading ? (
          <ActivityIndicator size={20} />
        ) : (
          <Typography.Text style={valueStyle} size={valueSize} ellipsis={ellipsis}>
            {value}
          </Typography.Text>
        )}
      </View>
    </View>
  );
};

export default TextItem;
