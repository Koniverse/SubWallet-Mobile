import React from 'react';
import { View } from 'react-native';
import Icon from '../icon';
import { IconProps } from 'phosphor-react-native';
import { IconWeight } from 'phosphor-react-native/lib/typescript';

interface Props {
  icon?: React.ElementType<IconProps>;
  color: string;
  backgroundColor?: string;
  customIcon?: React.ReactNode;
  customSize?: number;
  weight?: IconWeight;
}

const PageIcon = ({ icon, color, backgroundColor, customIcon, customSize, weight = 'fill' }: Props) => {
  return (
    <View
      style={{
        width: customSize ? customSize : 112,
        height: customSize ? customSize : 112,
        backgroundColor: backgroundColor || `${color}1A`,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {customIcon ? (
        customIcon
      ) : (
        <Icon phosphorIcon={icon} iconColor={color} weight={weight} customSize={customSize ? customSize / 2 : 64} />
      )}
    </View>
  );
};

export default PageIcon;
