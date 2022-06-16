import React from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export const SelectNetwork = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const { networkMap } = useSelector((state: RootState) => state);
  return (
    <SubScreenContainer navigation={navigation} title={'Select Network'}>
      <View>
        <Text>123</Text>
      </View>
    </SubScreenContainer>
  );
};
