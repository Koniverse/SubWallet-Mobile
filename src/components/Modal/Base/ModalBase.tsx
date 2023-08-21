import React, { useEffect, useState } from 'react';
import RNModal from 'react-native-modal';
import { ModalProps } from 'react-native-modal/dist/modal';
import useAppLock from 'hooks/useAppLock';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';

export interface SWModalProps extends ModalProps {
  id?: string;
  isUseForceHidden?: boolean;
}

export default function ModalBase(props: SWModalProps) {
  const { isLocked } = useAppLock();
  const { isUseForceHidden = true } = props;
  const [isForcedHidden, setForcedHidden] = useState<boolean>(false);
  const { numberOfConfirmations } = useConfirmationsInfo();

  useEffect(() => {
    if (isUseForceHidden && (isLocked || !!numberOfConfirmations)) {
      setForcedHidden(true);
    } else {
      setForcedHidden(false);
    }
  }, [isLocked, isUseForceHidden, numberOfConfirmations]);

  return (
    <RNModal {...props} avoidKeyboard={props.avoidKeyboard} isVisible={isForcedHidden ? false : props.isVisible} />
  );
}
