import React, { useMemo } from 'react';

import { InfoItemBase } from '../types';
import AvatarGroup from 'components/common/AvatarGroup';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { View } from 'react-native';
import Typography from '../../design-system-ui/typography';

export interface AccountGroupInfoItem extends InfoItemBase {
  addresses: string[];
  content: string;
}

const AccountGroupItem: React.FC<AccountGroupInfoItem> = ({
  addresses,
  content,
  label,
  valueColorSchema,
}: AccountGroupInfoItem) => {
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
        <View style={[_style.valueWrapper, { gap: theme.sizeXS, paddingLeft: theme.paddingXS }]}>
          <AvatarGroup addresses={addresses} />
          <Typography.Text ellipsis style={valueStyle}>
            {content}
          </Typography.Text>
        </View>
      </View>
    </View>
  );
};

export default AccountGroupItem;
