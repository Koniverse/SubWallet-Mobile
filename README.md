## SubWallet Mobile 
This mobile version of [SubWallet Extension](https://github.com/Koniverse/SubWallet-Extension) that is gateway help you access to Dotsama ecosytem.

## Main Concept
![image](https://user-images.githubusercontent.com/11567273/176982199-78bc5c3c-172e-463b-8218-e9f16e5649d4.png)

Mobile version run an [app runner](https://github.com/Koniverse/SubWallet-Extension/tree/master/packages/web-runner) run in hidden webview and use message passing to interact with it.
There are 2 reasons why we do this:
- React native is not support WASM, we can't get full features of `@polkadot/packages` so we need to run most crypto features on webview.
- Using the same resources saves us not only development time, but also makes extension and mobile versioning more consistent

## Development Guild
### Requirement
- Install [yarn](https://yarnpkg.com/)
- Setup [react native development environment](https://reactnative.dev/docs/environment-setup) use React Native CLI.

### Start development
- From package folder run `yarn start` to make sure we installed all required packages
- Android
  - Make sure you started a silumator and check it with command `adb devices`
  - Run `yarn android`
- IOS
  - Run `yarn ios` to start development
