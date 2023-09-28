import { Platform } from 'react-native';

let StaticServer = null;
let STATES = null;

if (Platform.OS === 'ios') {
  const module = require('@dr.pogodin/react-native-static-server');
  StaticServer = module.default;
  STATES = module.STATES;
}

export { StaticServer, STATES };
