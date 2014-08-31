function getXdomain(data) {
    var xValues = [];
    for (category in data) {
        xValues = xValues.concat(data[category].data.map(function(d) {return d.x}));
    };
    return d3.extent(xValues);
}

function getYdomain(data) {
    var yValuesByX = {};
    for (category in data) {
        for (var i=0; i<data[category].data.length; i++) {
            var datapoint = data[category].data[i];
            if (datapoint.x in yValuesByX) {
                yValuesByX[datapoint.x].push(datapoint.y);
            } else {
                yValuesByX[datapoint.x] = [datapoint.y];
            }
        }
    }
    var ySums = [];
    for (x in yValuesByX) {
        ySums.push(yValuesByX[x].reduce(function(a, b) {return a+b}, 0));
    }
    //console.log(ySums);
    return [0, _.max(ySums)];
}

/* calculateLineMoveto
 * -------------------
 * This function will create a moveto line that curves from point
 * [startx, starty] to point [stopx, stopy]
 */
function calculateLineMoveto(startx, starty, stopx, stopy) {
    var s = startx + "," + starty + "C" + ((stopx + startx) / 2) + "," + starty + " " + ((stopx + startx) / 2) + "," + stopy + " " + stopx + "," + stopy;
    return s
}

/* iterateDraw
 * -----------
 * This function will iterate over an array of data points and
 * create a moveto curve that connects all the points.
 *
 *     data: array of points. Each point is an object with
 *         attributes "x", "y" and "h".
 *     canvasHeight: The height of the canvas on wich to draw.
 *         This is used to create the inverse-y. Pixels are
 *         counted up->down, but we want to draw down->up.
 *     pointLenght: The length of the ribbon at each x-value.
 *         If pointLength == 0, the ribbon will curve
 *         immediately to the next point.
 *     direction: String, eighter "lefttoright" or
 *         "righttoleft". This sets the orientation that is
 *         used to draw and is only used in applying the
 *         pointLenght. If pointLength would be 0, then this
 *         variable wouldn't matter.
 *     heightCompensation: Boolean. Set to true when you want
 *         the y value of the curve to equal datapoint.y +
 *         datapoint.h.
 */
function iterateDraw(data, canvasHeight, pointLength, direction, heightCompensation) {
    var sublines = []
    for (var i=0;i<(data.length-1);i++) {
        if (direction == "lefttoright") {
            var x1 = data[i].x + (pointLength / 2);
            var x2 = data[i+1].x - (pointLength / 2);
        } else {
            var x1 = data[i].x - (pointLength / 2);
            var x2 = data[i+1].x + (pointLength / 2);
        }
        if (heightCompensation) {
            var y1 = canvasHeight - data[i].y - data[i].h;
            var y2 = canvasHeight - data[i+1].y - data[i+1].h;
        } else {
            var y1 = canvasHeight - data[i].y;
            var y2 = canvasHeight - data[i+1].y;
        }
        var subline = calculateLineMoveto(x1, y1, x2, y2);
        sublines.push(subline);
    }
    return sublines
}

/*
 * drawRibbon
 * ----------
 *  This function will draw a ribbon, based on a set of
 *  data points.
 *      data: array of points. Each point should be an
 *          object containing the attributes "x", "y"
 *          and "h".
 *      canvasHeight: The height of the canvas on wich to draw.
 *         This is used to create the inverse-y. Pixels are
 *         counted up->down, but we want to draw down->up.
 *     pointLenght: The length of the ribbon at each x-value.
 *         If pointLength == 0, the ribbon will curve
 *         immediately to the next point.
 */
function drawRibbon(data, canvasHeight, pointLength) {
    // Define top line: goes from left to right
    var subLines = [];

    // set first point: bottom left
    var leftx = data[0].x - (pointLength / 2);
    var lefty = canvasHeight - data[0].y;
    subLines.push("" + leftx + "," + lefty);

    // iterate for top line
    var tmpsubLines = iterateDraw(data, canvasHeight, pointLength, "lefttoright", true);
    subLines = subLines.concat(tmpsubLines);


    // Define bottom line: goes from right to left
    data.reverse();
    tmpsubLines = iterateDraw(data, canvasHeight, pointLength, "righttoleft", false);
    subLines = subLines.concat(tmpsubLines);
    var curves = subLines.join("L");
    var moveto = "M" + curves;
    return moveto
}

/*
 * convertToSankeyData
 * -------------------
 *  This function will read in data in this form:
 *  data = {
 *      "category": {
 *          "data": [
 *              {"x": 0, "y": 20},
 *              {"x": 10, "y": 10}
 *          ],
 *          "color": ""
 *      }
 *  }
 *  The goal is to vizualize each category as a ribbon where
 *  at each x, the height of the ribbon is y. Furthermore,
 *  the position of the ribbons is determined at each x by
 *  the y value. The ribbon with the highest y value is drawn
 *  on top of the others. Therefore, this function will
 *  determine which category has the highest y value at each
 *  x and calculate the vertical position of the ribbon at
 *  each x. The original y value is now considered the h
 *  value (height of the ribbon) while the vertical position
 *  of the ribbon is the y value. The output looks like:
 *  data = {
 *      "category": {
 *          "data": [
 *              {"x": 0, "y": 0, "h": 20},
 *              {"x": 10, "y": 0, "h": 10}
 *          ],
 *          "color": ""
 *      }
 *  }
 *
 * Arguments:
 *     data: The input data, in the format described above
 *     xScale: a d3 scale to convert x-values to the
 *         available pixel space
 *     yScale: a d3 scale to convert y-values to the
 *         available pixel space
 */
function convertToSankeyData(data, xScale, yScale) {
    var xValues = [];

    // fetch all unique x values
    for (var category in data) {
        var tmpXVals = data[category].data.map(function(d) {return d.x});
        xValues = xValues.concat(tmpXVals);
    }
    xValues = _.uniq(xValues);

    // order data by x-value
    var outData = {}
    _.each(xValues, function(x) {
        var pointsAtX = [];
        for (var category in data) {
            var dataYatX = "";
            for (var i=0; i<data[category].data.length; i++) {
                if (data[category].data[i].x == x) {
                    dataYatX = data[category].data[i].y;
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
                outData[point[0]].data.push({"x": xScale(x), "y": yScale(currenty), "h": yScale(point[1])});
            } else {
                    //"color": data[point[0]].color
                outData[point[0]] = {
                    "data": [{"x": xScale(x), "y": yScale(currenty), "h": yScale(point[1])}],
                    "color": data[point[0]].color
                };
            }
            currenty += point[1];
        }

    });
    return outData;
}
