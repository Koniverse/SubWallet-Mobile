#!/bin/sh

cd ./ios

# Builds the ipa and uploads it to the appstore
xcodebuild -exportArchive -archivePath $PWD/dist/SubWallet.xcarchive -exportOptionsPlist exportOptions.plist -exportPath $PWD/dist