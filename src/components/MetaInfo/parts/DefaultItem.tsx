import React, { useMemo } from 'react';
import { InfoItemBase } from '../types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import { TextStyle, View } from 'react-native';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { ActivityIndicator } from 'components/design-system-ui';

export interface DefaultInfoItem extends InfoItemBase {
  children?: React.ReactNode | ((valueStyle: TextStyle) => React.ReactNode);
  labelAlign?: 'top' | 'center';
  valueAlign?: 'left' | 'right';
}

const DefaultItem: React.FC<DefaultInfoItem> = ({
  label,
  labelAlign,
  valueColorSchema,
  children,
  valueAlign = 'right',
  loading,
}: DefaultInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);

  const valueStyle = useMemo(() => {
    return {
      ..._style.value,
      ...valueGeneralStyle,
      ...(valueColorSchema && { color: getSchemaColor(valueColorSchema, theme) }),
      flexShrink: 1,
    };
  }, [_style.value, theme, valueColorSchema, valueGeneralStyle]);

  return (
    <View style={_style.row}>
      <View style={[_style.col, labelAlign === 'top' && _style['col.v-align-top']]}>
        {renderColContent(label, { ..._style.label, ...labelGeneralStyle })}
      </View>
      <View style={[_style.col, _style['col.grow'], valueAlign === 'right' && _style['col.to-right']]}>
        {loading ? <ActivityIndicator size={20} /> : renderColContent(children, valueStyle)}
      </View>
    </View>
  );
};

export default DefaultItem;
