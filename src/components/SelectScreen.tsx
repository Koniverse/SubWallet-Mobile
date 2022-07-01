import React from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { Search } from 'components/Search';
import { sharedStyles } from 'styles/sharedStyles';

interface Props {
  children: JSX.Element;
  title: string;
  searchString: string;
  onChangeSearchText: (text: string) => void;
}

export const SelectScreen = ({ children, title, searchString, onChangeSearchText }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();

  return (
    <SubScreenContainer navigation={navigation} title={title}>
      <View style={{ ...sharedStyles.layoutContainer }}>
        <Search
          onClearSearchString={() => onChangeSearchText('')}
          onSearch={onChangeSearchText}
          searchText={searchString}
          style={{ marginBottom: 8 }}
        />
        {children}
      </View>
    </SubScreenContainer>
  );
};
