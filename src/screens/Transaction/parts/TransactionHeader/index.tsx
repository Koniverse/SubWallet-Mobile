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
  disableLeftButton?: boolean;
  disableMainHeader?: boolean;
}

const TransactionHeader = ({
  title,
  navigation,
  showRightIcon = false,
  onPressRightIcon,
  disableRightButton,
  disableLeftButton,
  disableMainHeader,
}: Props) => {
  return (
    <>
      <Header disabled={disableMainHeader} />

      <View style={{ marginTop: 16 }}>
        <SubHeader
          onPressBack={() => navigation.goBack()}
          title={title}
          titleTextAlign={'left'}
          rightIcon={showRightIcon ? Info : undefined}
          onPressRightIcon={onPressRightIcon}
          disableRightButton={disableRightButton}
          disabled={disableLeftButton}
        />
      </View>
    </>
  );
};

export default TransactionHeader;
