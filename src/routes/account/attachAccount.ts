import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QrAccount } from 'types/account/qr';

export type AttachAccountStackParamList = {
  AttachReadOnly: undefined;
  AttachQrSignerConfirm: QrAccount;
};

export type NavigationProps = NativeStackScreenProps<AttachAccountStackParamList>;
export type StakeActionNavigationProps = NavigationProps['navigation'];

export type AttachQrSignerConfirmProps = NativeStackScreenProps<AttachAccountStackParamList, 'AttachQrSignerConfirm'>;
