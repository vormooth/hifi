# 
#  ExtractGvrNdkLibs.cmake
# 
#  Created by Cristian Duarte on 03/29/17.
#  Copyright 2017 High Fidelity, Inc.
#
#  Distributed under the Apache License, Version 2.0.
#  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
# 
# Purpose:
# Extracts native libraries from an expected version of gvr source.
# 

# env
# HIFI_ANDROID_GVR	 	Env. variable name of a cloned gvr-android-sdk repository dir inside ANDROID_LIB_DIR.

# cmake vars
# GVR_VERSION			gvr version, e.g. if libraries/sdk-base-1.40.0.aar is to be used, value should be "1.40.0"
# GVR_HIFI_DIR_PREFIX	prefix for the uncompressed gvr folder
# GVR_LIBS				names without skd- prefix and -version.aar suffix.
#						e.g. if sdk-audio-1.40.0.aar and sdk-base-1.40.0.aar are needed, it sould be
#						"audio;base". Current version, FindGVR should handle these without help of this var.


macro (extract_gvr_ndk_libs)

#set (GVR_HIFI_DIR_PREFIX ".libs-for-hifi-")

if (NOT DEFINED ENV{HIFI_ANDROID_GVR})
	message( FATAL_ERROR "Environment variable HIFI_ANDROID_GVR should be set and gvr-android-sdk should be cloned there. (Inside ANDROID_LIB_DIR)")
endif()

if (NOT EXISTS "${ANDROID_LIB_DIR}/$ENV{HIFI_ANDROID_GVR}")
	message( FATAL_ERROR "${ANDROID_LIB_DIR}/$ENV{HIFI_ANDROID_GVR} not found. Clone https://github.com/googlevr/gvr-android-sdk and specify HIFI_ANDROID_GVR as the cloned directory")
endif()

if (NOT DEFINED GVR_VERSION)
	message( FATAL_ERROR "CMAKE variable GVR_VERSION should be set by current build. e.g. if libraries/sdk-base-1.40.0.aar is to be used, value should be 1.40.0")
endif()

# use base as a param to know if version is right
if (NOT EXISTS "${ANDROID_LIB_DIR}/$ENV{HIFI_ANDROID_GVR}/libraries/sdk-base-${GVR_VERSION}.aar")
	message( FATAL_ERROR "Gvr repository version is not ${GVR_VERSION}. Type in the gvr repo 'git tag -l' to get available versions and git fetch if necessary. Then switch branches to the right tag.")
endif()

set(GVR_HIFI_DIR "${ANDROID_LIB_DIR}/$ENV{HIFI_ANDROID_GVR}/${GVR_HIFI_DIR_PREFIX}${GVR_VERSION}")

if (NOT EXISTS "${GVR_HIFI_DIR}")
	file(MAKE_DIRECTORY "${GVR_HIFI_DIR}")
	#file(APPEND "${ANDROID_LIB_DIR}/$ENV{HIFI_ANDROID_GVR}/.gitignore" "\n# Hifi extracted\n${GVR_HIFI_DIR_PREFIX}${GVR_VERSION}\n")
endif()

##### Here comes the extract
foreach(GVR_SUB_LIB ${GVR_LIBS})

	set(_gvr_lib_output_dir "${GVR_HIFI_DIR}/sdk-${GVR_SUB_LIB}-${GVR_VERSION}")
	#message(STATUS "** dir to check ${_gvr_lib_output_dir}")
	if (NOT EXISTS ${_gvr_lib_output_dir})
		#message(STATUS "** dir to check ${_gvr_lib_output_dir} did not exist")
		file(MAKE_DIRECTORY ${_gvr_lib_output_dir})
		#message(STATUS "** dir to check ${_gvr_lib_output_dir} created")
		set (_command jar xf "${ANDROID_LIB_DIR}/$ENV{HIFI_ANDROID_GVR}/libraries/sdk-${GVR_SUB_LIB}-${GVR_VERSION}.aar")
		#message(STATUS "** dir to check ${_gvr_lib_output_dir} extracting with ${_command}")
		execute_process(COMMAND ${_command} WORKING_DIRECTORY ${_gvr_lib_output_dir})
		#message(STATUS "** dir to check ${_gvr_lib_output_dir} extracted?")
	elseif()
		#message(STATUS "** dir to check ${_gvr_lib_output_dir} already existed")
	endif()

endforeach(GVR_SUB_LIB)

endmacro(extract_gvr_ndk_libs)