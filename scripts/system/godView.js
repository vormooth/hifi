"use strict";
//
//  hmd.js
//  scripts/system/
//
//  Created by Howard Stearns on 2 Jun 2016
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals HMD, Script, Menu, Tablet, Camera */
/* eslint indent: ["error", 4, { "outerIIFEBody": 0 }] */

print("[godView.js] outside scope");

(function() { // BEGIN LOCAL_SCOPE

print("[godView.js] local scope");

var godView = false;

var GOD_CAMERA_OFFSET = -1; // 1 meter below the avatar
var GOD_VIEW_HEIGHT = 30; // meters above the avatar
var ABOVE_GROUND_DROP = 2;
var MOVE_BY = 1;

// Swipe/Drag vars
var PINCH_INCREMENT = 0.4; // 0.1 meters zoom in - out
var GOD_VIEW_HEIGHT_MAX_PLUS_AVATAR = 100;
var GOD_VIEW_HEIGHT_MIN_PLUS_AVATAR = 2;
var lastDragAt;
var lastDeltaDrag;

function moveTo(position) {
    if (godView) {
        MyAvatar.position = position;
        //Camera.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_CAMERA_OFFSET, z: 0});
        Camera.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_VIEW_HEIGHT, z: 0});
    } else {
        MyAvatar.position = position;
    }
}

function keyPressEvent(event) {
    //print(event.text);
    if (godView) {
        switch(event.text) {
            case "UP":
                moveTo(Vec3.sum(MyAvatar.position, {x:0.0, y: 0, z: -1 * MOVE_BY}));
                break;
            case "DOWN":
                moveTo(Vec3.sum(MyAvatar.position, {x:0, y: 0, z: MOVE_BY}));
                break;
            case "LEFT":
                moveTo(Vec3.sum(MyAvatar.position, {x:-1 * MOVE_BY, y: 0, z: 0}));
                break;
            case "RIGHT":
                moveTo(Vec3.sum(MyAvatar.position, {x:MOVE_BY, y: 0, z: 0}));
                break;
        }
    }
}

// App.isAndroid()

function mousePressOrTouchEnd(event) {
    if (!currentTouchIsValid) {
        return;
    }
    if (godView) {
        // TODO remove this return; and enable the feature to move again
        return;
        print("[godView.js] -- mousePressOrTouchEnd in godView");
        print("[godView.js] -- event.x, event.y:", event.x, ",", event.y);
        var pickRay = Camera.computePickRay(event.x, event.y);

        print("[godView.js] -- pr.o:", pickRay.origin.x, ",", pickRay.origin.y, ",", pickRay.origin.z);
        print("[godView.js] -- pr.d:", pickRay.direction.x, ",", pickRay.direction.y, ",", pickRay.direction.z);
        print("[godView.js] -- c.p:", Camera.position.x, ",", Camera.position.y, ",", Camera.position.z);

        var pointingAt = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction,GOD_VIEW_HEIGHT));

        print("[godView.js] -- pointing at:", pointingAt.x, ",", pointingAt.y, ",", pointingAt.z);

        var moveToPosition = { x: pointingAt.x, y: MyAvatar.position.y, z: pointingAt.z };

        print("[godView.js] -- moveToPosition:", moveToPosition.x, ",", moveToPosition.y, ",", moveToPosition.z);

        moveTo(moveToPosition);
    }
}

function toggleGodViewMode() {
    print("[godView.js] -- toggleGodViewMode");
    if (godView) {
        endGodView();
    } else {
        startGodView();
    }
}

function fakeDoubleTap() {
    toggleGodViewMode();
}

