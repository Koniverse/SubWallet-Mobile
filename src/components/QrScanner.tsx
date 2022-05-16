// Copyright 2015-2020 Parity Technologies (UK) Ltd.
// Modifications Copyright (c) 2021-2022 Thibaut Sardan

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
// import colors from 'styles/colors';
// import fonts from 'styles/fonts';
import {TxRequestData} from '../types/scannerTypes';
import {rawDataToU8A} from '../utils/utils';
import {constructDataFromBytes} from '../utils/decoders';

export default function Scanner(): React.ReactElement {
  // const scannerStore = useContext(ScannerContext);
  // const {setAlert} = useContext(AlertContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [enableScan, setEnableScan] = useState<boolean>(true);
  const [lastFrame, setLastFrame] = useState<null | string>(null);
  // const [multiFrames, setMultiFrames] = useState<Frames>({
  //   completedFramesCount: 0,
  //   isMultipart: false,
  //   missedFrames: [],
  //   missingFramesMessage: '',
  //   totalFramesCount: 0,
  // });

  // const {navigateToNetworkSettings} = useHelperNavigation();

  const processBarCode = async (event: TxRequestData) => {
    const raw = rawDataToU8A(event.rawData) as Uint8Array;
    const rs = await constructDataFromBytes(raw, true, {
      '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3': 0,
      '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe': 2,
      '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e': 42,
    });
    console.log(rs);
  };

  const onBarCodeRead = async (event: any): Promise<void> => {
    if (event.type !== RNCamera.Constants.BarCodeType.qr) {
      return;
    }

    if (!enableScan) {
      return;
    }

    if (event.rawData === lastFrame) {
      return;
    }

    setLastFrame(event.rawData);
    await processBarCode(event as TxRequestData);
  };

  return (
    <RNCamera
      captureAudio={false}
      onBarCodeRead={onBarCodeRead}
      style={{width: '100%'}}>
      <View style={{}}>
        <Text>Scanner</Text>
      </View>
    </RNCamera>
  );
}
