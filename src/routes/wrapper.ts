import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigatorScreenParams } from '@react-navigation/native';
import { TransactionActionStackParamList } from 'routes/transaction/transactionAction';
import { HomeStackParamList } from 'routes/home';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type WrapperParamList = {
  Main: NavigatorScreenParams<HomeStackParamList>;
  FirstScreen: undefined;
  TransactionAction: NavigatorScreenParams<TransactionActionStackParamList>;
  BuyToken: { slug?: string; symbol?: string };
  LoadingScreen: undefined;
};

type NavigationProps = DrawerNavigationProp<WrapperParamList>;
export type WrapperNavigationProps = NavigationProps['navigation'];
export type BuyTokenProps = NativeStackScreenProps<WrapperParamList, 'BuyToken'>;
