import React from 'react';
import { Header } from 'components/Header';
import TabIcon from './TabIcon';
const BrowserTitle = () => {
  return <Header rightComponent={<TabIcon />} />;
};

export default BrowserTitle;
