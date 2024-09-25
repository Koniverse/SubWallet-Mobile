import React, { isValidElement } from 'react';
import { Icon } from 'components/design-system-ui';
import { CheckSquare, Square } from 'phosphor-react-native';

interface Props {
  checked?: boolean;
  checkedIcon?: React.ReactElement<{}>;
  uncheckedIcon?: React.ReactElement<{}>;
}

export const CheckBoxIcon = ({ checked, checkedIcon, uncheckedIcon }: Props) => {
  if (checked && isValidElement(checkedIcon)) {
    return checkedIcon;
  }

  if (!checked && isValidElement(uncheckedIcon)) {
    return uncheckedIcon;
  }

  return (
    <Icon phosphorIcon={!checked ? Square : CheckSquare} iconColor={'#004BFF'} weight={!checked ? undefined : 'fill'} />
  );
};
