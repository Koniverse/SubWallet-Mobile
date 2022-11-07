#!/bin/sh

cd ./ios
rm -rf ./build && rm -rf ./dist && pod install

#Builds the xcarchive
xcodebuild -workspace ./SubWalletMobile.xcworkspace -scheme SubWalletMobile -sdk iphoneos -configuration Release -quiet -archivePath $PWD/dist/SubWallet.xcarchive clean archive

# Builds the ipa and uploads it to the appstore
xcodebuild -exportArchive -archivePath $PWD/dist/SubWallet.xcarchive -exportOptionsPlist exportOptions.plist -exportPath $PWD/dist