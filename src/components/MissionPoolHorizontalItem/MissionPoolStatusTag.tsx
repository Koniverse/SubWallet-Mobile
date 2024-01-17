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

export const MissionPoolStatusTag = ({ data }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { tagStatusMap } = useMissionPools(data);
  if (!data.tags || !data.tags.length) {
    return null;
  }
  const tagSlug = data.status || '';

  let textColor = tagStatusMap[tagSlug]?.theme || 'gray';
  let _theme = tagStatusMap[tagSlug]?.theme || 'gray';
  if (tagStatusMap[tagSlug]?.theme && ['success', 'warning', 'error'].includes(tagStatusMap[tagSlug]?.theme)) {
    _theme = `color${capitalize(tagStatusMap[tagSlug]?.theme)}`;
  }
  const name = tagStatusMap[tagSlug]?.name || capitalize(tagSlug.replace('_', ' '));
  const iconWeight = tagStatusMap[tagSlug]?.iconWeight;
  const icon = tagStatusMap[tagSlug]?.icon || MagicWand;

  return (
    <Tag
      shape={'round'}
      icon={<Icon size={'xs'} phosphorIcon={icon} weight={iconWeight} iconColor={theme[_theme]} />}
      bgType={'default'}
      bgColor={textColor === 'gray' ? 'rgba(217, 217, 217, 0.1)' : undefined}
      color={textColor}>
      {name}
    </Tag>
  );
};
