import { ForwardedRef, RefObject, useEffect, useRef } from 'react';
import { TextInput } from 'react-native';

export function useForwardFieldRef<T = TextInput>(ref: ForwardedRef<T>): RefObject<T> {
  const fieldRef = useRef<T>(null);

  useEffect(() => {
    if (typeof ref === 'function') {
      ref(fieldRef.current);
    } else if (ref) {
      (ref as React.MutableRefObject<T | null>).current = fieldRef.current;
    }
  }, [ref]);

  return fieldRef;
}
