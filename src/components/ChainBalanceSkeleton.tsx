import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const chainBalanceMainAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingTop: 16,
  paddingBottom: 16,
};

const chainBalancePart1Style: StyleProp<any> = {
  flexDirection: 'row',
  paddingLeft: 16,
};

const logoStyle: StyleProp<any> = {
  width: 40,
  height: 40,
  borderRadius: 20,
};

const textStyle: StyleProp<any> = {
  height: 13,
  borderRadius: 5,
};

const leftLine1Style: StyleProp<any> = {
  ...textStyle,
  width: 150,
  marginTop: 6,
  marginBottom: 10,
};

const leftLine2Style: StyleProp<any> = {
  ...textStyle,
  width: 100,
};

const rightLine1Style: StyleProp<any> = {
  ...textStyle,
  width: 100,
  marginTop: 6,
  marginBottom: 10,
};

const rightLine2Style: StyleProp<any> = {
  ...textStyle,
  width: 80,
};

const chainBalanceMetaWrapperStyle: StyleProp<any> = {
  paddingLeft: 16,
};

const chainBalancePart2Style: StyleProp<any> = {
  alignItems: 'flex-end',
  paddingRight: 16,
};

const chainBalanceSeparatorStyle: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 72,
  marginRight: 16,
};

export const ChainBalanceSkeleton = () => {
  return (
    <>
      <SkeletonPlaceholder backgroundColor={'#3d3d3d'} highlightColor={'#444'}>
        <View style={chainBalanceMainAreaStyle}>
          <View style={chainBalancePart1Style}>
            <View style={logoStyle} />
            <View style={chainBalanceMetaWrapperStyle}>
              <View style={leftLine1Style} />
              <View style={leftLine2Style} />
            </View>
          </View>

          <View style={chainBalancePart2Style}>
            <View style={rightLine1Style} />
            <View style={rightLine2Style} />
          </View>
        </View>
      </SkeletonPlaceholder>

      <View style={chainBalanceSeparatorStyle} />
    </>
  );
};
