## Build Scribe only

This section is intended to build scribe without having to build the entire HiFi project for Windows

## Binary

You can alternatively download an already [built scribe binary](https://drive.google.com/open?id=0BzVk5wZGx4Ztc0tpelgxdjF1dkU)

## Build it yourself

### Prerequisites

1. Visual Studio 12 2013
2. CMake 3.3.2

## Steps
1. Create a new file in tools\scribe\SetupHifiProject.cmake and paste this content.

````
#
#  SetupHifiProject.cmake
#
#  Copyright 2013 High Fidelity, Inc.
#
#  Distributed under the Apache License, Version 2.0.
#  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
#

macro(SETUP_HIFI_PROJECT)
  project(${TARGET_NAME})

  # grab the implemenation and header files
  file(GLOB TARGET_SRCS src/*)

  file(GLOB SRC_SUBDIRS RELATIVE ${CMAKE_CURRENT_SOURCE_DIR}/src ${CMAKE_CURRENT_SOURCE_DIR}/src/*)

  foreach(DIR ${SRC_SUBDIRS})
    if (IS_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/src/${DIR}")
      file(GLOB DIR_CONTENTS "src/${DIR}/*")
      set(TARGET_SRCS ${TARGET_SRCS} "${DIR_CONTENTS}")
    endif ()
  endforeach()

  add_executable(${TARGET_NAME} ${TARGET_SRCS} ${AUTOSCRIBE_SHADER_LIB_SRC})

  # include the generated application version header
  target_include_directories(${TARGET_NAME} PRIVATE "${CMAKE_BINARY_DIR}/includes")

  #set(${TARGET_NAME}_DEPENDENCY_QT_MODULES ${ARGN})
  #list(APPEND ${TARGET_NAME}_DEPENDENCY_QT_MODULES Core)

  # find these Qt modules and link them to our own target
  #find_package(Qt5 COMPONENTS ${${TARGET_NAME}_DEPENDENCY_QT_MODULES} REQUIRED)

  # disable /OPT:REF and /OPT:ICF for the Debug builds
  # This will prevent the following linker warnings
  # LINK : warning LNK4075: ignoring '/INCREMENTAL' due to '/OPT:ICF' specification
  if (WIN32)
     set_property(TARGET ${TARGET_NAME} APPEND_STRING PROPERTY LINK_FLAGS_DEBUG "/OPT:NOREF /OPT:NOICF")
  endif()

 # foreach(QT_MODULE ${${TARGET_NAME}_DEPENDENCY_QT_MODULES})
 #   target_link_libraries(${TARGET_NAME} Qt5::${QT_MODULE})
 # endforeach()

 # target_glm()

endmacro()
````
2. Modify the file tools\scribe\CMakeLists.txt so it looks like this
````
cmake_minimum_required(VERSION 3.3)
set(TARGET_NAME scribe)
include("SetupHifiProject.cmake")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
setup_hifi_project()
````
3. Create a build directory and run cmake
````
  cd tools\scribe
  mkdir build 
  cd build
  cmake ..
````
4. Build scribe

Check the path where Visual Studio 12 2013 is installed and run these lines

````
"c:\Program Files (x86)\Microsoft Visual Studio 12.0\VC\vcvarsall.bat" x64
MSBuild /nologo /t:Build scribe.vcxproj

````
At this point you should get scribe.exe inside the Debug folder. Move it to the path contained in %SCRIBE_PATH% or update the environment variable to point out the Debug folder


