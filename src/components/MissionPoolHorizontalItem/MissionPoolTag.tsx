import React from 'react';
import capitalize from '@subwallet/react-ui/es/_util/capitalize';
import { Icon, Tag } from 'components/design-system-ui';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useMissionPools } from 'hooks/useMissionPools';

interface Props {
  data: MissionInfo;
}

export const MissionPoolTag = ({ data }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { getTagData } = useMissionPools(data);
  if (!data.tags || !data.tags.length) {
    return null;
  }

  const tagData = getTagData(data, false);
  if (!tagData) {
    return <></>;
  }

  let _theme = tagData.theme;

  if (tagData.theme && ['success', 'warning', 'error'].includes(tagData.theme)) {
    _theme = `color${capitalize(tagData.theme)}`;
  }

  return (
    <Tag
      shape={'round'}
      icon={<Icon size={'xs'} phosphorIcon={tagData.icon} weight={tagData.iconWeight} iconColor={theme[_theme]} />}
      bgType={'default'}
      color={tagData.theme}>
      {tagData.name}
    </Tag>
  );
};
