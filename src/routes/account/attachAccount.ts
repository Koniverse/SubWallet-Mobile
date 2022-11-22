import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QrAccount } from 'types/qr/attach';

export type AttachAccountStackParamList = {
  AttachReadOnly: undefined;
  AttachQrSignerConfirm: QrAccount;
  ImportAccountQrConfirm: QrAccount;
};

export type NavigationProps = NativeStackScreenProps<AttachAccountStackParamList>;
export type StakeActionNavigationProps = NavigationProps['navigation'];

export type AttachQrSignerConfirmProps = NativeStackScreenProps<AttachAccountStackParamList, 'AttachQrSignerConfirm'>;
export type ImportAccountQrConfirmProps = NativeStackScreenProps<AttachAccountStackParamList, 'ImportAccountQrConfirm'>;
