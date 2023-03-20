import React, { useEffect, useState } from 'react';
import RNModal from 'react-native-modal';
import { ModalProps } from 'react-native-modal/dist/modal';
import useAppLock from 'hooks/useAppLock';

export interface SWModalProps extends ModalProps {
  id?: string;
}

export default function ModalBase(props: SWModalProps) {
  const { isLocked } = useAppLock();
  const [isForcedHidden, setForcedHidden] = useState<boolean>(false);

  useEffect(() => {
    if (isLocked) {
      setForcedHidden(true);
    } else {
      setForcedHidden(false);
    }
  }, [isLocked]);

  return (
    <RNModal {...props} avoidKeyboard={props.avoidKeyboard} isVisible={isForcedHidden ? false : props.isVisible} />
  );
}
