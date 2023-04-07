import React from 'react';
import { InfoItemGeneralProps } from 'components/MetaInfo/types';

export const MetaInfoContext = React.createContext<InfoItemGeneralProps>({
  labelColorScheme: 'light',
  labelFontWeight: 'semibold',
  valueColorScheme: 'gray',
});
