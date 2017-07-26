"use strict";
//
//  friends.js
//  scripts/system/
//
//  Created by Gabriel Calero & Cristian Duarte on 24 Jul 2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


print("[friends.js]");

(function() {
    var tablet = null;

print("[friends.js] local scope");

function mousePressOrTouchEnd(event) {
    print("[friends.js] mousePressOrTouchEnd");
}

function touchEnd(event) {
    print("[friends.js] touchEnd");
}

function touchUpdate(event) {
    print("[friends.js] touchUpdate");
}

var button;
var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
var friendsQmlSource = "Friends.qml";

function onClicked() {
    print("[friends.js] onClicked");
    if (tablet) {
        tablet.loadQMLSource(friendsQmlSource);
    }
}

button = tablet.addButton({
    icon: "icons/tablet-icons/users-i.svg", // FIXME - use correct icon
    text: "Friends",
    sortOrder: 2
});

button.clicked.connect(onClicked);
//Controller.keyPressEvent.connect(keyPressEvent);
Controller.mousePressEvent.connect(mousePressOrTouchEnd);
Controller.touchEndEvent.connect(touchEnd);

Controller.touchUpdateEvent.connect(touchUpdate);


Script.scriptEnding.connect(function () {
    button.clicked.disconnect(onClicked);
    if (tablet) {
        tablet.removeButton(button);
    }
//    Controller.keyPressEvent.disconnect(keyPressEvent);
    Controller.mousePressEvent.disconnect(mousePressOrTouchEnd);
    Controller.touchEndEvent.disconnect(mousePressOrTouchEnd);
});

}()); // END LOCAL_SCOPE
