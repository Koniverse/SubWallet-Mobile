// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Images } from 'assets/index';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import CreateStyle from './styles';

interface Props {
  size?: number;
  innerSize?: number;
  children: React.ReactNode;
}

const LogoWithSquircleBorder: React.FC<Props> = (props: Props) => {
  const { innerSize = 56, size = 120, children } = props;
  const style = useMemo(() => CreateStyle(size, innerSize), [innerSize, size]);

  return (
    <View style={style.container}>
      <FastImage source={Images.squircleBorder} resizeMode={'cover'} style={StyleSheet.absoluteFill} />
      <View style={style.inner}>{children}</View>
    </View>
  );
};

export default LogoWithSquircleBorder;
