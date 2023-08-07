import React from 'react';
import { Header } from 'components/Header';
import TabIcon from './TabIcon';

const customTabIconStyle = { marginRight: -8 };
const BrowserTitle = () => {
  return <Header rightComponent={<TabIcon style={customTabIconStyle} />} />;
};

export default BrowserTitle;
