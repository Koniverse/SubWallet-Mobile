## SubWallet Mobile 
This mobile version of [SubWallet Extension](https://github.com/Koniverse/SubWallet-Extension) that is gateway help you access to Dotsama ecosystem.

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
- [CMake] is required on the build host for web runner.

  - When building for **Android**, [CMake] should be installed as a part of your
    _Android SDK_ (open _SDK Manager_, and look for [CMake] within
    the _SDK Tools_ tab).

  - On **MacOS**, the `pkg-config` dependency is also needed. You can install both via [Homebrew],
    by executing:
    ```shell
    $ brew install cmake pkg-config
    ```
    **IMPORTANT:** [Homebrew] should have added `eval "$(/opt/homebrew/bin/brew shellenv)"'`
    command to your `.zshrc` or `.bashrc`. Although this works for interactive terminals,
    it might not work for sessions inside of other apps, such as XCode, therefore you might need to
    manually create symbolic links:

    ```shell
    $ sudo ln -s $(which cmake) /usr/local/bin/cmake
    $ sudo ln -s $(which pkg-config) /usr/local/bin/pkg-config
    ```

    For details read: https://earthly.dev/blog/homebrew-on-m1,
    and [Issue#29](https://github.com/birdofpreyru/react-native-static-server/issues/29).


### Start development
- From package folder run `yarn start` to make sure we installed all required packages
- Android
  - Make sure you started a silumator and check it with command `adb devices`
  - Run `yarn android`
- IOS
  - Run `yarn ios` to start development
