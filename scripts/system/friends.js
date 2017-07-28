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

function fromQml(message) { // messages are {method, params}, like json-rpc. See also sendToQml.
    var data;
    switch (message.method) {
    case 'loadFriends':
        populateUserList();
        break;
    default:
        print('[friends.js] Unrecognized message from Friends.qml:', JSON.stringify(message));
    }
}

function startup() {
    tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    tablet.fromQml.connect(fromQml);
}

startup();

function mousePressOrTouchEnd(event) {
//    print("[friends.js] mousePressOrTouchEnd");
}

function touchEnd(event) {
//    print("[friends.js] touchEnd");
}

function touchUpdate(event) {
//    print("[friends.js] touchUpdate");
}

var button;
var friendsQmlSource = "Friends.qml";

function populateUserList() {
    var nearbyFriends = [], onlineFriends = [], avatars = AvatarList.getAvatarIdentifiers();
    var myPosition = Camera.position;

    avatars.forEach(function (id) {
        var avatar = AvatarList.getAvatar(id);
        var name = avatar.sessionDisplayName;

        if (!name) {
            return;
        }

        var avatarDatum = {
            displayName: name,
            sessionId: id || '',
            position: avatar.position,
            distance: Vec3.distance(avatar.position, myPosition)
        };
    
        var distance = Settings.getValue('friends/nearDistance');
        if (myPosition && (Vec3.distance(avatar.position, myPosition) <= distance)) {
            nearbyFriends.push(avatarDatum);
        } else {
            onlineFriends.push(avatarDatum);
        }
    });

    sendToQml({ method: 'friends', params: { nearby: nearbyFriends, online: onlineFriends} });

}

function sendToQml(message) {
    tablet.sendToQml(message);
}




function onClicked() {
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
