import { EmptyList } from 'components/EmptyList';
import { GlobeSimpleIcon } from 'phosphor-react-native';
import React from 'react';
import i18n from 'utils/i18n/i18n';

export const CategoryEmptyList = () => {
  return (
    <EmptyList
      icon={GlobeSimpleIcon}
      title={i18n.emptyScreen.manageDAppEmptyTitle}
      message={i18n.emptyScreen.categoryItemEmpty}
    />
  );
};
