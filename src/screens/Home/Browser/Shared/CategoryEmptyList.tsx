import { EmptyList } from 'components/EmptyList';
import { GlobeSimple } from 'phosphor-react-native';
import React from 'react';

export const CategoryEmptyList = () => {
  return <EmptyList icon={GlobeSimple} title={'No dApps found'} message={'This category is empty'} />;
};
