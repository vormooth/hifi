
## Table of Contents

  * [Prerequisites](#prerequisites)
    * [About environment variables](#about-environment-variables)
    * [Qt](#qt)
    * [Android Studio](#android-studio)
    * [Android SDK and tools versions](#android-sdk-and-tools-versions)
    * [NDK](#ndk)
    * [Cmake 3\.3\.2](#cmake-332)
    * [ant 1\.9\.4](#ant-194)
    * [Java 1\.8](#java-18)
  * [Environment](#environment)
    * [Create a standalone toolchain (android NDK)](#create-a-standalone-toolchain-android-ndk)
    * [Important About Android Build Tools The "android" command is deprecated\.](#important-about-android-build-tools-the-android-command-is-deprecated)
    * [CMake](#cmake)
    * [Scribe](#scribe)
  * [Libraries](#libraries)
    * [Google Gvr sdk](#google-gvr-sdk)
    * [OpenSSL](#openssl)
  * [HiFi](#hifi)
  * [Environment variables recap](#environment-variables-recap)
  * [Build](#build)
    * [CMake](#cmake-1)
    * [make](#make)
  * [Appendix I (Troubleshooting) Could not find Qt5LinguistTools](#appendix-i-troubleshooting-could-not-find-qt5linguisttools)
  * [Appendix II (Troubleshooting) Android device](#appendix-ii-troubleshooting-android-device)
    * [Enable USB Debugging](#enable-usb-debugging)
    * [Huawei Mate 9 Pro logcat](#huawei-mate-9-pro-logcat)
    * [Daydream setup](#daydream-setup)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc.go)


## Prerequisites

### About environment variables

The build process requires environment variables to be set for some software and libraries.
For example, a QT_CMAKE_PREFIX_PATH for a Qt path and ANDROID_NDK for the NDK path should be set. To set the former, on the terminal we should run:

````
export QT_CMAKE_PREFIX_PATH=/Users/user/Qt5.6.1/5.6/android_armv7/lib/cmake
````

Everytime a [Terminal](http://blog.teamtreehouse.com/introduction-to-the-mac-os-x-command-line) is opened, we should set all variables, so a way to make them permanent is creating a .bash_profile file in the user home directory:

Example of .bash_profile

````
export QT_CMAKE_PREFIX_PATH=/Users/user/Qt5.6.1/5.6/android_armv7/lib/cmake
export ANDROID_NDK=/Users/user/Library/Android/sdk/ndk-bundle
````

After saving it, opening a new Terminal will set those variables. To check current variables, just type `export`.


### Qt
Tested in [Qt 5.6.1](http://download.qt.io/official_releases/qt/5.6/5.6.1/qt-opensource-mac-x64-android-5.6.1.dmg.mirrorlist)
Newer versions like Qt 5.6.2 may have problems with the build process.

Environment variable QT_CMAKE_PREFIX_PATH should target the android_armv7/lib/cmake dir

For example if Qt was installed in ~/Qt5.6.1 :
````
"/Users/user/Qt5.6.1/5.6/android_armv7/lib/cmake"
````

### Android Studio
https://developer.android.com/studio/index.html

### Android SDK and tools versions
Inside the package manager (with android studio installed)
- Android SDK Api level 24
- sdk tools 25.2.2
- sdk platform-tools 25

### NDK
If the ndk-bundle is a different version than ndk r12b, download it separately: 
[Android NDK r12b](https://developer.android.com/ndk/downloads/older_releases.html#ndk-12b-downloads)

ndk-bundle or the uncompressed folder for r12b should be in the environment variable ANDROID_NDK.

### Cmake 3.3.2
The build process was fully tested and done with [Cmake 3.3.2](https://cmake.org/files/v3.3/cmake-3.3.2-Darwin-x86_64.tar.gz). Newer versions also worked but may have deprecated some macros and functions that would require changes in our Cmake files.

### ant 1.9.4
http://ant.apache.org/bindownload.cgi

### Java 1.8

Java is needed on the final step to package the apk. Be sure [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) is installed in your system

````
$ java -version
java version "1.8.0_77"
Java(TM) SE Runtime Environment (build 1.8.0_77-b03)
Java HotSpot(TM) 64-Bit Server VM (build 25.77-b03, mixed mode)
````


## Environment

### Create a standalone toolchain (android NDK)
The toolchain for HiFi must target API Level 24, for ARM and using GNU STL. The build process needs a toolchain called "my-tc-24-gnu" in the toolchaing folder inside the ndk. It can be generated running:
`${ANDROID_NDK}/build/tools/make_standalone_toolchain.py --arch arm --api 24 --stl=gnustl --install-dir ${ANDROID_NDK}/toolchains/my-tc-24-gnu`

### Important About Android Build Tools The "android" command is deprecated.

Newer android tools will not run `android update lib-project` which was deprecated:

````
*************************************************************************
The "android" command is deprecated.
For manual SDK, AVD, and project management, please use Android Studio.
For command-line tools, use tools/bin/sdkmanager and tools/bin/avdmanager
*************************************************************************
Invalid or unsupported command "update lib-project -p . -t android-24"

Supported commands are:
android list target
android list avd
android list device
android create avd
android move avd
android delete avd
android list sdk
android update sdk
-- toolchain_setup_args start
[...]
````

Our current toolchain still uses the non gradle build setup for Android, so to make it work a downgrade is needed:
1. Download [Tools r25.2.2](https://dl-ssl.google.com/android/repository/tools_r25.2.2-macosx.zip)
2. Backup your tools dir inside your Android SDK home
3. Copy the uncompressed tools directory from tools_r25.2.2-macosx.zip into the Android SDK home, replacing the previous/original one.
For example:
With ANDROID_HOME or ANDROID_SDK as /Users/user/Library/Android/sdk
````
Library
 |---- Android
        |------- sdk
                  |------- toolsbackup  (the original one, new, that deprecates what we need)
                  |------- tools        (tools_r25.2.2-macosx downloaded)
````

### CMake

We use CMake to generate the makefiles that compile and deploy the Android APKs to your device. In order to create Makefiles for the Android targets, CMake requires that some environment variables are set, and that other variables are passed to it when it is run.

The following must be set in your environment:

* ANDROID_NDK - the root of your Android NDK install
* ANDROID_HOME - the root of your Android SDK install
* ANDROID_LIB_DIR - the directory containing cross-compiled versions of dependencies. (Details below)

##### About ANDROID_LIB_DIR

In general 'hifi' is cloned inside ANDROID_LIB_DIR and other dependencies end up being sister directories of 'hifi'.
For example:
````
workspace-hifi  (ANDROID_LIB_DIR)
|-- hifi (Clone from https://github.com/highfidelity/hifi.git )
|-- gvr-android-sdk
|-- openssl
|-- etc..
````

### Scribe
High Fidelity has a shader pre-processing tool called scribe that various libraries will call on during the build process.
CMake will have a fatal error if it does not find the scribe executable while using the android toolchain.

#### Precompiled binary (recommended)
[Download](https://drive.google.com/open?id=0BzVk5wZGx4ZtOTlMQWwtaW1BUzA) and uncompress it in any folder. That folder path should be set in an ENV variable SCRIBE_PATH.

#### Build it yourself (skip if you have a binary)
Follow the [instructions](./BUILD_SCRIBE_MAC.md) to build scribe and then set an ENV variable SCRIBE_PATH that is a path where the scribe executable is.

#### Scribe path

For example, if the scribe executable is in a tools directory:

````
workspace-hifi  (ANDROID_LIB_DIR)
|-- hifi (Clone from https://github.com/highfidelity/hifi.git )
|-- gvr-android-sdk
|-- openssl
|-- tools
	 |------ scribe (executable)
````
SCRIBE_PATH should be `/ParentOfWorkspace/tools/`

## Libraries

### Google Gvr sdk
Clone this project https://github.com/googlevr/gvr-android-sdk.git into the workspace folder (folder that will contain hifi repo too, so if "hifi" is the checkouted folder, gvr-android-sdk should be a sister of it).
Current integration targets GVR SDK version 1.40.0, so cloning it should retrieve all tags, then run:
 `$ git checkout tags/v1.40.0 -b branch_1_40_0`
 (Or any name you want for that branch)
Finally, set the ENV variable HIFI_ANDROID_GVR as the name of this cloned repository:
For example:
Example, having:
````
workspace-hifi  (ANDROID_LIB_DIR)
|-- hifi (Clone from `https://github.com/highfidelity/hifi.git` )
|-- gvr-android-sdk
|-- etc..
````
HIFI_ANDROID_GVR must be 'gvr-android-sdk' (full path is completed with ANDROID_LIB_DIR)

### OpenSSL

#### Precompiled binary (recommended)
https://www.dropbox.com/s/0ozqzfh9rh0mdzs/openssl.tar.gz?dl=0
(donwload and unpack it to the same workspace folder, being sister of hifi and gvr-android-sdk)

#### Build it yourself  (skip if you have a binary)
Cross-compilation of OpenSSL has been tested from an OS X machine running 10.10 compiling OpenSSL 1.0.2. It is likely that the steps below will work for other OpenSSL versions than 1.0.2.

The original instructions to compile OpenSSL for Android from your host environment can be found [here](http://wiki.openssl.org/index.php/Android). We required some tweaks to get OpenSSL to successfully compile, those tweaks are explained below.

Download the [OpenSSL source](https://www.openssl.org/source/) and extract the tarball inside your `ANDROID_LIB_DIR`. Rename the extracted folder to `openssl`.

You will need the [setenv-android.sh script](http://wiki.openssl.org/index.php/File:Setenv-android.sh) from the OpenSSL wiki.

You must change three values at the top of the `setenv-android.sh` script - `_ANDROID_NDK`, `_ANDROID_EABI` and `_ANDROID_API`.
`_ANDROID_NDK` should be `android-ndk-r10`, `_ANDROID_EABI` should be `arm-linux-androidebi-4.9` and `_ANDROID_API` should be `19`.

First, make sure `ANDROID_NDK_ROOT` is set in your env. This should be the path to the root of your Android NDK install. `setenv-android.sh` needs `ANDROID_NDK_ROOT` to set the environment variables required for building OpenSSL.

Source the `setenv-android.sh` script so it can set environment variables that OpenSSL will use while compiling. If you use zsh as your shell you may need to modify the `setenv-android.sh` for it to set the correct variables in your env.

```
export ANDROID_NDK_ROOT=YOUR_NDK_ROOT
source setenv-android.sh
```

Then, from the OpenSSL directory, run the following commands.

```
perl -pi -e 's/install: all install_docs install_sw/install: install_docs install_sw/g' Makefile.org
./config shared -no-ssl2 -no-ssl3 -no-comp -no-hw -no-engine --openssldir=/usr/local/ssl/$ANDROID_API
make depend
make all
```

This should generate libcrypto and libssl in the root of the OpenSSL directory. YOU MUST remove the `libssl.so` and `libcrypto.so` files that are generated. They are symlinks to `libssl.so.VER` and `libcrypto.so.VER` which Android does not know how to handle. By removing `libssl.so` and `libcrypto.so` the FindOpenSSL module will find the static libs and use those instead.

If you have been building other components it is possible that the OpenSSL compile will fail based on the values other cross-compilations (tbb, bullet) have set. Ensure that you are in a new terminal window to avoid compilation errors from previously set environment variables.

## HiFi

Clone `https://github.com/highfidelity/hifi.git` (conveniently inside ANDROID_LIB_DIR) and then switch to a branch with the latest Android source code.

Branch "Android" should be the one to use. If you check that this file BUILD_ANDROID_MAC.md is not in the root dir, then switch because necessary changes to make the android app run will not be there.

## Environment variables recap

Check all your environment variables and check the Notes below:

````
$ export
declare -x ANDROID_HOME="/Users/user/Library/Android/sdk"
declare -x ANDROID_LIB_DIR="/Users/user/dev/workspace-hifi/"
declare -x ANDROID_NDK="/Users/user/android-ndk-r12b"
declare -x HIFI_ANDROID_GVR="gvr-android-sdk-upd"
declare -x PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Users/user/dev/bin/apache-ant-1.9.4/bin"
declare -x QT_CMAKE_PREFIX_PATH="/Users/user/Qt5.6.1/5.6/android_armv7/lib/cmake"
declare -x SCRIBE_PATH="/Users/user/dev/workspace-hifi/myhififork/build_osx/tools"
declare -x HIFI_ANDROID_MGD="/Users/user/Downloads/dev/mali/Mali_Graphics_Debugger_v4.5.0.b3737c88_MacOSX_x64"
````
#### Notes
* ANDROID_HOME targets the sdk, which in this case was installed with Android Studio. If using an standalone SDK, set that path as that variable.
* The Mali graphics debugger can be enabled setting the variable HIFI_ANDROID_MGD (Optional [download](https://developer.arm.com/products/software-development-tools/graphics-development-tools/mali-graphics-debugger/downloads) and [installation instructions](https://developer.arm.com/products/software-development-tools/graphics-development-tools/mali-graphics-debugger/docs/dui0986/latest/target-installation/android/unrooted-android/installation/installing-the-mgd-android-application)).
* PATH is just an example, as there may be more paths in other systems (ant is important to be there).
* SCRIBE_PATH is like that because in that case the developer built the entire OSX environment (including tools). It can simply be the folder where the downloaded scribe executable is at.

## Build

### CMake

The following must be passed to CMake when it is run:

* USE_ANDROID_TOOLCHAIN - set to true to build for Android

Example running cmake inside a build dir (which itself is inside the project dir e.g. 'hifi')
````
cmake -DUSE_ANDROID_TOOLCHAIN=1 -DANDROID_QT_CMAKE_PREFIX_PATH=$QT_CMAKE_PREFIX_PATH ..
````
Where QT_CMAKE_PREFIX_PATH must be `/QtInstallDir/5.6/android_armv7/lib/cmake`
(With QtInstallDir is the correct path where Qt for Android was installed)

### make

After cmake: run to build the apk
````
make interface-apk
````

## Appendix I (Troubleshooting) Could not find Qt5LinguistTools
If an error like to following happens:

````
Could not find a package configuration file provided by "Qt5LinguistTools"
 with any of the following names:

   Qt5LinguistToolsConfig.cmake
   qt5linguisttools-config.cmake

 Add the installation prefix of "Qt5LinguistTools" to CMAKE_PREFIX_PATH or
 set "Qt5LinguistTools_DIR" to a directory containing one of the above
 files.  If "Qt5LinguistTools" provides a separate development package or
 SDK, be sure it has been installed.
````

Check these requirements:
1. Env variable QT_CMAKE_PREFIX_PATH should target the android_armv7/lib/cmake as a full path like `/Users/cduarte/Qt5.6.1/5.6/android_armv7/lib/cmake`
2. Qt for android should be [version 5.6.1](http://download.qt.io/official_releases/qt/5.6/5.6.1/qt-opensource-mac-x64-android-5.6.1.dmg.mirrorlist).

## Appendix II (Troubleshooting) Android device

Some setup that comes in handy when dealing with Android devices.

### Enable USB Debugging

(Instructions and menu flows for other devices may vary)

Settings -> about phone -> click "build number" several times until a "You are now a Developer" message pops up.

Then in "Developer options" menu, enable "Developer options" and "USB Debugging".

### Huawei Mate 9 Pro logcat

By default, logs are turned off on that phone. To enable them:

Dial

````
*#*#2846579#*#*
````
and you will see a hidden menu. Go to the Project Menu > Background Setting > Log setting and define the log availability (log switch) and level (log level setting). [source](https://stackoverflow.com/a/18395092/939781)

### Daydream setup

Full Daydream setup (includes entering payment information) is required to properly run Daydream and Daydream Apps like Hifi "Interface".
