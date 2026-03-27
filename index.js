/**
 * @format
 */
import '@exodus/patch-broken-hermes-typed-arrays';
import { Buffer } from 'buffer';
import { AppRegistry } from 'react-native';
import Root from './src/Root';
import { name as appName } from './app.json';
import { Text, TextInput } from 'react-native';

global.Buffer = Buffer;
global.process = global.process || { env: {} };
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
