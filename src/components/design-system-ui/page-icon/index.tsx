import React from 'react';
import { View } from 'react-native';
import Icon from '../icon';
import { IconProps, IconWeight } from 'phosphor-react-native';

interface Props {
  icon?: React.ElementType<IconProps>;
  color: string;
  backgroundColor?: string;
  customIcon?: React.ReactNode;
  weight?: IconWeight;
}

const PageIcon = ({ icon, color, backgroundColor, customIcon, weight = 'fill' }: Props) => {
  return (
    <View
      style={{
        width: 112,
        height: 112,
        backgroundColor: backgroundColor || `${color}1A`,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {customIcon ? customIcon : <Icon phosphorIcon={icon} iconColor={color} weight={weight} customSize={64} />}
    </View>
  );
};

export default PageIcon;
