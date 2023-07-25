import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEventName, Platform } from 'react-native';

const EVENT_SHOW_TYPE: KeyboardEventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const EVENT_HIDE_TYPE: KeyboardEventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

export const useKeyboardVisible = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(EVENT_SHOW_TYPE, e => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
    });
    const keyboardWillHideListener = Keyboard.addListener(EVENT_HIDE_TYPE, () => {
      setKeyboardHeight(0);
      setKeyboardVisible(false);
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};
