import React from 'react';
import { InfoItemBase } from 'components/MetaInfo/types';
import BigN from 'bignumber.js';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { renderColContent } from 'components/MetaInfo/shared';
import { View } from 'react-native';
import { Number } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';

export interface TotalInfoItem extends Omit<InfoItemBase, 'valueColorSchema'> {
  value: string | number | BigN;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const TotalItem: React.FC<TotalInfoItem> = ({
  decimals = 0,
  label = i18n.common.total,
  prefix,
  suffix,
  value,
}: TotalInfoItem) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle } = useGeneralStyles(theme);

  return (
    <>
      <View
        style={{
          height: 2,
          alignSelf: 'stretch',
          backgroundColor: theme.colorBgDivider,
        }}
      />
      <View style={_style.row}>
        <View style={[_style.col]}>
          {renderColContent(label, {
            ..._style.label,
            ...labelGeneralStyle,
            fontSize: theme.fontSizeLG,
            lineHeight: theme.lineHeightLG * theme.fontSizeLG,
          })}
        </View>
        <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
          <Number
            value={value}
            decimal={decimals}
            suffix={suffix}
            prefix={prefix}
            intColor={theme.colorTextLight2}
            decimalColor={theme.colorTextLight4}
            unitColor={theme.colorTextLight2}
            size={theme.fontSizeLG}
            textStyle={{
              ..._style.value,
              fontSize: theme.fontSizeLG,
              lineHeight: theme.lineHeightLG * theme.fontSizeLG,
            }}
          />
        </View>
      </View>
    </>
  );
};

export default TotalItem;
