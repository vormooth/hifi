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
set QT_CMAKE_PREFIX_PATH=C:\Qt\Qt5.6.1\5.6\android_armv7\lib\cmake
setx QT_CMAKE_PREFIX_PATH=%QT_CMAKE_PREFIX_PATH%
````

Notice that setx will make persistent the variables for new terminal windows (but not for the already opened ones). You can also add the environment variable [manually] (https://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/sysdm_advancd_environmnt_addchange_variable.mspx?mfr=true)

### Qt
Tested in [Qt 5.6.1](http://download.qt.io/official_releases/qt/5.6/5.6.1-1/qt-opensource-windows-x86-android-5.6.1-1.exe.mirrorlist)
Newer versions like Qt 5.6.2 may have problems with the build process.

Environment variable QT_CMAKE_PREFIX_PATH should target the android_armv7\lib\cmake dir

For example if Qt was installed in ~/Qt5.6.1 :
````
"/Users/user/Qt5.6.1/5.6/android_armv7/lib/cmake"
````

### Visual Studio 12.0 (Community is enough)

Visual Studio 12 2013 is needed. Newer versions have not been tested.

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

ndk-bundle or the uncompressed folder for r12b should be in the environment variable ANDROID_NDK *using unix slashes*.

````
set ANDROID_NDK=C:/Users/user/workspace-hifi/android-ndk-r12b
setx ANDROID_NDK=%ANDROID_NDK%
````

### Cmake 3.3.2
The build process was fully tested and done with [Cmake 3.3.2](https://cmake.org/files/v3.3/cmake-3.3.2-win32-x86.zip). Newer versions also worked but may have deprecated some macros and functions that would require changes in our Cmake files.

### ant 1.9.4
http://ant.apache.org/bindownload.cgi

### Java 1.8

Java is needed on the final step to package the apk. Be sure [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) is installed in your system and remember to set JAVA_HOME pointing to your JDK.

````
C:\Users\user>java -version
java version "1.8.0_131"
Java(TM) SE Runtime Environment (build 1.8.0_131-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.131-b11, mixed mode)
C:\Users\user>

````

````
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_131
setx JAVA_HOME %JAVA_HOME%
````

### GNU Make for Windows 

GNU Make is needed to build the all the libraries and the project itself. Download at [gnuwin32](http://gnuwin32.sourceforge.net/packages/make.htm)

### Python

Python is used to execute the Android NDK script that creates a standalone toolchain. Download and install [Python](https://www.python.org/ftp/python/2.7.12/python-2.7.12.msi)

### check prerequisites

With the utility [checkhifi.bat](https://drive.google.com/open?id=0BzVk5wZGx4ZtaFZudjluQzNXcU0) you can check if you have the needed variables and programs.

## Environment

### Create a standalone toolchain (android NDK)
The toolchain for HiFi must target API Level 24, for ARM and using GNU STL. The build process needs a toolchain called "my-tc-24-gnu" in the toolchaing folder inside the ndk. It can be generated running:
`%ANDROID_NDK%\build\tools\make_standalone_toolchain.py --arch arm --api 24 --stl=gnustl --install-dir %ANDROID_NDK%\toolchains\my-tc-24-gnu`

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
1. Download [Tools r25.2.2](https://dl.google.com/android/repository/tools_r25.2.2-windows.zip)
2. Backup your tools dir inside your Android SDK home
3. Copy the uncompressed tools directory from tools_r25.2.2-windows.zip into the Android SDK home, replacing the previous/original one.
For example:
With ANDROID_HOME as C:/Users/user/AppData/Local/Android/sdk
````
...
 |---- Android
        |------- sdk
                  |------- toolsbackup  (the original one, new, that deprecates what we need)
                  |------- tools        (tools_r25.2.2-windows downloaded)
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
[Download](https://drive.google.com/open?id=0BzVk5wZGx4Ztc0tpelgxdjF1dkU) and uncompress it in any folder. That folder path should be set in an ENV variable SCRIBE_PATH.

#### Build it yourself (skip if you have a binary)
Follow the [instructions](./BUILD_SCRIBE_WIN.md) to build scribe and then set an ENV variable SCRIBE_PATH that is a path where the scribe executable is.

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
SCRIBE_PATH should be `C:\Users\user\workspace-hifi\tools`

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

Check [Build OpenSSL for Mac](/BUILD_ANDROID_MAC.md#build-it-yourself-skip-if-you-have-a-binary-1)

## HiFi

Clone `https://github.com/highfidelity/hifi.git` (conveniently inside ANDROID_LIB_DIR) and then switch to a branch with the latest Android source code.

Branch "Android" should be the one to use. If you check that this file BUILD_ANDROID_MAC.md is not in the root dir, then switch because necessary changes to make the android app run will not be there.

## Environment variables recap

Check all your environment variables and check the Notes below:

````
C:\> SET ANDROID_HOME="C:/Users/user/AppData/Local/Android/sdk"
C:\> SET ANDROID_LIB_DIR="C:/Users/user/workspace-hifi"
C:\> SET ANDROID_NDK="C:/Users/user/workspace-hifi/android-ndk-r12b"
C:\> SET HIFI_ANDROID_GVR="gvr-android-sdk-upd"
C:\> SET SCRIBE_PATH="C:\Users\user\workspace-hifi\tools"
C:\> SET PATH=%PATH%:"C:\Program Files\ant\bin:%JAVA_HOME%\bin"

C:\> SETX ANDROID_HOME %ANDROID_HOME%
C:\> SETX ANDROID_LIB_DIR %ANDROID_LIB_DIR%
C:\> SETX ANDROID_NDK %ANDROID_NDK%
C:\> SETX HIFI_ANDROID_GVR %HIFI_ANDROID_GVR%
C:\> SETX SCRIBE_PATH=%SCRIBE_PATH%
C:\> SETX PATH %PATH%

````
#### Notes
* ANDROID_HOME targets the sdk, which in this case was installed with Android Studio. If using an standalone SDK, set that path as that variable.
* PATH is just an example, as there may be more paths in other systems (ant is important to be there).

## Build

### CMake

The following must be passed to CMake when it is run:

* USE_ANDROID_TOOLCHAIN - set to true to build for Android

Example running cmake inside a build dir (which itself is inside the project dir e.g. 'hifi')

````
cmake -G "Unix Makefiles" -DUSE_NSIGHT=0 -DUSE_ANDROID_TOOLCHAIN=1 -DANDROID_QT_CMAKE_PREFIX_PATH=%QT_CMAKE_PREFIX_PATH% ..
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


# HiFi interface - Android build on Windows

## Fix makefiles that use scribe
Generated makefiles use .. which is not working on Windows. So we must replace
  ```
  ../../../tools/scribe/build/Debug/scribe.exe
  ```
  for
  ```
  c:/Users/user/dev/workspace-hifi/hifi/tools/scribe/build/Debug/scribe.exe
  ```
  (Or in your case your full path to scribe)

### Use fixscribeinmakes.bat

Edit it, particularly to match paths in your system. Must check these variables inside:
```
FIX_SCRIBE_OLD
FIX_SCRIBE_NEW
```
And the line that changes dir to libraries should point your actual build-dir\libraries
```
cd  C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries
```

## Build
Use build_android.bat that runs cmake for you and creates a build folder.
Inside the build folder, run
```
make interface-apk
```

## ndk r12b + android-24 + Google VR

### prerequisites

download gvr
git clone https://github.com/googlevr/gvr-android-sdk
(where? in android_lib_dir location, generally one level outside the cloned hifi)

sdk:
android 7.0
sdk tools 25.2.2
sdk platform-tools 25

download r12b
https://github.com/android-ndk/ndk/wiki

python to make a standalone toolchain
https://www.python.org/ftp/python/2.7.12/python-2.7.12.msi

new openssl to replace old one
targeting android-24
(given a tar.gz, use
```
tar -zxvf backup.tar.gz
```
from git bash.

### create standalone toolchain
```
C:\Users\user\dev\bin\android-ndk-r12b\build\tools>make_standalone_toolchain.py --arch arm --api 24 --stl=libc++ --install-dir C:\Users\user\dev\bin\android-ndk-r12b\toolchains\my-tc-24-libc
```
  creates folder
  ```
  C:\Users\user\dev\bin\android-ndk-r12b\toolchains\my-tc-24-libc
  ```

Complete toolchain by copying libsupc
```
c:\Users\user\dev\bin\android-ndk-r12b\sources\cxx-stl\gnu-libstdc++\4.9\libs\armeabi-v7a\libsupc++.a
to
c:\Users\user\dev\bin\android-ndk-r12b\toolchains\my-tc-24-libc\arm-linux-androideabi\lib\armv7-a\
```
## Additional changes

### fix toolchain

Separate the suffix for clang from other tools (so some will use .exe, clang .cmd)

```
+++ b/cmake/android/android.toolchain.cmake
@@ -362,6 +362,7 @@ if( NOT DEFINED ANDROID_NDK_HOST_X64 AND (CMAKE_HOST_SYSTEM_PROCESSOR MATCHES "a
 endif()

 set( TOOL_OS_SUFFIX "" )
+set( TOOL_OS_CLANG_SCRIPT_SUFFIX "" )
 if( CMAKE_HOST_APPLE )
  set( ANDROID_NDK_HOST_SYSTEM_NAME "darwin-x86_64" )
  set( ANDROID_NDK_HOST_SYSTEM_NAME2 "darwin-x86" )
@@ -369,6 +370,7 @@ elseif( CMAKE_HOST_WIN32 )
  set( ANDROID_NDK_HOST_SYSTEM_NAME "windows-x86_64" )
  set( ANDROID_NDK_HOST_SYSTEM_NAME2 "windows" )
  set( TOOL_OS_SUFFIX ".exe" )
+ set( TOOL_OS_CLANG_SCRIPT_SUFFIX ".cmd" )
 elseif( CMAKE_HOST_UNIX )
  set( ANDROID_NDK_HOST_SYSTEM_NAME "linux-x86_64" )
  set( ANDROID_NDK_HOST_SYSTEM_NAME2 "linux-x86" )
@@ -1108,23 +1110,24 @@ else()
 endif()
 unset( _ndk_ccache )

-
+message (STATUS "CMAKE_C_COMPILER ${CMAKE_C_COMPILER}")
+message (STATUS "CMAKE_CXX_COMPILER ${CMAKE_CXX_COMPILER}")
 # setup the cross-compiler
 if( NOT CMAKE_C_COMPILER )
  if( NDK_CCACHE AND NOT ANDROID_SYSROOT MATCHES "[ ;\"]" )
   set( CMAKE_C_COMPILER   "${NDK_CCACHE}" CACHE PATH "ccache as C compiler" )
   set( CMAKE_CXX_COMPILER "${NDK_CCACHE}" CACHE PATH "ccache as C++ compiler" )
   if( ANDROID_COMPILER_IS_CLANG )
-   set( CMAKE_C_COMPILER_ARG1   "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}${TOOL_OS_SUFFIX}"   CACHE PATH "C compiler")
-   set( CMAKE_CXX_COMPILER_ARG1 "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}++${TOOL_OS_SUFFIX}" CACHE PATH "C++ compiler")
+   set( CMAKE_C_COMPILER_ARG1   "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}${TOOL_OS_CLANG_SCRIPT_SUFFIX}"   CACHE PATH "C compiler")
+   set( CMAKE_CXX_COMPILER_ARG1 "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}++${TOOL_OS_CLANG_SCRIPT_SUFFIX}" CACHE PATH "C++ compiler")
   else()
    set( CMAKE_C_COMPILER_ARG1   "${ANDROID_TOOLCHAIN_ROOT}/bin/${ANDROID_TOOLCHAIN_MACHINE_NAME}-gcc${TOOL_OS_SUFFIX}" CACHE PATH "C compiler")
    set( CMAKE_CXX_COMPILER_ARG1 "${ANDROID_TOOLCHAIN_ROOT}/bin/${ANDROID_TOOLCHAIN_MACHINE_NAME}-g++${TOOL_OS_SUFFIX}" CACHE PATH "C++ compiler")
   endif()
  else()
   if( ANDROID_COMPILER_IS_CLANG )
-   set( CMAKE_C_COMPILER   "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}${TOOL_OS_SUFFIX}"   CACHE PATH "C compiler")
-   set( CMAKE_CXX_COMPILER "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}++${TOOL_OS_SUFFIX}" CACHE PATH "C++ compiler")
+   set( CMAKE_C_COMPILER   "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}${TOOL_OS_CLANG_SCRIPT_SUFFIX}"   CACHE PATH "C compiler")
+   set( CMAKE_CXX_COMPILER "${ANDROID_CLANG_TOOLCHAIN_ROOT}/bin/${_clang_name}++${TOOL_OS_CLANG_SCRIPT_SUFFIX}" CACHE PATH "C++ compiler")
   else()
    set( CMAKE_C_COMPILER   "${ANDROID_TOOLCHAIN_ROOT}/bin/${ANDROID_TOOLCHAIN_MACHINE_NAME}-gcc${TOOL_OS_SUFFIX}"    CACHE PATH "C compiler" )
    set( CMAKE_CXX_COMPILER "${ANDROID_TOOLCHAIN_ROOT}/bin/${ANDROID_TOOLCHAIN_MACHINE_NAME}-g++${TOOL_OS_SUFFIX}"    CACHE PATH "C++ compiler" )
@@ -1144,7 +1147,8 @@ if( NOT CMAKE_C_COMPILER )
  set( CMAKE_OBJDUMP      "${ANDROID_TOOLCHAIN_ROOT}/bin/${ANDROID_TOOLCHAIN_MACHINE_NAME}-objdump${TOOL_OS_SUFFIX}" CACHE PATH "objdump" )
  set( CMAKE_RANLIB       "${ANDROID_TOOLCHAIN_ROOT}/bin/${ANDROID_TOOLCHAIN_MACHINE_NAME}-ranlib${TOOL_OS_SUFFIX}"  CACHE PATH "ranlib" )
 endif()
-
+message (STATUS "CMAKE_C_COMPILER ${CMAKE_C_COMPILER}")
+message (STATUS "CMAKE_CXX_COMPILER ${CMAKE_CXX_COMPILER}")
 set( _CMAKE_TOOLCHAIN_PREFIX "${ANDROID_TOOLCHAIN_MACHINE_NAME}-" )
:
```
(USE .cmd for compilers)

### Troubleshooting

#### Path errors

At least ANDROID_LIB_DIR and NDK_PATH should use / slashes
```
ANDROID_LIB_DIR
C:\Users\user\dev\workspace-hifi\hifi>set ANDROID_LIB_DIR=c:/Users/user/dev/workspace-hifi/
C:\Users\user\dev\workspace-hifi\hifi>setx ANDROID_LIB_DIR %ANDROID_LIB_DIR%
```

#### Some    l i b w h a t v e r . s o    (e.g. like it being searching for wrong lib names - missing e) not found

Whenever the linker does not find a library, just provide the one with the name "suggested".

Example of the situation with a missing 's' in libprocedural.so (so it looks for libprocedural.o):
```
  [ 86%] Linking CXX shared library apk/libs/armeabi-v7a/libinterface.so
  clang++.exe: error: no such file or directory: 'apk/libs/armeabi-v7a/libprocedural.o'
  make[3]: *** [interface/apk/libs/armeabi-v7a/libinterface.so] Error 1
  make[2]: *** [interface/CMakeFiles/interface.dir/all] Error 2
  make[1]: *** [interface/CMakeFiles/interface-apk.dir/rule] Error 2
  make: *** [interface-apk] Error 2
```
Create a copy of the existing libprocedural.so file as *libprocedural.o* and then run make interface-apk again

**It is pending to discover why that happens, this is just a workaround to make it possible to build**

#### Syntax error when linking libinterface.so

Edit the build_dir/interface/CMakeFiles/interface.dir/build.make:
Look for the string
```
Linking CXX shared library apk/libs/armeabi-v7a/libinterface.so
```
Next to it there should be a call to *clang++.cmd*, replace it for **clang38++.exe**

#### build.xml error when running qtcreateapk

Apparently the code that runs "android update" on the gvr-common library doesn't run at all on Windows.
Manually run inside build-dir/interface/gvr-common:
```
%ANDROID_HOME%/tools/android update lib-project -p . -t android-24
```
(our current target is android-24)
Run interface-apk again inside build-dir.




## Appendix - Custom scripts
  We have some helpul and needed scripts to build Android on Windows as the process was outlined for OS X in the first place. Further work should make it possible to skip them.

  All these scripts should be accessible, by being in the PATH.

  checkhifi.bat - shows needed variables and executables
  ```
  @echo OFF

  ::call:checkVar ANDROID_HOME %ANDROID_HOME%

  echo:
  echo Checking environment variables...
  echo:
  SET VAR=ANDROID_HOME
  SET VAL=%ANDROID_HOME%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  SET VAR=ANDROID_NDK
  SET VAL=%ANDROID_NDK%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  SET VAR=NDK_HOME
  SET VAL=%NDK_HOME%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  SET VAR=ANDROID_NDK_ROOT
  SET VAL=%ANDROID_NDK_ROOT%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  SET VAR=ANDROID_LIB_DIR
  SET VAL=%ANDROID_LIB_DIR%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  SET VAR=QT_CMAKE_PREFIX_PATH
  SET VAL=%QT_CMAKE_PREFIX_PATH%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  SET VAR=QT_CMAKE_PREFIX_PATH_ANDROID
  SET VAL=%QT_CMAKE_PREFIX_PATH_ANDROID%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  SET VAR=SCRIBE_PATH
  SET VAL=%SCRIBE_PATH%
  if "%VAL%" == "" ( echo [ERROR] %VAR% Not defined ****** ) else ( echo [INFO ] %VAR% defined as [%VAL%] )
  echo:
  @echo Check finished...
  echo:
  echo:
  @echo Checking programs in path...
  echo:
  SET PROG=cl.exe
  for %%X in (%PROG%) do (set FOUND=%%~$PATH:X)
  if "%FOUND%" == "" (
      echo [ERROR] %PROG% not found ******
      echo [INFO ] Must run "vcvarsall.bat" x64 from your "Visual Studio\VC" installation to find cl
  ) else (
      echo [INFO ] %PROG% found at "%FOUND%"
  )

  SET PROG=make.exe
  for %%X in (%PROG%) do (set FOUND=%%~$PATH:X)
  if "%FOUND%" == "" ( echo [ERROR] %PROG% not found ****** ) else ( echo [INFO ] %PROG% found at "%FOUND%" )

  SET PROG=cp.bat
  for %%X in (%PROG%) do (set FOUND=%%~$PATH:X)
  if "%FOUND%" == "" ( echo [ERROR] %PROG% not found ****** ) else ( echo [INFO ] %PROG% found at "%FOUND%" )

  SET PROG=cmake.exe
  for %%X in (%PROG%) do (set FOUND=%%~$PATH:X)
  if "%FOUND%" == "" ( echo [ERROR] %PROG% not found ****** ) else ( echo [INFO ] %PROG% found at "%FOUND%" )

  SET PROG=java.exe
  for %%X in (%PROG%) do (set FOUND=%%~$PATH:X)
  if "%FOUND%" == "" ( echo [ERROR] %PROG% not found ****** ) else ( echo [INFO ] %PROG% found at "%FOUND%" )

  SET PROG=javac.exe
  for %%X in (%PROG%) do (set FOUND=%%~$PATH:X)
  if "%FOUND%" == "" ( echo [ERROR] %PROG% not found ****** ) else ( echo [INFO ] %PROG% found at "%FOUND%" )

  goto:eof

  :eof
  ```

  cp.bat - "cp" for windows adaptation (make uses cp instead of copy)
  ```
  @echo off
  set a=%1
  set b=%2
  set a=%a:/=\%
  set b=%b:/=\%
  rem echo %a%
  rem echo %b%
  copy %a% %b%
  ```

  vars.bat (sets env vars automatically without having to go to the UI, edit first!)
  ```
  set ANDROID_HOME=c:/Users/user/dev/bin/android-sdk-windows/
  set ANDROID_NDK=c:\Users\user\dev\bin\android-ndk-r10e\
  set NDK_HOME=%ANDROID_NDK%
  set ANDROID_NDK_ROOT=%ANDROID_NDK%
  set ANDROID_LIB_DIR=c:\Users\user\dev\workspace-hifi\
  set QT_CMAKE_PREFIX_PATH=c:\Qt\Qt5.6.1\5.6\android_armv7\lib\cmake\
  set QT_CMAKE_PREFIX_PATH_ANDROID=c:\Qt\Qt5.6.1\5.6\android_armv7\lib\cmake\
  set SCRIBE_PATH=c:\Users\user\dev\workspace-hifi\hifi\tools\scribe\build\Debug\

  setx ANDROID_HOME %ANDROID_HOME%
  setx ANDROID_NDK %ANDROID_NDK%
  setx NDK_HOME %ANDROID_NDK%
  setx ANDROID_NDK_ROOT %ANDROID_NDK%
  setx ANDROID_LIB_DIR %ANDROID_LIB_DIR%
  setx QT_CMAKE_PREFIX_PATH %QT_CMAKE_PREFIX_PATH%
  setx SCRIBE_PATH %SCRIBE_PATH%

  :: Be sure to have the Path environment variable correctly set up
  :: With at least the following:
  ::
  :: JDK 8 
  :: e.g. c:\Program Files\Java\jdk1.8.0_101\bin
  ::
  :: ant
  :: C:\Users\user\dev\bin\apache-ant-1.9.4\bin
  ::
  :: cmake
  :: C:\Users\user\dev\bin\cmake-3.3.2-win32-x86\bin
  ::
  :: git 
  :: e.g. C:\Program Files\Git\cmd
  ::
  :: make for Windows
  :: c:\Program Files (x86)\GnuWin32\bin
  ::
  :: cp.bat
  :: c:\whereveryouputit
  ::
  ```

  replacerx.bat (replaces a string in a file and outputs) - **must be in PATH to make fixscribeinmakes.bat work**
  ```
  @echo off
  REM -- Prepare the Command Processor --
  SETLOCAL ENABLEEXTENSIONS
  SETLOCAL DISABLEDELAYEDEXPANSION

  ::BatchSubstitude - parses a File line by line and replaces a substring"
  ::syntax: BatchSubstitude.bat OldStr NewStr File
  ::          OldStr [in] - string to be replaced
  ::          NewStr [in] - string to replace with
  ::          File   [in] - file to be parsed
  :$changed 20100115
  :$source http://www.dostips.com
  if "%~1"=="" findstr "^::" "%~f0"&GOTO:EOF
  for /f "tokens=1,* delims=]" %%A in ('"type %3|find /n /v """') do (
      set "line=%%B"
      if defined line (
          call set "line=echo.%%line:%~1=%~2%%"
          for /f "delims=" %%X in ('"echo."%%line%%""') do %%~X
      ) ELSE echo.
  )
  ```

  fixscribeinmakes.bat (edit first! predefined files use .. and is not working on cmd)
  ```
  @echo off

  REM ****************************************
  REM 1 replacerx.bat in path

  REM ****************************************
  REM 2 locate all needed to change files:
  REM C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries\display-plugins\CMakeFiles\display-plugins.dir\build.make:
  REM C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries\entities-renderer\CMakeFiles\entities-renderer.dir\build.make:
  REM C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries\gpu\CMakeFiles\gpu.dir\build.make:
  REM C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries\model\CMakeFiles\model.dir\build.make:
  REM C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries\procedural\CMakeFiles\procedural.dir\build.make:
  REM C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries\render\CMakeFiles\render.dir\build.make:
  REM C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries\render-utils\CMakeFiles\render-utils.dir\build.make:

  REM ****************************************
  REM 3 detect what to replace
  REM result:
  REM ../../../tools/scribe/build/Debug/scribe.exe
  SET FIX_SCRIBE_OLD=../../../tools/scribe/build/Debug/scribe.exe

  REM ****************************************
  REM 4 detect what for
  REM result:
  REM c:/Users/user/dev/workspace-hifi/hifi/tools/scribe/build/Debug/scribe.exe
  SET FIX_SCRIBE_NEW=c:/Users/user/dev/workspace-hifi/hifi/tools/scribe/build/Debug/scribe.exe

  REM ****************************************
  REM 5 go to libraries folder
  cd  C:\Users\user\dev\workspace-hifi\hifi\build-android-interface\libraries
  echo "in %cd%"

  REM ****************************************
  REM 6 run for each
  cd "display-plugins\CMakeFiles\display-plugins.dir"
  echo "in %cd%"
  erase build.makexx
  call replacerx %FIX_SCRIBE_OLD% %FIX_SCRIBE_NEW% build.make > build.makexx
  erase build.make
  move build.makexx build.make
  cd ..\..\..
  echo "in %cd%"

  REM ****************************************
  REM run for each
  cd "entities-renderer\CMakeFiles\entities-renderer.dir"
  echo "in %cd%"
  erase build.makexx
  call replacerx %FIX_SCRIBE_OLD% %FIX_SCRIBE_NEW% build.make > build.makexx
  erase build.make
  move build.makexx build.make
  cd ..\..\..
  echo "in %cd%"

  REM ****************************************
  REM run for each
  cd "gpu\CMakeFiles\gpu.dir"
  echo "in %cd%"
  erase build.makexx
  call replacerx %FIX_SCRIBE_OLD% %FIX_SCRIBE_NEW% build.make > build.makexx
  erase build.make
  move build.makexx build.make
  cd ..\..\..
  echo "in %cd%"

  REM ****************************************
  REM run for each
  cd "model\CMakeFiles\model.dir"
  echo "in %cd%"
  erase build.makexx
  call replacerx %FIX_SCRIBE_OLD% %FIX_SCRIBE_NEW% build.make > build.makexx
  erase build.make
  move build.makexx build.make
  cd ..\..\..
  echo "in %cd%"

  REM ****************************************
  REM run for each
  cd "procedural\CMakeFiles\procedural.dir"
  echo "in %cd%"
  erase build.makexx
  call replacerx %FIX_SCRIBE_OLD% %FIX_SCRIBE_NEW% build.make > build.makexx
  erase build.make
  move build.makexx build.make
  cd ..\..\..
  echo "in %cd%"

  REM ****************************************
  REM run for each
  cd "render\CMakeFiles\render.dir"
  echo "in %cd%"
  erase build.makexx
  call replacerx %FIX_SCRIBE_OLD% %FIX_SCRIBE_NEW% build.make > build.makexx
  erase build.make
  move build.makexx build.make
  cd ..\..\..
  echo "in %cd%"

  REM ****************************************
  REM run for each
  cd "render-utils\CMakeFiles\render-utils.dir"
  echo "in %cd%"
  erase build.makexx
  call replacerx %FIX_SCRIBE_OLD% %FIX_SCRIBE_NEW% build.make > build.makexx
  erase build.make
  move build.makexx build.make
  cd ..\..\..
  echo "in %cd%"
  ```
  
build_android.bat (not needed in path, but it is recommended to be one level outside the cloned hifi folder) Edit it for correct folder paths!
```
:: Script to build android interface in windows development environment
@ECHO OFF
RMDIR /S /Q hifi\build-android
MKDIR hifi\build-android
CD hifi\build-android
SET QT_CMAKE_PREFIX_PATH=%QT_CMAKE_PREFIX_PATH_ANDROID%
ECHO QT_CMAKE_PREFIX_PATH=%QT_CMAKE_PREFIX_PATH%
java -version
cmake -G "Unix Makefiles" -DUSE_NSIGHT=0 -DUSE_ANDROID_TOOLCHAIN=1 -DANDROID_QT_CMAKE_PREFIX_PATH=%QT_CMAKE_PREFIX_PATH% ..
IF %ERRORLEVEL% NEQ 0 (
 ECHO Cmake failed
) ELSE (
 ECHO Cmake succeeded
 REM make interface-apk
)
cd .. 
ECHO ON
```

