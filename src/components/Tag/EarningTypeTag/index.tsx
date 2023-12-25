import { YieldPoolType } from '@subwallet/extension-base/types';
import { Icon, Tag, Typography } from 'components/design-system-ui';
import { SWIconProps } from 'components/design-system-ui/icon';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Database, HandsClapping, Leaf, Medal, MegaphoneSimple, User, Users } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { FontBold } from 'styles/sharedStyles';
import { PhosphorIcon } from 'utils/campaign';
import { convertHexColorToRGBA } from 'utils/color';

type Props = {
  type?: YieldPoolType;
  comingSoon?: boolean;
};

interface EarningTagType {
  label: string;
  icon: PhosphorIcon;
  bgColor: string;
  color: string;
  weight: SWIconProps['weight'];
}

const EarningTypeTag: React.FC<Props> = (props: Props) => {
  const { type, comingSoon } = props;

  const theme = useSubWalletTheme().swThemes;

  const earningTagTypes: Record<YieldPoolType, EarningTagType> = useMemo(() => {
    return {
      [YieldPoolType.LIQUID_STAKING]: {
        label: 'Liquid staking',
        icon: Leaf,
        bgColor: convertHexColorToRGBA(theme['magenta-6'], 0.1),
        color: theme['magenta-6'],
        weight: 'bold',
      },
      [YieldPoolType.LENDING]: {
        label: 'Lending',
        icon: HandsClapping,
        bgColor: convertHexColorToRGBA(theme['green-6'], 0.1),
        color: theme['green-6'],
        weight: 'bold',
      },
      [YieldPoolType.SINGLE_FARMING]: {
        label: 'Single farming',
        icon: User,
        bgColor: convertHexColorToRGBA(theme['green-6'], 0.1),
        color: theme['green-6'],
        weight: 'bold',
      },
      [YieldPoolType.NOMINATION_POOL]: {
        label: 'Nomination pool',
        icon: Users,
        bgColor: convertHexColorToRGBA(theme.colorSecondary, 0.1),
        color: theme.colorSecondary,
        weight: 'bold',
      },
      [YieldPoolType.PARACHAIN_STAKING]: {
        label: 'Parachain staking',
        icon: User,
        bgColor: convertHexColorToRGBA(theme['yellow-6'], 0.1),
        color: theme['yellow-6'],
        weight: 'bold',
      },
      [YieldPoolType.NATIVE_STAKING]: {
        label: 'Native staking',
        icon: Database,
        bgColor: convertHexColorToRGBA(theme['gold-6'], 0.1),
        color: theme['gold-6'],
        weight: 'fill',
      },
    };
  }, [theme]);

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
        style={{
          fontSize: theme.fontSizeXS,
          textAlign: 'center',
          lineHeight: theme.fontSizeXS * theme.lineHeightXS,
          paddingLeft: 4,
          color: earningTag.color,
          ...FontBold,
        }}>
        {earningTag.label}
      </Typography.Text>
    </Tag>
  );
};

export default EarningTypeTag;