var currentTouchIsValid = false;
var DOUBLE_TAP_TIME = 200;
var fakeDoubleTapStart = Date.now();
var touchEndCount = 0;
function touchEnd(event) {
    lastDragAt = null;
    lastDeltaDrag = null;
    if (event.isPinching) return;
    if (event.isMoved) return;
    if (!currentTouchIsValid) return;

    print("[godView.js] -- touchEndEvent ... touchEndCount:" + touchEndCount);
    var fakeDoubleTapEnd = Date.now();
    print("[godView.js] -- fakeDoubleTapEnd:" + fakeDoubleTapEnd);
    var elapsed = fakeDoubleTapEnd - fakeDoubleTapStart;
    print("[godView.js] -- elapsed:" + elapsed);
    if (elapsed > DOUBLE_TAP_TIME) {
        print("[godView.js] -- elapsed:" + elapsed + " to long for double tap, resetting!");
        touchEndCount = 0;
    }
    
    // if this is our first "up" then record time so we can
    // later determine if second "up" is a double tap
    if (touchEndCount == 0) {
        fakeDoubleTapStart = Date.now();
        print("[godView.js] -- starting out as a first click... fakeDoubleTapStart:" + fakeDoubleTapStart);
    }
    touchEndCount++;
    
    if (touchEndCount >= 2) {
        var fakeDoubleTapEnd = Date.now();
        print("[godView.js] -- fakeDoubleTapEnd:" + fakeDoubleTapEnd);
        var elapsed = fakeDoubleTapEnd - fakeDoubleTapStart;
        print("[godView.js] -- elapsed:" + elapsed);
        if (elapsed <= DOUBLE_TAP_TIME) {
            print("[godView.js] -- FAKE double tap event!!!  elapsed:" + elapsed);

            touchEndCount = 0;
            fakeDoubleTap();
            return; // don't do the normal touch end processing
        } else {
            print("[godView.js] -- too slow.... not a double tap elapsed:" + elapsed);
        }

        touchEndCount = 0;
    }
    mousePressOrTouchEnd(event);
}

if (!Math.sign) {
  Math.sign = function(x) {
    // If x is NaN, the result is NaN.
    // If x is -0, the result is -0.
    // If x is +0, the result is +0.
    // If x is negative and not -0, the result is -1.
    // If x is positive and not +0, the result is +1.
    x = +x; // convert to a number
    if (x === 0 || isNaN(x)) {
      return Number(x);
    }
    return x > 0 ? 1 : -1;
  };
}

function touchBegin(event) {
  if (tablet.getItemAtPoint({ x: event.x, y: event.y }) ) {
    currentTouchIsValid = false;
  } else {
    currentTouchIsValid = true;

  }
}

