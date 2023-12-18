#!/bin/sh

# How to use:
# release Appstore with bundle production: build-ios.sh or build-ios.sh production appstore
# release Appstore with bundle staging: build-ios.sh staging or build-ios.sh staging appstore
# export Adhoc with bundle production: build-ios.sh production adhoc
# export Adhoc with bundle staging: build-ios.sh staging adhoc
cd ./ios
rm -rf ./build && rm -rf ./dist && pod install

ENVIRONMENT=${1-"production"}
APPSTORE=${2-"appstore"}
#Builds the xcarchive
if [ $ENVIRONMENT = "production" ]; then
xcodebuild -workspace ./SubWalletMobile.xcworkspace -scheme SubWalletMobile-Production -sdk iphoneos -configuration Release -quiet -archivePath $PWD/dist/SubWallet.xcarchive clean archive
else 
xcodebuild -workspace ./SubWalletMobile.xcworkspace -scheme SubWalletMobile-Staging -sdk iphoneos -configuration Release -quiet -archivePath $PWD/dist/SubWallet.xcarchive clean archive
fi


# Builds the ipa and uploads it to the appstore
if [ $APPSTORE = "appstore" ]; then
xcodebuild -exportArchive -archivePath $PWD/dist/SubWallet.xcarchive -exportOptionsPlist exportOptions.plist -exportPath $PWD/dist
else 
xcodebuild -exportArchive -archivePath $PWD/dist/SubWallet.xcarchive -exportOptionsPlist exportAdhocOptions.plist -exportPath $PWD/dist
fi