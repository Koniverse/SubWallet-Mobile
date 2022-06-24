import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import Loading from 'components/Loading';
import { ColorMap } from 'styles/color';
import { ArrowDown, ArrowUp } from 'phosphor-react-native';
import { toShort } from 'utils/index';

interface Props extends TouchableOpacityProps {
  isReceiveHistory: boolean;
  isLoading: boolean;
}

const tokenHistoryMainArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingTop: 16,
  paddingBottom: 16,
};
const tokenHistoryPart1: StyleProp<any> = {
  flexDirection: 'row',
  paddingLeft: 16,
  alignItems: 'center',
};
const textStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingBottom: 4,
};
const subTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};
const tokenHistoryMetaWrapper: StyleProp<any> = {
  paddingLeft: 16,
};
const tokenHistoryPart2: StyleProp<any> = {
  alignItems: 'flex-end',
  paddingRight: 16,
};
const tokenHistorySeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 72,
  marginRight: 16,
};
const tokenHistoryItemStyle: StyleProp<any> = {
  width: 40,
  height: 40,
  borderRadius: 15,
  borderStyle: 'solid',
  borderWidth: 2,
  justifyContent: 'center',
  alignItems: 'center',
};

export const TokenHistoryItem = ({ isReceiveHistory, isLoading, onPress }: Props) => {
  const HistorySendIcon = ArrowUp;
  const HistoryReceiveIcon = ArrowDown;

  return (
    <TouchableOpacity style={{ width: '100%' }} onPress={onPress}>
      <View style={tokenHistoryMainArea}>
        <View style={tokenHistoryPart1}>
          <View
            style={[
              tokenHistoryItemStyle,
              isReceiveHistory
                ? { borderColor: 'rgba(66, 197, 154, 0.15)' }
                : { borderColor: 'rgba(0, 75, 255, 0.15)' },
            ]}>
            {isReceiveHistory ? (
              <HistoryReceiveIcon color={'rgba(66, 197, 154, 0.6)'} size={20} weight={'bold'} />
            ) : (
              <HistorySendIcon color={'rgba(0, 75, 255, 0.6)'} size={20} weight={'bold'} />
            )}
          </View>
          <View style={tokenHistoryMetaWrapper}>
            <Text style={textStyle}>
              {toShort('0x9f04e959308032c67ab06a3bd56895b2c7b9cfa980a6bc74141671a592a7e279')}
            </Text>
            <Text style={subTextStyle}>{'Receive - Dec 04'}</Text>
          </View>
        </View>

        {isLoading && (
          <View style={tokenHistoryPart2}>
            <Loading width={40} height={40} />
          </View>
        )}

        {!isLoading && (
          <View style={tokenHistoryPart2}>
            <Text style={textStyle}>{'-10 DOT'}</Text>
            <Text style={subTextStyle}>{'Fee: 0.0003'}</Text>
          </View>
        )}
      </View>

      <View style={tokenHistorySeparator} />
    </TouchableOpacity>
  );
};