function touchUpdate(event) {
    if (!currentTouchIsValid) {
        // avoid moving and zooming when tap is over UI entities
        return;
    }
    if (event.isPinching || event.isPinchOpening) {
        print("touchUpdate HERE - " + "isPinching");
        if (event.isMoved) {
            // pinch management
            var avatarY = MyAvatar.position.y;
            if (event.isPinching) {
                if (GOD_VIEW_HEIGHT + PINCH_INCREMENT > GOD_VIEW_HEIGHT_MAX_PLUS_AVATAR + avatarY) {
                    GOD_VIEW_HEIGHT = GOD_VIEW_HEIGHT_MAX_PLUS_AVATAR + avatarY;
                } else {
                    GOD_VIEW_HEIGHT = GOD_VIEW_HEIGHT + PINCH_INCREMENT;
                }
            }
            if (event.isPinchOpening) {
                if (GOD_VIEW_HEIGHT - PINCH_INCREMENT < GOD_VIEW_HEIGHT_MIN_PLUS_AVATAR + avatarY) {
                    GOD_VIEW_HEIGHT = GOD_VIEW_HEIGHT_MIN_PLUS_AVATAR + avatarY;
                } else {
                    GOD_VIEW_HEIGHT = GOD_VIEW_HEIGHT - PINCH_INCREMENT;
                }
            }
            Camera.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_VIEW_HEIGHT, z: 0});
        }
    } else {
        if (event.isMoved) {
            print("touchUpdate HERE - " + "isMoved --------------------");
            // drag management?
            //event.x
            var pickRay = Camera.computePickRay(event.x, event.y);
            var dragAt = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, GOD_VIEW_HEIGHT));

            print("touchUpdate HERE - " + " pickRay.direction " + JSON.stringify(pickRay.direction));

            if (lastDragAt === undefined || lastDragAt === null) {
                lastDragAt = dragAt;
                // TODO CLEANUP WHEN RELEASING
            } else {
                print("touchUpdate HERE - " + " event " + event.x + " x " + event.y);
                print("touchUpdate HERE - " + " lastDragAt " + JSON.stringify(lastDragAt));
                print("touchUpdate HERE - " + " dragAt " + JSON.stringify(dragAt));

                var deltaDrag = {x: (lastDragAt.x - dragAt.x), y: 0, z: (lastDragAt.z-dragAt.z)};

                lastDragAt = dragAt;
                if (lastDeltaDrag === undefined || lastDeltaDrag === null) {
                    lastDeltaDrag = deltaDrag;
                    return;
                }

                if (Math.sign(deltaDrag.x) == Math.sign(lastDeltaDrag.x) && Math.sign(deltaDrag.z) == Math.sign(lastDeltaDrag.z)) {
                    // Process movement if direction of the movement is the same than the previous frame

                    // process delta
                    var moveCameraTo = Vec3.sum(Camera.position, deltaDrag);
                    print("touchUpdate HERE - " + " x diff " + (lastDragAt.x - dragAt.x));
                    print("touchUpdate HERE - " + " moveCameraFrom " + JSON.stringify(Camera.position));
                    print("touchUpdate HERE - " + " moveCameraTo " + JSON.stringify(moveCameraTo));
                    // move camera
                    Camera.position = moveCameraTo;
                } else {
                    // Do not move camera if it's changing direction in this case, wait until the next direction confirmation..
                }
                lastDeltaDrag = deltaDrag;
                // save last
            }
        }
    }
}

function startGodView() {
    print("[godView.js] -- startGodView");
    // Do not move the avatar when going to GodView, only the camera.
    //Camera.mode = "first person";
    //MyAvatar.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_VIEW_HEIGHT, z: 0});
    Camera.mode = "independent";
    // Camera position height used the GOD_VIEW_HEIGHT
    //Camera.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_CAMERA_OFFSET, z: 0});
    Camera.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_VIEW_HEIGHT, z: 0});
    Camera.orientation = Quat.fromPitchYawRollDegrees(-90,0,0);
    godView = true;
}

function endGodView() {
    print("[godView.js] -- endGodView");
    Camera.mode = "first person";
    // Just go to first person mode
    // MyAvatar.position = Vec3.sum(MyAvatar.position, {x:0, y: (-1 * GOD_VIEW_HEIGHT) + ABOVE_GROUND_DROP, z: 0});
    godView = false;
}

var button;
var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

function onClicked() {
    toggleGodViewMode();
}

button = tablet.addButton({
    icon: "icons/tablet-icons/switch-desk-i.svg", // FIXME - use correct icon
    text: "God View",
    sortOrder: 2
});

button.clicked.connect(onClicked);
Controller.keyPressEvent.connect(keyPressEvent);
Controller.mousePressEvent.connect(mousePressOrTouchEnd);
Controller.touchEndEvent.connect(touchEnd);

Controller.touchUpdateEvent.connect(touchUpdate);
Controller.touchBeginEvent.connect(touchBegin);


Script.scriptEnding.connect(function () {
    if (godView) {
        endGodView();
    }
    button.clicked.disconnect(onClicked);
    if (tablet) {
        tablet.removeButton(button);
    }
    Controller.keyPressEvent.disconnect(keyPressEvent);
    Controller.mousePressEvent.disconnect(mousePressOrTouchEnd);
    Controller.touchEndEvent.disconnect(mousePressOrTouchEnd);
});

}()); // END LOCAL_SCOPE
