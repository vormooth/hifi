# 
#  FindGVR.cmake
# 
#  Try to find the Google VR library to use Daydream
#
#  https://github.com/googlevr/gvr-android-sdk repository should be cloned in ANDROID_LIB_DIR
#
#  Once done this will define
#
#  GVR_FOUND - found gvr
#  GVR_INCLUDE_DIRS - the gvr include directory
#  GVR_LIBRARIES - Link this to use gvr
#
#  Created on 11/7/2016 by Cristian Duarte & Gabriel Calero
#  Copyright 2016 High Fidelity, Inc.
#
#  Distributed under the Apache License, Version 2.0.
#  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
# 

# env
# HIFI_ANDROID_GVR	 	Env. variable name of a cloned gvr-android-sdk repository dir inside ANDROID_LIB_DIR.
# cmake vars
# GVR_VERSION			gvr version, e.g. if libraries/sdk-base-1.40.0.aar is to be used, value should be "1.40.0"
# GVR_HIFI_DIR_PREFIX	prefix for the uncompressed gvr folder
# GVR_LIBS				names without skd- prefix and -version.aar suffix.
#						e.g. if sdk-audio-1.40.0.aar and sdk-base-1.40.0.aar are needed, it sould be
#						"audio;base" ** NOT USED HERE

include("${MACRO_DIR}/HifiLibrarySearchHints.cmake")
hifi_library_search_hints("$ENV{HIFI_ANDROID_GVR}")

# include
set(_GVR_HINTS_AND_PATHS "${GVR-ANDROID-SDK-UPD_SEARCH_DIRS}")
# message( STATUS "_GVR_HINTS_AND_PATHS ${_GVR_HINTS_AND_PATHS}")
find_path(GVR_INCLUDE_DIRS NAMES vr/gvr/capi/include/gvr_types.h PATH_SUFFIXES "libraries/headers" HINTS ${_GVR_HINTS_AND_PATHS})
# message( STATUS "GVR_INCLUDE_DIRS ${GVR_INCLUDE_DIRS}")

# lib
# TODO make the arch flexible
#message(STATUS "** Looking for: ${GVR_HIFI_DIR_PREFIX}${GVR_VERSION}/sdk-base-${GVR_VERSION}/jni/armeabi-v7a")
find_library(GVR_LIBRARY NAMES gvr PATH_SUFFIXES "${GVR_HIFI_DIR_PREFIX}${GVR_VERSION}/sdk-base-${GVR_VERSION}/jni/armeabi-v7a" HINTS ${_GVR_HINTS_AND_PATHS})
#message(STATUS "** RESULT: GVR_LIBRARY=${GVR_LIBRARY}")
find_library(GVR_AUDIO_LIBRARY NAMES gvr_audio PATH_SUFFIXES "${GVR_HIFI_DIR_PREFIX}${GVR_VERSION}/sdk-audio-${GVR_VERSION}/jni/armeabi-v7a" HINTS ${_GVR_HINTS_AND_PATHS})
set(GVR_LIBRARIES ${GVR_LIBRARY} ${GVR_AUDIO_LIBRARY})
# message( STATUS "GVR_LIBRARIES ${GVR_LIBRARIES}")

include(FindPackageHandleStandardArgs)
# handle the QUIETLY and REQUIRED arguments and set GVR_FOUND to TRUE
# if all listed variables are TRUE
find_package_handle_standard_args(GVR DEFAULT_MSG GVR_LIBRARIES GVR_INCLUDE_DIRS)

# message( STATUS "GVR_FOUND ${GVR_FOUND}")