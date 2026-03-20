import env from 'react-native-config';

export const MELD_API_KEY = env.MELD_API_KEY || '';
export const MELD_TEST_MODE = env.MELD_TEST_MODE !== undefined ? env.MELD_TEST_MODE === 'true' : true;

export const MELD_URL = MELD_TEST_MODE ? 'https://sb.meldcrypto.com/' : 'https://meldcrypto.com/';
