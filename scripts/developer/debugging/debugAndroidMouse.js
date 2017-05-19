print("here");

Controller.mousePressEvent.connect(function(event){
    print("mousePressEvent");
});

Controller.mouseDoublePressEvent.connect(function(event){
    print("mouseDoublePressEvent");
});

Controller.mouseMoveEvent.connect(function(event){
    print("mouseMoveEvent");
});

Controller.mouseReleaseEvent.connect(function(event){
    print("mouseReleaseEvent");
});

Controller.keyPressEvent.connect(function(event){
    print("keyPressEvent");
});

Controller.keyReleaseEvent.connect(function(event){
    print("keyReleaseEvent");
});

Controller.touchBeginEvent.connect(function(event){
    print("touchBeginEvent");
});

Controller.touchEndEvent.connect(function(event){
    print("touchEndEvent");
});

Controller.touchUpdateEvent.connect(function(event){
    print("touchUpdateEvent");
});


