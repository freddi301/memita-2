# Memita 2 Mobile app

## Developing

### Prerequisites

- nodejs
- yarn
- npm install -g node-gyp
- npm install -g node-gyp-build
- android developer tools
- java jdk
- python
- make
- gcc
- intellij
- node gyp build tools https://github.com/nodejs/node-gyp
- set environmetn variables
  - ANDROID_HOME
  - ANDROID_SDK_ROOT
  - ANDROID_NDK_HOME
- add to path:
  - $ANDROID_HOME/emulator
  - $ANDROID_HOME/tools
  - $ANDROID_HOME/tools/bin
  - $ANDROID_HOME/platform-tools

### Developing

- on Windows delete `upt-native-nodejs-mobile` and `sodium-native-nodejs-mobile` from package.json
- follow setup instructions [here](https://reactnative.dev/docs/environment-setup)
- follow setup instructions [here](https://code.janeasystems.com/nodejs-mobile/getting-started-react-native)
- `yarn android`

### Ui auto reload and rebuild backend only

- `yarn watch` in `ui` directory
- `yarn watch` in `core` directory
- `yarn start`
- `yarn android`
