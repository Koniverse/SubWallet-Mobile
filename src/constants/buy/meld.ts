export const MELD_API_KEY = process.env.MELD_API_KEY || '';
export const MELD_TEST_MODE = process.env.MELD_TEST_MODE !== undefined ? !!process.env.MELD_TEST_MODE : true;

export const MELD_URL = MELD_TEST_MODE ? 'https://sb.meldcrypto.com/' : 'https://meldcrypto.com/';
