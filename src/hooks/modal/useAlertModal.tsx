import React, { useCallback, useContext, useMemo } from 'react';
import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon } from 'phosphor-react-native';
import { PageIcon } from 'components/design-system-ui';
import { ButtonPropsType } from 'components/design-system-ui/button/PropsType';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AppModalContext } from 'providers/AppModalContext';
import i18n from 'utils/i18n/i18n';

export interface AlertButtonProps {
  text: string;
  onPress?: () => void;
  type?: ButtonPropsType['type'];
}

export interface AlertDialogProps {
  title: string;
  content: string | React.ReactNode;
  type?: NotificationType;
  // Defaults to an "I understand" button that closes the alert
  okButton?: AlertButtonProps;
  cancelButton?: AlertButtonProps;
}

// Mobile counterpart of the extension's openAlert/closeAlert (AlertModal): the shared
// ConfirmModal with the page icon picked by notification type.
const useAlertModal = () => {
  const theme = useSubWalletTheme().swThemes;
  const { confirmModal } = useContext(AppModalContext);
  const { hideConfirmModal, setConfirmModal } = confirmModal;

  const openAlert = useCallback(
    ({ cancelButton, content, okButton, title, type = NotificationType.INFO }: AlertDialogProps) => {
      const iconMap = {
        [NotificationType.INFO]: { icon: InfoIcon, color: theme.geekblue },
        [NotificationType.SUCCESS]: { icon: CheckCircleIcon, color: theme.colorSuccess },
        [NotificationType.WARNING]: { icon: WarningIcon, color: theme.colorWarning },
        [NotificationType.ERROR]: { icon: XCircleIcon, color: theme.colorError },
      };
      const { color, icon } = iconMap[type];

      setConfirmModal({
        visible: true,
        title,
        message: content,
        customIcon: <PageIcon icon={icon} color={color} />,
        completeBtnTitle: okButton?.text || i18n.buttonTitles.iUnderStand,
        completeBtnType: okButton?.type,
        cancelBtnTitle: cancelButton?.text,
        isShowCancelButton: !!cancelButton,
        onCompleteModal: okButton?.onPress || hideConfirmModal,
        onCancelModal: cancelButton?.onPress || hideConfirmModal,
      });
    },
    [hideConfirmModal, setConfirmModal, theme.colorError, theme.colorSuccess, theme.colorWarning, theme.geekblue],
  );

  return useMemo(() => ({ openAlert, closeAlert: hideConfirmModal }), [hideConfirmModal, openAlert]);
};

export default useAlertModal;
