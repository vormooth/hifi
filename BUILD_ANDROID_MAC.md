
## Qt
http://download.qt.io/official_releases/qt/5.6/5.6.1/qt-opensource-mac-x64-android-5.6.1.dmg.mirrorlist

## Android Studio
https://developer.android.com/studio/index.html

## Inside the package manager (once android studio is installed)
- Android SDK Api level 24
- sdk tools 25.2.2
- sdk platform-tools 25

## NDK
If the ndk-bundle is a different version than ndk r12b, download it separately
Android NDK r12b
https://developer.android.com/ndk/downloads/older_releases.html#ndk-12b-downloads

## Cmake 3.3.2

## Google Gvr sdk
Clone this branch https://github.com/Cristo86/gvr-android-sdk/tree/common_prev_version into the workspace folder (folder that will contain hifi repo too, so if "hifi" is the checkouted folder, gvr-android-sdk might be a sister of it)

## Create a standalone toolchain (android NDK)
${ANDROID_NDK}/build/tools/make_standalone_toolchain.py --arch arm --api 24 --stl=gnustl --install-dir ${ANDROID_NDK}/toolchains/my-tc-24-gnu

## Get this pre-compiled for android openSSL folder
https://www.dropbox.com/s/0ozqzfh9rh0mdzs/openssl.tar.gz?dl=0
(donwload and unpack it to the same workspace folder, being sister of hifi and gvr-android-sdk)

## ant 1.9.4
http://ant.apache.org/bindownload.cgi

## Other conventions
Be sure to follow also the conventions about env. variables from the original build_android instructions and Scribe:
https://github.com/highfidelity/hifi/blob/master/BUILD_ANDROID.md
