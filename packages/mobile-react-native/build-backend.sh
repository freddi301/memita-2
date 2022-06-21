#!/bin/bash

set -xe

# compile typescript
rm -rf dist && yarn tsc --noEmit false --outDir dist

# bundle
yarn noderify dist/backend.js -o nodejs-assets/nodejs-project/main.js

# install dependendencies
(cd nodejs-assets/nodejs-project; yarn)

# copy *.so files because nodej-mobile doesn't
declare -a archs=(
  "armeabi-v7a;arm"
  "arm64-v8a;arm64"
)
for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"
  nodearch="${arr[1]}"
  mkdir -p android/app/src/main/jniLibs/$arch;
  cp ./nodejs-assets/nodejs-project/node_modules/sodium-native-nodejs-mobile/lib/android-$nodearch/libsodium.so \
    android/app/src/main/jniLibs/$arch/libsodium.so;
done

# copy wasm files
mkdir -p ./nodejs-assets/nodejs-project/sql.js/dist
cp -r ./nodejs-assets/nodejs-project/node_modules/sql.js/dist/* ./nodejs-assets/nodejs-project/sql.js/dist/

# build native modules *.node files
cd android;
for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"
  ./gradlew nodejs-mobile-react-native:GenerateNodeNativeAssetsLists$arch
done
cd ..;

# delete node_modules otherwise it clutters apk, we already boundled the whole app
rm -rf nodejs-assets/nodejs-project/node_modules