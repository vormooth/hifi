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

ColumnLayout {
    objectName: "ColumnLayout"
    z:100
    spacing: 1
    ListModel {
        id: friendModel
        ListElement {
            name: "Bill Smith"
            number: "555 3264"
        }
        ListElement {
            name: "John Brown"
            number: "555 8426"
        }
        ListElement {
            name: "Sam Wise"
            number: "555 0473"
        }
        ListElement {
            name: "Cristian Duarte"
            number: "555 1234"
        }
        ListElement {
            name: "Gabriel Calero"
            number: "555 2345"
        }
    }

    Component {
        id: friendDelegate
        Row {
            spacing: 1
            Text { 
                text: name
                font.family: "Helvetica"
                font.pointSize: 8
                color: "#0f10fb"
                MouseArea {
                    anchors.fill: parent
                    onClicked: console.log("friend row clicked")
                }
            }
            Text { 
                text: 'n:' + number
                font.family: "Helvetica"
                font.pointSize: 8

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
            model: friendModel
            delegate: friendDelegate
            spacing: 1
            //focus: true
            //boundsBehavior: Flickable.StopAtBounds
            MouseArea {
                anchors.fill: parent
                onClicked: console.log("Debug-1:" + pane.scrollHeight)
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
            model: friendModel
            delegate: friendDelegate
            spacing: 1
            //focus: true
            //boundsBehavior: Flickable.StopAtBounds
            MouseArea {
                anchors.fill: parent
                propagateComposedEvents: false
            }
        }

    }

    Component.onCompleted: {
        console.log("Debug-1: loaded with height " + height);
        console.log("Debug-1: loaded with parent " + parent);
        
    }

}

