//
//  Friends.qml
//  interface/resources/qml/tablet
//
//  Created by Gabriel Calero & Cristian Duarte on 24 Jul 2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import QtQuick 2.5
import QtQuick.Controls 1.4
import QtQuick.Layouts 1.3
import Qt.labs.settings 1.0

ColumnLayout {
    objectName: "ColumnLayout"
    z:100
    spacing: 1
    Settings {
        id: settings
        category: 'friends'
        property int nearDistance: 30
    }

    ListModel {
        id: friendsNearbyModel
    }

    ListModel {
        id: friendsOnlineModel
    }

    Component {
        id: friendDelegate
        Row {
            spacing: 1
            Text { 
                text: displayName + "(" + distance + ")"
                font.family: "Helvetica"
                font.pointSize: 8
                color: "#0f10fb"
                MouseArea {
                    anchors.fill: parent
                    // onClicked: console.log("friend row clicked")
                }
            }

        }
    }

    Text {
        objectName: "friendshereLabel"
        text: "Friends here"
        color: "green"
        font.family: "Helvetica"
        font.pointSize: 8
    }
    ScrollView {
        objectName: "scrollview-1"
       ListView {
            id: friendsHereList
            height: 200
            model: friendsNearbyModel
            delegate: friendDelegate
            spacing: 1
            MouseArea {
                anchors.fill: parent
                //onClicked: sendToScript({method: 'loadFriends', params: {}})
            }
        }
    }

    Text {
        objectName: "friendsonlineLabel"
        text: "Friends online"
        color: "green"
        font.family: "Helvetica"
        font.pointSize: 8
    }
    ScrollView {
        objectName: "scrollview-2"
        id: friendsOnline
        ListView {
            height: 200
            model: friendsOnlineModel
            delegate: friendDelegate
            spacing: 1
            MouseArea {
                anchors.fill: parent
                propagateComposedEvents: false
            }
        }

    }

    function loadNearbyFriend(f) {
        friendsNearbyModel.append (f);
    }

    function loadOnlineFriend(f) {
        friendsOnlineModel.append (f);
    }

    function loadFriends(data) {
        if (data && data.nearby) {
            data.nearby.forEach(function (friend) {
                loadNearbyFriend(friend);
            });
        }
        if (data && data.online) {
            data.online.forEach(function (friend) {
                loadOnlineFriend(friend);
            });        
        }
    }

    function fromScript(message) {
        switch (message.method) {
        case "friends":
            var data = message.params;
            loadFriends(data);
            break;
        default:
            console.log('Unrecognized message:', JSON.stringify(message));
        }

    }
    signal sendToScript(var message);

    // called after onLoaded
    function init() {
        sendToScript({method: 'loadFriends', params: {}});
    }

}

