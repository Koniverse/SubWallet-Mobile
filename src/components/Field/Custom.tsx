import React from 'react';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';

interface Props extends FieldBaseProps {
  children: JSX.Element;
}

export const CustomField = ({ children, ...fieldBase }: Props) => {
  return <FieldBase {...fieldBase}>{children}</FieldBase>;
};
