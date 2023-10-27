import React from 'react';
import { MissionPoolsContainerProps } from 'screens/Home/Browser/MissionPool/types';

export const MissionPoolsContext = React.createContext<MissionPoolsContainerProps>({
  searchString: '',
});
