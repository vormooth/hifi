print("here");

Controller.mousePressEvent.connect(function(event){
    print("HERE HERE -- mousePressEvent");
});

Controller.mouseDoublePressEvent.connect(function(event){
    print("HERE HERE -- mouseDoublePressEvent");
});

Controller.mouseMoveEvent.connect(function(event){
    print("HERE HERE -- mouseMoveEvent");
});

Controller.mouseReleaseEvent.connect(function(event){
    print("HERE HERE -- mouseReleaseEvent");
});

Controller.keyPressEvent.connect(function(event){
    print("keyPressEvent");
});

Controller.keyReleaseEvent.connect(function(event){
    print("keyReleaseEvent");
});

Controller.touchBeginEvent.connect(function(event){
    print("HERE HERE -- touchBeginEvent");
});

var DOUBLE_TAP_TIME = 500;
var fakeDoubleTapStart = Date.now();
var touchEndCount = 0;
Controller.touchEndEvent.connect(function(event){
    print("HERE HERE -- touchEndEvent ... touchEndCount:" + touchEndCount);
    
    // if this is our first "up" then record time so we can
    // later determine if second "up" is a double tap
    if (touchEndCount == 0) {
        fakeDoubleTapStart = Date.now();
    }
    touchEndCount++;
    
    if (touchEndCount >= 2) {
        var fakeDoubleTapEnd = Date.now();
        var elapsed = fakeDoubleTapEnd - fakeDoubleTapStart;
        if (elapsed <= DOUBLE_TAP_TIME) {
            print("HERE HERE -- FAKE double tap event!!!");
        } else {
            print("HERE HERE -- too slow.... not a double tap");
        }

        touchEndCount = 0;
    }
});

Controller.touchUpdateEvent.connect(function(event){
    print("HERE HERE -- touchUpdateEvent");
});


