import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type SigningActionStackParamList = {
  SigningScanPayload: undefined;
  SigningConfirm: undefined;
  SigningResult: undefined;
};

type NavigationProps = NativeStackScreenProps<SigningActionStackParamList>;
export type SigningActionNavigationProps = NavigationProps['navigation'];
