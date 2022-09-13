import React from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { AuthUrlInfo, AuthUrls } from '@subwallet/extension-base/background/handlers/State';
import { EmptyListScreen } from 'screens/Settings/Security/DAppAccess/EmptyListScreen';

function filterFunction(items: AuthUrlInfo[], searchString: string) {
  return items.filter(item => item.url.toLowerCase().includes(searchString.toLowerCase()));
}

export const DAppAccessScreen = () => {
  const authList: AuthUrls = {};

  return (
    <FlatListScreen
      title={'Manage DApp Access'}
      autoFocus={false}
      items={Object.values(authList)}
      filterFunction={filterFunction}
      renderListEmptyComponent={EmptyListScreen}
    />
  );
};
