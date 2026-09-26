/**
 * @format
 */
import '@exodus/patch-broken-hermes-typed-arrays';
// Must stay above './src/Root': imports are hoisted, so a `global.Buffer = ...` statement in this
// file's body would only run after the whole app graph has already been evaluated.
import './shim';
import { AppRegistry } from 'react-native';
import Root from './src/Root';
import { name as appName } from './app.json';
import { Text, TextInput } from 'react-native';

try {
  AppRegistry.registerComponent(appName, () => Root);
} catch (e) {
  console.error('REGISTER FAILED', e);
}

if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}
