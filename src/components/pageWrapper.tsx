import React, { ComponentType, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { DataContext } from 'providers/DataContext';
import { StoreName } from 'stores/index';
import { ActivityIndicator } from './design-system-ui';

const Loading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator indicatorColor="white" size={30} />
  </View>
);

function withPageWrapper<P>(
  WrappedComponent: ComponentType<P>,
  stateNames: StoreName[],
) {
  return function PageWrapper(props: P) {
    const [isLoading, setLoading] = useState(true);
    const dataContext = useContext(DataContext);

    useEffect(() => {
      let mounted = true;

      dataContext.awaitStores(stateNames).finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
      };
    }, [dataContext]);

    if (isLoading) {
      return <Loading />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withPageWrapper;