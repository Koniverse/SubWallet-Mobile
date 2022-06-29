import React, { useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { Search } from 'components/Search';
import { sharedStyles } from 'styles/sharedStyles';

interface Props {
  children: JSX.Element;
  title: string;
}

export const SelectScreen = ({ children, title }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState('');

  return (
    <SubScreenContainer navigation={navigation} title={title}>
      <View style={{ ...sharedStyles.layoutContainer }}>
        <Search onSearch={setSearchString} searchText={searchString} />
        {children}
      </View>
    </SubScreenContainer>
  );
};
