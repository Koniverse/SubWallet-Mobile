import React from 'react';
import { View } from 'react-native';
import { Search } from 'components/Search';
import { sharedStyles } from 'styles/sharedStyles';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';

interface Props {
  children: JSX.Element;
  title: string;
  searchString: string;
  onPressBack: () => void;
  onChangeSearchText: (text: string) => void;
}

export const SelectScreen = ({ children, title, searchString, onChangeSearchText, onPressBack }: Props) => {
  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={title} style={{ width: '100%', paddingTop: 0 }}>
      <View style={{ ...sharedStyles.layoutContainer }}>
        <Search
          onClearSearchString={() => onChangeSearchText('')}
          onSearch={onChangeSearchText}
          searchText={searchString}
          style={{ marginBottom: 8 }}
        />
        {children}
      </View>
    </ContainerWithSubHeader>
  );
};
