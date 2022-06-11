import React from "react";
import {Button} from "components/Button";
import DocumentPicker, {DirectoryPickerResponse, DocumentPickerResponse} from "react-native-document-picker";

interface Props {
  onChangeResult: (value: Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null) => void
}

export const InputFile = ({ onChangeResult }: Props) => {
  return (

    <Button
      title="open picker for single file selection"
      onPress={async () => {
        try {
          const pickerResult = await DocumentPicker.pickSingle({
            presentationStyle: 'fullScreen',
            copyTo: 'cachesDirectory',
          })
          onChangeResult([pickerResult])
        } catch (e) {
          console.log('e', e);
        }
      }}
    />
  );
}
