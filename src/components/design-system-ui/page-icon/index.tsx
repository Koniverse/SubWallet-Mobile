import React from 'react';
import { View } from 'react-native';
import Icon from '../icon';
import { IconProps } from 'phosphor-react-native';

interface Props {
  icon?: React.ElementType<IconProps>;
  color: string;
  backgroundColor?: string;
  customIcon?: React.ReactNode;
  customSize?: number;
}

const PageIcon = ({ icon, color, backgroundColor, customIcon, customSize }: Props) => {
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
        <Icon phosphorIcon={icon} iconColor={color} weight={'fill'} customSize={customSize ? customSize / 2 : 64} />
      )}
    </View>
  );
};

export default PageIcon;
