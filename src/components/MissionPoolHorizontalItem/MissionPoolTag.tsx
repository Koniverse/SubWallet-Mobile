import React from 'react';
import capitalize from '@subwallet/react-ui/es/_util/capitalize';
import { MagicWand } from 'phosphor-react-native';
import { Icon, Tag } from 'components/design-system-ui';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useMissionPools } from 'hooks/useMissionPools';

interface Props {
  data: MissionInfo;
}

export const MissionPoolTag = ({ data }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { tagMap } = useMissionPools(data);
  if (!data.tags || !data.tags.length) {
    return null;
  }
  const tagSlug = data.tags[0];

  let textColor = tagMap[tagSlug]?.theme || 'gray';
  let _theme = tagMap[tagSlug]?.theme || 'gray';
  if (tagMap[tagSlug]?.theme && ['success', 'warning', 'error'].includes(tagMap[tagSlug]?.theme)) {
    _theme = `color${capitalize(tagMap[tagSlug]?.theme)}`;
  }
  const name = tagMap[tagSlug]?.name || capitalize(tagSlug.replace('_', ' '));
  const iconWeight = tagMap[tagSlug]?.iconWeight;
  const icon = tagMap[tagSlug]?.icon || MagicWand;

  return (
    <Tag
      shape={'round'}
      icon={<Icon size={'xs'} phosphorIcon={icon} weight={iconWeight} iconColor={theme[_theme]} />}
      bgType={'default'}
      color={textColor}>
      {name}
    </Tag>
  );
};
