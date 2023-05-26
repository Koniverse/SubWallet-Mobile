import React, { useMemo } from 'react';
import { InfoItemBase } from 'components/MetaInfo/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { View } from 'react-native';
import Typography from '../../design-system-ui/typography';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { ActivityIndicator, Logo } from 'components/design-system-ui';

export interface ChainInfoItem extends InfoItemBase {
  chain: string;
}

const ChainItem: React.FC<ChainInfoItem> = ({ chain, label, valueColorSchema, loading }: ChainInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle, valueGeneralStyle } = useGeneralStyles(theme);
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const chainInfo = useMemo(() => chainInfoMap[chain], [chain, chainInfoMap]);
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
        {loading ? (
          <ActivityIndicator size={20} />
        ) : (
          <View style={[_style.valueWrapper, { gap: theme.sizeXS }]}>
            <Logo network={chain} size={24} />
            <Typography.Text ellipsis style={valueStyle}>
              {chainInfo?.name || chain}
            </Typography.Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ChainItem;
