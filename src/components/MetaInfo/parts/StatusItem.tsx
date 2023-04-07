import React, { useMemo } from 'react';
import { InfoItemBase } from 'components/MetaInfo/types';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { View } from 'react-native';
import { Icon } from 'components/design-system-ui';
import Typography from '../../design-system-ui/typography';
import { IconProps } from 'phosphor-react-native';

export interface StatusInfoItem extends InfoItemBase {
  statusIcon: React.ElementType<IconProps>;
  statusName: string;
}

const StatusItem: React.FC<StatusInfoItem> = ({ statusIcon, statusName, label, valueColorSchema }: StatusInfoItem) => {
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
      <View style={[_style.col]}>{renderColContent(label, { ..._style.label, ...labelGeneralStyle })}</View>
      <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
        <View style={[_style.valueWrapper, { gap: theme.sizeXXS }]}>
          <Icon phosphorIcon={statusIcon} size={'sm'} weight={'fill'} iconColor={valueStyle.color} />
          <Typography.Text ellipsis style={valueStyle}>
            {statusName}
          </Typography.Text>
        </View>
      </View>
    </View>
  );
};

export default StatusItem;
