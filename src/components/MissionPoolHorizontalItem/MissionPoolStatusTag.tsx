import React from 'react';
import capitalize from '@subwallet/react-ui/es/_util/capitalize';
import { Icon, Tag } from 'components/design-system-ui';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useMissionPools } from 'hooks/useMissionPools';

interface Props {
  data: MissionInfo;
}

export const MissionPoolStatusTag = ({ data }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { getTagByTimeline } = useMissionPools();

  if (!data.tags || !data.tags.length) {
    return null;
  }

  const tagData = getTagByTimeline(data);
  let textColor = tagData.theme;
  let _theme = tagData.theme;

  if (tagData.theme && ['success', 'warning', 'error'].includes(tagData.theme)) {
    _theme = `color${capitalize(tagData.theme)}`;
  }

  const name = tagData.name;
  const iconWeight = tagData.iconWeight;
  const icon = tagData.icon;

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
