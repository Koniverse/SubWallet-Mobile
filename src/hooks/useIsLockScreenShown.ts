import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

/**
 * Whether the unlock screen is actually on screen.
 *
 * `appState.isLocked` on its own is not that. On a fresh install it is true for the whole
 * onboarding: `accountState.isLocked` starts true with no master password yet, so App locks the
 * app - while AppNavigator only routes to Login when there is at least one account
 * (`isLogin && accounts.length > 0`), so the Welcome screen is what is really displayed.
 *
 * Anything that hides itself while the unlock screen covers it has to ask this instead, or it
 * hides itself through onboarding too - which is exactly how every modal on the Welcome screen
 * (create / import / attach account, language, terms) became untappable on Android.
 */
export default function useIsLockScreenShown(): boolean {
  return useSelector((state: RootState) => state.appState.isLocked && state.accountState.accounts.length > 0);
}
