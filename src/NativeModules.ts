import { NativeModules } from 'react-native';

// Minimizer module allows the app to be pushed to the background
const { Minimizer, AppInstaller } = NativeModules;

// TODO: add native modules named exports here
export { Minimizer, AppInstaller };
