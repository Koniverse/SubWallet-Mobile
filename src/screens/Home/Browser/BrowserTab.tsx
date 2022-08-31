import React from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { StyleProp, Text, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { BrowserTabProps, RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import {
  ArrowClockwise,
  CaretLeft,
  CaretRight,
  DotsThree,
  HouseSimple,
  LockSimple,
  LockSimpleOpen,
  MagnifyingGlass,
  X,
} from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';
import { centerStyle, FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { EmptyListPlaceholder } from 'screens/Home/Browser/EmptyListPlaceholder';

const browserTabHeaderWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  backgroundColor: ColorMap.dark2,
  paddingBottom: 12,
  width: '100%',
  alignItems: 'center',
  paddingLeft: 16,
  paddingRight: 4,
};

const nameSiteTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  ...FontSize0,
  color: ColorMap.disabled,
};

const hostNameTextStyle: StyleProp<any> = {
  paddingLeft: 4,
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const bottomButtonAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  backgroundColor: ColorMap.dark1,
  borderTopColor: ColorMap.dark2,
  borderTopWidth: 1,
  paddingTop: 11,
};

const bottomButtonList = [
  {
    icon: CaretLeft,
    onPress: () => {},
  },
  {
    icon: CaretRight,
    onPress: () => {},
  },
  {
    icon: MagnifyingGlass,
    onPress: () => {},
  },
  {
    icon: ArrowClockwise,
    onPress: () => {},
  },
  {
    icon: HouseSimple,
    onPress: () => {},
  },
  {
    icon: DotsThree,
    onPress: () => {},
  },
];

export const BrowserTab = ({
  route: {
    params: { url, name },
  },
}: BrowserTabProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);
  const isAccountWaiting = useSelector((state: RootState) => state.accounts.isWaiting);
  const address = url.split('://')[1].split('/')[0];
  const hostname = address.split(':')[0];
  const isUrlSecure = url.startsWith('https://');
  return (
    <ScreenContainer>
      <>
        <View style={browserTabHeaderWrapperStyle}>
          <AccountSettingButton
            currentAccountAddress={currentAccount?.address || ''}
            isAccountWaiting={isAccountWaiting}
            navigation={navigation}
          />

          <View style={centerStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {isUrlSecure ? (
                <LockSimple size={12} color={ColorMap.primary} weight={'bold'} />
              ) : (
                <LockSimpleOpen size={12} color={ColorMap.primary} weight={'bold'} />
              )}
              <Text style={hostNameTextStyle}>{hostname}</Text>
            </View>
            <Text style={nameSiteTextStyle}>{name}</Text>
          </View>

          <IconButton
            icon={X}
            onPress={() => {
              navigation.canGoBack() && navigation.goBack();
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <EmptyListPlaceholder />
        </View>

        <View style={bottomButtonAreaStyle}>
          {bottomButtonList.map(button => (
            <IconButton icon={button.icon} onPress={button.onPress} size={24} />
          ))}
        </View>
      </>
    </ScreenContainer>
  );
};
