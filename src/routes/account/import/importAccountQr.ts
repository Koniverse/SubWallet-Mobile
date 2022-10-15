import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QrAccount } from 'types/account/import/qr';

export type ImportAccountQrStackParamList = {
  ImportAccountQrScan: undefined;
  ImportAccountQrConfirm: QrAccount;
};

export type NavigationProps = NativeStackScreenProps<ImportAccountQrStackParamList>;
export type StakeActionNavigationProps = NavigationProps['navigation'];

export type ImportAccountQrConfirmProps = NativeStackScreenProps<
  ImportAccountQrStackParamList,
  'ImportAccountQrConfirm'
>;
