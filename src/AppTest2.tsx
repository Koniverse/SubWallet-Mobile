import React, { useRef } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { Text, TouchableOpacity, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

export const AppTest2 = () => {
  SplashScreen.hide();

  const modalizeRef = useRef<Modalize>(null);
  const modalizeRef2 = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const onOpen2 = () => {
    modalizeRef2.current?.open();
  };

  return (
    <View style={{ backgroundColor: ColorMap.dark1, flex: 1 }}>
      <TouchableOpacity onPress={onOpen}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Modalize ref={modalizeRef}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            backgroundColor: ColorMap.primary,
          }}>
          <Text style={{ ...FontMedium, ...sharedStyles.mediumText, color: ColorMap.light }}>Modal 1</Text>
          <TouchableOpacity onPress={onOpen2}>
            <Text>Open the modal</Text>
          </TouchableOpacity>
        </View>
      </Modalize>

      <Modalize ref={modalizeRef2}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: ColorMap.secondary,
          }}>
          <Text style={{ ...FontMedium, ...sharedStyles.mediumText, color: ColorMap.light }}>Modal 2</Text>
        </View>
      </Modalize>
    </View>
  );
};

export default AppTest2;
