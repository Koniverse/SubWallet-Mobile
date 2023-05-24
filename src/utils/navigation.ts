import { RootNavigationProps, RootStackParamList } from 'routes/index';
import { CommonActions } from '@react-navigation/native';

export function backToHome(goHome: () => void) {
  goHome();
}

export function navigateAndClearCurrentScreenHistory(
  navigation: RootNavigationProps,
  currentScreenKey: keyof RootStackParamList,
  navigateTo: keyof RootStackParamList,
  params?: any,
) {
  navigation.dispatch(state => {
    //todo: find a way to get current currentScreenKey without side effect
    const routes = state.routes.filter(r => r.name !== currentScreenKey);

    return CommonActions.reset({
      ...state,
      routes,
      index: routes.length - 1,
    });
  });

  navigation.navigate(navigateTo, params);
}
