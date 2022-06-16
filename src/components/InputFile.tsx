import React, { useCallback } from 'react';
import DocumentPicker, { DirectoryPickerResponse, DocumentPickerResponse } from 'react-native-document-picker';
import { Text, TouchableOpacity } from 'react-native';
import { FileArrowUp } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

interface Props {
  onChangeResult: (value: Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null) => void;
}

export const InputFile = ({ onChangeResult }: Props) => {
  const onChangeFile = useCallback(async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      onChangeResult([pickerResult]);
    } catch (e) {
      console.log('e', e);
    }
  }, [onChangeResult]);

  return (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        backgroundColor: ColorMap.dark2,
        borderRadius: 5,
        paddingVertical: 50,
        marginBottom: 8,
      }}
      onPress={onChangeFile}>
      <FileArrowUp size={32} weight={'regular'} color={ColorMap.light} />
      <Text style={{ ...sharedStyles.mainText, color: ColorMap.light, ...FontMedium, paddingTop: 8, paddingBottom: 4 }}>
        Please paste content from JSON file
      </Text>
      <Text style={{ ...sharedStyles.mainText, color: ColorMap.disabled, ...FontMedium }}>
        you exported from Polkadot.js to this box
      </Text>
    </TouchableOpacity>
  );
};
