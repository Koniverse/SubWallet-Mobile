declare module 'react-native-config' {
  export interface NativeConfig {
    // Buy Token
    TRANSAK_API_KEY?: string;
    TRANSAK_URL?: string;
    COINBASE_PAY_ID?: string;
    BANXA_URL?: string;
    ANDROID_CODEPUSH_KEY?: string;
    IOS_CODEPUSH_KEY?: string;
    BUNDLE_ENV?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
