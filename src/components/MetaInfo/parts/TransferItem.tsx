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
import { Logo } from 'components/design-system-ui';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';

export interface TransferInfoItem extends Omit<InfoItemBase, 'label'> {
  senderAddress: string;
  senderName?: string;
  senderLabel?: string;
  recipientAddress: string;
  recipientName?: string;
  recipientLabel?: string;
  originChain?: ChainInfo;
  destinationChain?: ChainInfo;
  // Same-chain transfers already show the chain as a "Network" row; only render it inside
  // the sender/recipient columns when the caller insists (mirrors the extension).
  alwaysShowChain?: boolean;
}

const TransferItem: React.FC<TransferInfoItem> = ({
  alwaysShowChain,
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
  const subValueStyle = useMemo(() => {
    return {
      ..._style.subValue,
      ...valueGeneralStyle,
      ...(valueColorSchema && { color: getSchemaColor(valueColorSchema, theme) }),
      flexShrink: 1,
      textAlign: 'left',
    };
  }, [_style.subValue, theme, valueColorSchema, valueGeneralStyle]);

  // Extension's `__sender` / `__recipient` modifier (TransferItem.tsx): when exactly one side
  // has a name, that block is two lines tall while the other is one, so anything rendered
  // below the two columns drifts out of line. Pad the account blocks to the two-line height.
  const accountBlockMinHeight = useMemo(() => {
    const onlyOneSideNamed =
      (!!senderName && recipientName === undefined) || (!!recipientName && senderName === undefined);

    if (!onlyOneSideNamed) {
      return undefined;
    }

    return theme.lineHeight * theme.fontSize + theme.lineHeightSM * theme.fontSizeSM;
  }, [recipientName, senderName, theme.fontSize, theme.fontSizeSM, theme.lineHeight, theme.lineHeightSM]);

  const isSameChain = !!originChain && !!destinationChain && originChain.slug === destinationChain.slug;
  const showOriginChain = !!originChain && (!isSameChain || alwaysShowChain);
  const showDestinationChain = !!destinationChain && (!isSameChain || alwaysShowChain);

  const genAccountBlock = (address: string, name?: string) => {
    return (
      <View
        style={[
          _style.valueWrapper,
          { gap: theme.sizeXS, alignItems: 'flex-start', minHeight: accountBlockMinHeight },
        ]}>
        <AccountProxyAvatar value={address} size={24} />
        <View style={{ flexShrink: 1 }}>
          {!!name && (
            <Typography.Text ellipsis style={valueStyle}>
              {name}
            </Typography.Text>
          )}
          <Typography.Text ellipsis style={!!name ? subValueStyle : valueStyle}>
            {toShort(address)}
          </Typography.Text>
        </View>
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

        {isSameChain ? (
          <ChainItem chain={originChain.slug} label={i18n.common.network} />
        ) : (
          <>
            {!!originChain && <ChainItem chain={originChain.slug} label={i18n.common.originChain} />}

            {!!destinationChain && <ChainItem chain={destinationChain.slug} label={i18n.common.destinationChain} />}
          </>
        )}
      </>
    );
  }

  return (
    <View style={[_style.row, { alignItems: 'flex-start' }]}>
      <View style={[_style.col, _style['col.grow'], { gap: theme.sizeXS }]}>
        {renderColContent(senderLabel || i18n.common.sender, { ..._style.label, ...labelGeneralStyle })}
        {genAccountBlock(senderAddress, senderName)}
        {showOriginChain && genChainBlock(originChain)}
      </View>
      <View style={[_style.col, _style['col.grow'], { gap: theme.sizeXS }]}>
        {renderColContent(recipientLabel || i18n.common.recipient, { ..._style.label, ...labelGeneralStyle })}
        {genAccountBlock(recipientAddress, recipientName)}
        {showDestinationChain && genChainBlock(destinationChain)}
      </View>
    </View>
  );
};

export default TransferItem;
