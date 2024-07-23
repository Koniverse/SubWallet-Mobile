import React from 'react';
import { Tag } from 'components/design-system-ui';
import { MissionInfo } from 'types/missionPool';
import { useMissionPools } from 'hooks/useMissionPools';

interface Props {
  data: MissionInfo;
}

export const MissionPoolCategory = ({ data }: Props) => {
  const { getMissionPoolCategory } = useMissionPools(data);
  if (!data.categories || !data.categories.length) {
    return null;
  }

  const categoryData = getMissionPoolCategory(data);
  if (!categoryData) {
    return <></>;
  }

  return (
    <Tag key={categoryData[0].slug} shape={'round'} bgType={'default'} color={categoryData[0].color}>
      {categoryData[0].name}
    </Tag>
  );
};
