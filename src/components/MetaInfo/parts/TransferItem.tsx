import React, { useMemo } from 'react';
import { InfoItemBase } from 'components/MetaInfo/types';
import { ChainInfo } from 'types/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { getSchemaColor, renderColContent } from 'components/MetaInfo/shared';
import { AccountItem, ChainItem } from 'components/MetaInfo/parts/index';
import i18n from 'utils/i18n/i18n';
import { View } from 'react-native';
import Typography from '../../design-system-ui/typography';
import { toShort } from 'utils/index';
import { Avatar, Logo } from 'components/design-system-ui';

export interface TransferInfoItem extends Omit<InfoItemBase, 'label'> {
  senderAddress: string;
  senderName?: string;
  senderLabel?: string;
  recipientAddress: string;
  recipientName?: string;
  recipientLabel?: string;
  originChain?: ChainInfo;
  destinationChain?: ChainInfo;
}

const TransferItem: React.FC<TransferInfoItem> = ({
  destinationChain,
  originChain,
  recipientAddress,
  recipientLabel,
  recipientName,
  senderAddress,
  senderLabel,
  senderName,
  valueColorSchema,
}: TransferInfoItem) => {
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

  const genAccountBlock = (address: string, name?: string) => {
    return (
      <View style={[_style.valueWrapper, { gap: theme.sizeXS }]}>
        <Avatar value={address} size={24} />
        <Typography.Text ellipsis style={valueStyle}>
          {name || toShort(address)}
        </Typography.Text>
      </View>
    );
  };

  const genChainBlock = (chainInfo: ChainInfo) => {
    return (
      <View style={[_style.valueWrapper, { gap: theme.sizeXS }]}>
        <Logo network={chainInfo.slug} size={24} />
        <Typography.Text style={valueStyle}>{chainInfo.name}</Typography.Text>
      </View>
    );
  };

  if (!recipientAddress) {
    return (
      <>
        <AccountItem address={senderAddress} label={senderLabel || i18n.common.sender} name={senderName} />

        {!!originChain && <ChainItem chain={originChain.slug} label={i18n.common.originChain} />}

        {!!destinationChain && <ChainItem chain={destinationChain.slug} label={i18n.common.destinationChain} />}
      </>
    );
  }

  return (
    <View style={_style.row}>
      <View style={[_style.col, _style['col.grow'], { gap: theme.sizeXS }]}>
        {renderColContent(senderLabel || i18n.common.sender, { ..._style.label, ...labelGeneralStyle })}
        {genAccountBlock(senderAddress, senderName)}
        {!!originChain && genChainBlock(originChain)}
      </View>
      <View style={[_style.col, _style['col.grow'], { gap: theme.sizeXS }]}>
        {renderColContent(recipientLabel || i18n.common.recipient, { ..._style.label, ...labelGeneralStyle })}
        {genAccountBlock(recipientAddress, recipientName)}
        {!!destinationChain && genChainBlock(destinationChain)}
      </View>
    </View>
  );
};

export default TransferItem;
