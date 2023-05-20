#!/bin/sh

cd ./android
# Clean and build android bundleRelease
./gradlew clean && ./gradlew bundleRelease

# Build apk from the bundle follow this instruction https://stackoverflow.com/questions/53040047/generate-apk-file-from-aab-file-android-app-bundle
#java -jar /Volumes/MacData/App/bundletool.jar build-apks --bundle=$PWD/app/build/outputs/bundle/release/app-release.aab --output=$PWD/app/build/outputs/apk/build.apks --mode=universal --ks=/Volumes/MacData/App/my-upload-key.keystore --ks-pass=pass:$KS_PASSWORD --ks-key-alias=my-key-alias --key-pass=pass:$KS_PASSWORD
#
#unzip -p $PWD/app/build/outputs/apk/build.apks universal.apk > $PWD/app/build/outputs/apk/universal.apk
