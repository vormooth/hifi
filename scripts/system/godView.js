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
var GOD_VIEW_HEIGHT = 30; // meters above the ground
var ABOVE_GROUND_DROP = 2;
var MOVE_BY = 1;

function moveTo(position) {
    if (godView) {
        MyAvatar.position = position;
        Camera.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_CAMERA_OFFSET, z: 0});
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
    if (godView) {
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

var DOUBLE_TAP_TIME = 200;
var fakeDoubleTapStart = Date.now();
var touchEndCount = 0;
function touchEnd(event) {
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


function startGodView() {
    print("[godView.js] -- startGodView");
    Camera.mode = "first person";
    MyAvatar.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_VIEW_HEIGHT, z: 0});
    Camera.mode = "independent";
    Camera.position = Vec3.sum(MyAvatar.position, {x:0, y: GOD_CAMERA_OFFSET, z: 0});
    Camera.orientation = Quat.fromPitchYawRollDegrees(-90,0,0);
    godView = true;
}

function endGodView() {
    print("[godView.js] -- endGodView");
    Camera.mode = "first person";
    MyAvatar.position = Vec3.sum(MyAvatar.position, {x:0, y: (-1 * GOD_VIEW_HEIGHT) + ABOVE_GROUND_DROP, z: 0});
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
