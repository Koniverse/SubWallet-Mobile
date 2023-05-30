import React, { useMemo } from 'react';
import { InfoItemBase } from '../types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { TextStyle, View } from 'react-native';
import { FontMonoRegular } from 'styles/sharedStyles';
import { ActivityIndicator } from 'components/design-system-ui';

export interface DataInfoItem extends InfoItemBase {
  children: React.ReactNode | ((valueStyle: TextStyle) => React.ReactNode);
}

const DataItem: React.FC<DataInfoItem> = ({ children, valueColorSchema, label, loading }: DataInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);

  const valueStyle = useMemo(() => {
    return {
      ..._style.value,
      ...FontMonoRegular,
      ...valueGeneralStyle,
      ...(valueColorSchema && { color: getSchemaColor(valueColorSchema, theme) }),
    };
  }, [_style.value, theme, valueColorSchema, valueGeneralStyle]);

  return (
    <View style={[_style.row, _style['row.d-column']]}>
      <View style={[_style.col]}>{renderColContent(label, { ..._style.label, ...labelGeneralStyle })}</View>
      <View style={[_style.col]}>
        {loading ? <ActivityIndicator size={20} /> : renderColContent(children, valueStyle)}
      </View>
    </View>
  );
};

export default DataItem;
