import React from 'react';
import { StyleProp, View } from 'react-native';
import { OriginChainSelectField } from 'screens/Sending/Field/OriginChainSelectField';
import i18n from 'utils/i18n/i18n';
import { DestinationChainSelectField } from 'screens/Sending/Field/DestinationChainSelectField';
import { ArrowDown } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';

const ArrowDownWrapperStyle: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  bottom: 4,
  left: 21,
  width: 34,
  justifyContent: 'center',
};

const ArrowDownStyle: StyleProp<any> = {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: ColorMap.dark1,
  justifyContent: 'center',
  alignItems: 'center',
};

interface Props {
  originChain: string;
  onPressOriginChainField?: () => void;
  destinationChain: string;
  onPressDestinationChainField?: () => void;
  disabled?: boolean;
}

export const ChainSelectContainer = ({
  originChain,
  destinationChain,
  onPressOriginChainField,
  onPressDestinationChainField,
  disabled,
}: Props) => {
  return (
    <View style={{ position: 'relative', marginBottom: 12 }}>
      <OriginChainSelectField
        disabled={disabled}
        outerStyle={{ marginBottom: 4, paddingLeft: 58 }}
        label={i18n.sendAssetScreen.originChain}
        networkKey={originChain}
        onPressField={() => {
          onPressOriginChainField && onPressOriginChainField();
        }}
      />

      <DestinationChainSelectField
        disabled={disabled}
        outerStyle={{ marginBottom: 4, paddingLeft: 58 }}
        label={i18n.sendAssetScreen.destinationChain}
        networkKey={destinationChain}
        onPressField={() => {
          onPressDestinationChainField && onPressDestinationChainField();
        }}
      />
      <View style={ArrowDownWrapperStyle}>
        <View style={ArrowDownStyle}>
          <ArrowDown size={16} color={ColorMap.disabled} weight={'bold'} />
        </View>
      </View>
    </View>
  );
};
