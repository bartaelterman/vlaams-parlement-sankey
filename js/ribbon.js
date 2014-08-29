function calculateLineMoveto(startx, starty, stopx, stopy) {
    var s = startx + "," + starty + "C" + ((stopx + startx) / 2) + "," + starty + " " + ((stopx + startx) / 2) + "," + stopy + " " + stopx + "," + stopy;
    return s
}

function drawRibbon(data, canvasHeight, pointLength) {
    // Define top line: goes from left to right
    var topSubLines = [];
    var leftx = data[0].x - (pointLength / 2);
    var lefty = canvasHeight - data[0].y;
    topSubLines.push("" + leftx + "," + lefty);
    for (var i=0;i<(data.length-1);i++) {
        var leftx = data[i].x + (pointLength / 2);
        var lefty = canvasHeight - data[i].y - data[i].h;
        var rightx = data[i+1].x - (pointLength / 2);
        var righty = canvasHeight - data[i+1].y - data[i+1].h;
        var subline = calculateLineMoveto(leftx, lefty, rightx, righty);
        topSubLines.push(subline);
    }

    // Define bottom line: goes from right to left
    var bottomSubLines = [];
    for (var i=0;i<(data.length-1);i++) {
        var rightx = data[data.length-i-1].x - (pointLength / 2);
        var righty = canvasHeight - data[data.length-i-1].y;
        var leftx = data[data.length-i-2].x + (pointLength / 2);
        var lefty = canvasHeight - data[data.length-i-2].y;
        var subline = calculateLineMoveto(rightx, righty, leftx, lefty);
        bottomSubLines.push(subline);
    }

    var topLineMoveto = topSubLines.join("L");
    var botLineMoveto = bottomSubLines.join("L");

    var moveto = "M" + topLineMoveto + "L" + botLineMoveto;
    return moveto
}

function convertToSankeyData(data, xScale, yScale) {
    var xValues = [];

    // fetch all unique x values
    for (var category in data) {
        var tmpXVals = data[category].map(function(d) {return d.x});
        xValues = xValues.concat(tmpXVals);
    }
    xValues = _.uniq(xValues);

    // order data by x-value
    var outData = {}
    _.each(xValues, function(x) {
        var pointsAtX = [];
        for (var category in data) {
            var dataYatX = "";
            for (var i=0; i<data[category].length; i++) {
                if (data[category][i].x == x) {
                    dataYatX = data[category][i].y;
                }
            }
            if (dataYatX == "") {
                dataYatX = 0;
            }
            pointsAtX.push([category, dataYatX]);
        }

        // sort by x-value
        var sortedPointsAtX = pointsAtX.sort(function(a,b) {return a[1] > b[1]});
        var currenty = 0;
        for (var i=0; i<sortedPointsAtX.length; i++) {
            var point = sortedPointsAtX[i];
            if (point[0] in outData) {
                outData[point[0]].push({"x": xScale(x), "y": yScale(currenty), "h": yScale(point[1])});
            } else {
                outData[point[0]] = [{"x": xScale(x), "y": yScale(currenty), "h": yScale(point[1])}];
            }
            currenty += point[1];
        }

    });
    return outData;
}
