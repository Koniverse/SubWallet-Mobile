import React, { useCallback } from 'react';
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
  onPressBack?: () => void;
}

const TransactionHeader = ({
  title,
  navigation,
  showRightIcon = false,
  onPressRightIcon,
  disableRightButton,
  disableLeftButton,
  disableMainHeader,
  onPressBack,
}: Props) => {
  const onBack = useCallback(() => {
    if (onPressBack) {
      onPressBack();
    } else {
      navigation.goBack();
    }
  }, [navigation, onPressBack]);

  return (
    <>
      <Header disabled={disableMainHeader} />

      <View style={{ marginTop: 16 }}>
        <SubHeader
          onPressBack={onBack}
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
