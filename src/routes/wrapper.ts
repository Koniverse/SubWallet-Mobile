import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigatorScreenParams } from '@react-navigation/native';
import { TransactionActionStackParamList } from 'routes/transaction/transactionAction';
import { HomeStackParamList } from 'routes/home';

export type WrapperParamList = {
  Main: NavigatorScreenParams<HomeStackParamList>;
  TransactionAction: NavigatorScreenParams<TransactionActionStackParamList>;
  BuyToken: undefined;
  LoadingScreen: undefined;
};

type NavigationProps = DrawerNavigationProp<WrapperParamList>;
export type WrapperNavigationProps = NavigationProps['navigation'];
