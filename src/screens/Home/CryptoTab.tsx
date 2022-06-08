import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useQrScanner } from 'hooks/useQrScanner';
import { Button } from 'components/Button';
import {Dropdown} from "components/Dropdown";
import { SearchSelect } from "components/SearchSelect";
import {SearchBox} from "components/SearchBox";
import { Input } from "components/Input";

export const CryptoTab = () => {
  const priceStore = useSelector((state: RootState) => state.price);
  const qrScanner = useQrScanner();
  const [scanVal, setScanVal] = useState<string | undefined>(undefined);
  const [testVal, setTestVal] = useState<string>('');
  const DATA: {id: string, label: string}[] = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      label: 'First Item',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      label: 'Second Item',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      label: 'Third Item',
    },
  ];

  return (
    <View style={{ alignItems: 'center', height: '100%', justifyContent: 'center', paddingHorizontal: 16 }}>
      {Object.entries(priceStore.priceMap).map(([key, val]) => (
        <View key={key}>
          <Text>
            {key}: {val}
          </Text>
        </View>
      ))}
      <Button
        title="Open QR"
        color={'secondary'}
        onPress={() => {
          qrScanner.open({
            onClosed: val => {
              setScanVal(JSON.stringify(val.data));
            },
          });
        }}
      />
      <Text>Scaned Value: {scanVal}</Text>

      {/*<SideBar*/}
      {/*  animationIn={'slideInRight'}*/}
      {/*  animationOut={'slideOutRight'}*/}
      {/*  swipeDirection={'right'}*/}
      {/*  sideBarStyle={{ flex: 1, paddingLeft: width * 0.2, margin: 0 }}*/}
      {/*  visible={sideBarVisible}*/}
      {/*  onCloseSideBar={() => setSideBarVisible(false)}*/}
      {/*/>*/}

      {/*<SideBar*/}
      {/*  animationIn={'slideInLeft'}*/}
      {/*  animationOut={'slideOutLeft'}*/}
      {/*  swipeDirection={'left'}*/}
      {/*  sideBarStyle={{ width: width * 0.7, margin: 0 }}*/}
      {/*  visible={rightSideBarVisible}*/}
      {/*  onCloseSideBar={() => setRightSideBarVisible(false)}*/}
      {/*/>*/}
      {/*<SearchSelect data={DATA} value={testVal} onChangeSelect={(testVal: string) => setTestVal(testVal)} />*/}
      <Input />
    </View>
  );
};
