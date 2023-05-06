import React, { useMemo } from 'react';
import { InfoItemBase } from 'components/MetaInfo/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { renderColContent } from 'components/MetaInfo/shared';
import { View } from 'react-native';
import Typography from '../../design-system-ui/typography';

export interface DisplayTypeInfoItem extends Omit<InfoItemBase, 'valueColorSchema'> {
  typeName: string;
}

const DisplayTypeItem: React.FC<DisplayTypeInfoItem> = ({ label, typeName }: DisplayTypeInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);

  const valueStyle = useMemo(() => {
    return {
      ..._style.value,
      ...valueGeneralStyle,
      color: theme.colorSuccess,
      flexShrink: 1,
    };
  }, [_style.value, theme, valueGeneralStyle]);

  return (
    <View style={_style.row}>
      <View style={[_style.col]}>{renderColContent(label, { ..._style.label, ...labelGeneralStyle })}</View>
      <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
        <Typography.Text ellipsis style={valueStyle}>
          {typeName}
        </Typography.Text>
      </View>
    </View>
  );
};

export default DisplayTypeItem;
