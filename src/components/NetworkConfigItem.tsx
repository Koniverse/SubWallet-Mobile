import React, { Suspense } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { IconButton } from 'components/IconButton';
import { DotsThree } from 'phosphor-react-native';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Divider } from 'components/Divider';
import { SVGImages } from 'assets/index';
import { Logo } from 'components/design-system-ui';
import { _ChainInfo, _ChainStatus } from '@subwallet/chain-list/types';

interface Props {
  item: _ChainInfo;
  onPressConfigDetailButton: () => void;
}

const textStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingRight: 8,
};

// const subTextStyle: StyleProp<any> = {
//   ...sharedStyles.mainText,
//   ...FontMedium,
//   color: ColorMap.disabled,
// };

const NetworkConfigItemWrapper: StyleProp<any> = {
  flexDirection: 'row',
  padding: 16,
  justifyContent: 'space-between',
  flex: 1,
};

export const NetworkConfigItem = ({ item, onPressConfigDetailButton }: Props) => {
  return (
    <>
      <View style={NetworkConfigItemWrapper}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <Logo size={36} network={item.slug} />
          <View style={{ paddingHorizontal: 16, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
              <Text numberOfLines={1} style={textStyle}>
                {item.name}
              </Text>
              {item.chainStatus ? (
                item.chainStatus === _ChainStatus.ACTIVE ? (
                  <Suspense fallback={<View style={{ width: 20, height: 20 }} />}>
                    <SVGImages.SignalIcon width={20} height={20} />
                  </Suspense>
                ) : (
                  <Suspense fallback={<View style={{ width: 20, height: 20 }} />}>
                    <SVGImages.SignalSplashIcon width={20} height={20} />
                  </Suspense>
                )
              ) : null}
            </View>

            {/*<Text numberOfLines={1} style={subTextStyle}>*/}
            {/*  {item.currentProvider.startsWith('custom') && item.customProviders*/}
            {/*    ? item.customProviders[item.currentProvider]*/}
            {/*    : item.providers[item.currentProvider]}*/}
            {/*</Text>*/}
          </View>
        </View>

        <IconButton icon={DotsThree} color={ColorMap.disabled} onPress={onPressConfigDetailButton} />
      </View>
      <Divider style={{ paddingLeft: 72, paddingRight: 16 }} color={ColorMap.dark2} />
    </>
  );
};
