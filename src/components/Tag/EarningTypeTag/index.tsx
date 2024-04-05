import { YieldPoolType } from '@subwallet/extension-base/types';
import { Icon, Tag, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Medal, MegaphoneSimple } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { FontBold } from 'styles/sharedStyles';
import { EarningTagType } from 'types/earning';
import { createEarningTypeTags } from 'utils/earning';

type Props = {
  type?: YieldPoolType;
  comingSoon?: boolean;
  chain: string;
  textMaxWidth?: number;
};

const EarningTypeTag: React.FC<Props> = (props: Props) => {
  const { type, comingSoon, chain, textMaxWidth } = props;

  const theme = useSubWalletTheme().swThemes;

  const earningTagTypes: Record<YieldPoolType, EarningTagType> = useMemo(() => {
    return createEarningTypeTags(theme, chain);
  }, [chain, theme]);

  const earningTag = useMemo(
    (): EarningTagType =>
      type
        ? earningTagTypes[type]
        : comingSoon
        ? {
            bgColor: 'default',
            color: 'default',
            label: 'Coming soon',
            icon: MegaphoneSimple,
            weight: 'fill',
          }
        : {
            bgColor: 'lime',
            color: 'lime',
            label: 'Exclusive rewards',
            icon: Medal,
            weight: 'fill',
          },
    [comingSoon, earningTagTypes, type],
  );

  return (
    <Tag
      color={earningTag.color}
      closable={false}
      bgType={'default'}
      icon={
        <Icon phosphorIcon={earningTag.icon} size={'xxs'} weight={earningTag.weight} iconColor={earningTag.color} />
      }
      bgColor={earningTag.bgColor}>
      <Typography.Text
        ellipsis
        style={{
          fontSize: theme.fontSizeXS,
          textAlign: 'center',
          lineHeight: theme.fontSizeXS * theme.lineHeightXS,
          paddingLeft: 4,
          color: earningTag.color,
          maxWidth: textMaxWidth || 'auto',
          ...FontBold,
        }}>
        {earningTag.label}
      </Typography.Text>
    </Tag>
  );
};

export default EarningTypeTag;
