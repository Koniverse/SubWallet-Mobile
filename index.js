/**
 * @format
 */

import { AppRegistry } from 'react-native';
import Root from './src/Root';
import { name as appName } from './app.json';
import { Text, TextInput } from 'react-native';

AppRegistry.registerComponent(appName, () => Root);

if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}
