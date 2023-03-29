import React, { ComponentType, useContext, useEffect, useState } from 'react';
import { DataContext } from 'providers/DataContext';
import { StoreName } from 'stores/index';
import { ActivityIndicator } from './design-system-ui';
import { View } from 'react-native';

const Loading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator indicatorColor="white" size={30} />
  </View>
);

const PageWrapper = (Component: ComponentType, stateNames: StoreName[]) => {
  const [isLoading, setLoading] = useState(true);
  const dataContext = useContext(DataContext);

  useEffect(() => {
    dataContext.awaitStores(stateNames).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (props: JSX.IntrinsicAttributes) => (isLoading ? <Loading /> : <Component {...props} />);
};

export default PageWrapper;
