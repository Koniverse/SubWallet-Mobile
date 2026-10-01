/**
 * Node globals the polyfilled dependencies (react-native-crypto, stream-browserify, readable-stream,
 * @polkadot/*) expect. Some of them read `Buffer` while their own module body is being evaluated,
 * so these assignments must happen before the app module graph is required — see index.js.
 *
 * @format
 */
import { Buffer } from 'buffer';

global.Buffer = Buffer;
global.process = global.process || { env: {} };
