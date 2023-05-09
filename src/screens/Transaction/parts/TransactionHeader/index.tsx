import React from 'react';
import { Header } from 'components/Header';
import { View } from 'react-native';
import { SubHeader } from 'components/SubHeader';
import { Info } from 'phosphor-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  title: string;
  navigation: NativeStackNavigationProp<any>;
  showRightIcon?: boolean;
  onPressRightIcon?: () => void;
  disableRightButton?: boolean;
}

const TransactionHeader = ({ title, navigation, showRightIcon = false, onPressRightIcon, disableRightButton }: Props) => {
  return (
    <>
      <Header />

      <View style={{ marginTop: 16 }}>
        <SubHeader
          onPressBack={() => navigation.goBack()}
          title={title}
          rightIcon={showRightIcon ? Info : undefined}
          onPressRightIcon={onPressRightIcon}
          disableRightButton={disableRightButton}
        />
      </View>
    </>
  );
};

export default TransactionHeader;
