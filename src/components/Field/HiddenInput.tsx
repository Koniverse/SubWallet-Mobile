import React from 'react';
import { FormItem } from 'components/common/FormItem';
import { Input } from 'components/design-system-ui';
import { Control } from 'react-hook-form/dist/types';
import { ImportTokenFormValues } from 'screens/ImportToken/ImportToken';

interface Props {
  fields: string[];
  control: Control<ImportTokenFormValues, any, ImportTokenFormValues>;
}

export const HiddenInput = ({ fields, control }: Props) => {
  return (
    <>
      {fields.map(key => (
        <FormItem
          key={key}
          name={key}
          control={control}
          render={() => <Input containerStyle={{ display: 'none' }} />}
        />
      ))}
    </>
  );
};
