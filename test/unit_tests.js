test("Convert elections data to ribbon data", function() {

    var testdata = {
        "party1": {
            "data": [
                {"x": 1997, "y": 15},
                {"x": 2001, "y": 30}
            ],
            "color": "#000"
        },
        "party2": {
            "data": [
                {"x": 1997, "y": 30},
                {"x": 2001, "y": 20}
            ],
            "color": "#000"
        }
    };

    var resultingData = {
        "party1": {
            "data": [
                {"x": 1997, "y": 0, "h": 15},
                {"x": 2001, "y": 20, "h": 30}
            ],
            "color": "#000"
        },
        "party2": {
            "data": [
                {"x": 1997, "y": 15, "h": 30},
                {"x": 2001, "y": 0, "h": 20}
            ],
            "color": "#000"
        }
    };


    var xScale = function(x) {return x;};
    var yScale = function(x) {return x;};

    var res = convertToSankeyData(testdata, xScale, yScale);

    deepEqual(res, resultingData);
});


test("Generate moveto line for ribbon", function() {
    var canvasHeight = 100;
    var pointLength = 0;
    var data = [
            {"x": 0, "y": 10, "h": 10},
            {"x": 50, "y": 20, "h": 20},
            {"x": 100, "y": 00, "h": 10}
    ];

    var expectedMoveto = "M0,90L0,80C25,80 25,60 50,60L50,60C75,60 75,90 100,90L100,100C75,100 75,80 50,80L50,80C25,80 25,90 0,90";
    var moveto = drawRibbon(data, canvasHeight, pointLength);
    deepEqual(moveto, expectedMoveto);
});

test("Get domains from data", function() {
    var testdata = {
        "party1": {
            "data": [
                {"x": 1997, "y": 15},
                {"x": 2001, "y": 30}
            ],
            "color": "#000"
        },
        "party2": {
            "data": [
                {"x": 1997, "y": 30},
                {"x": 2004, "y": 20}
            ],
            "color": "#000"
        }
    };

    var xexpected = [1997, 2004];
    var xresult = getXdomain(testdata);
    deepEqual(xresult, xexpected);
    var yexpected = [0, 45];
    var yresult = getYdomain(testdata);
    deepEqual(yresult, yexpected);
});
