/*get dom elements*/
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

const penBut = document.getElementById('penButton');
const eraseBut = document.getElementById('eraserButton');
const fillBut = document.getElementById('fillButton');
const lassoBut = document.getElementById('lasso');
const pickerBut = document.getElementById('picker');
const moveBut = document.getElementById('moveButton');
const colorChooser = document.getElementById('colorChooser');
const colorHistory = document.getElementById('colorHistory');
const downloadBut = document.getElementById('downloadButton');
const smallPenBut = document.getElementById('smallPenSize');
const mediumPenBut = document.getElementById('mediumPenSize');


const clearBut = document.getElementById('clearButton');

canvas.height = 600;
canvas.width = 600;

const nbRow = 30;
const nbCol = 30;
const cellW = canvas.width / nbCol;
const cellH = canvas.height / nbRow;

function initCanvasArr() {
    let canvasAsArr = new Array(nbCol * nbRow);
    for (let i = 0; i < nbRow * nbCol; i++) {
        canvasAsArr[i] = 'rgba(255,255,255,0)';
    }

    return canvasAsArr;
}

let canvasAsArr = initCanvasArr();
let currentMode = 'none';
/*why 'is drawing' ? : so that when mouse is up drawing === false
* and when mouse is down drawing === true*/
let isDrawing = false;
/*store points selected when select button clicked*/
let pointsInsideLasso = [];
let isLassoing = false;

let penSize = 1;

/*
let cellsToMove = [];
let isMoving = false;
*/


function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function drawGrid(canvas, nbRow, nbCol) {
    let cellWidth = canvas.width / nbCol;
    let cellHeight = canvas.height / nbRow;

    for (let i = 0; i <= nbCol; i++) {
        drawLine(i * cellWidth, 0, i * cellWidth, canvas.height);
    }

    for (let i = 0; i <= nbRow; i++) {
        drawLine(0, i * cellHeight, canvas.width, i * cellHeight);
    }
}

drawGrid(canvas, nbRow, nbCol);

/*convert color from rgb(r, g, b) format to hex (code from css-tricks.com)*/
function RGBToHex(rgb) {
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    rgb = rgb.slice(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);

    if (r.length === 1)
        r = "0" + r;
    if (g.length === 1)
        g = "0" + g;
    if (b.length === 1)
        b = "0" + b;

    return "#" + r + g + b;
}
/*add previous colors to history*/
function addColorToColorHist() {
    let prevColorButton = document.createElement('button');
    prevColorButton.style.backgroundColor = colorChooser.value;
    prevColorButton.addEventListener('click', () => {
        colorChooser.value = RGBToHex(prevColorButton.style.backgroundColor);
    });
    colorHistory.appendChild(prevColorButton);
}
colorChooser.addEventListener('change', addColorToColorHist);

function getMousePos(event) {
    /*get mouse relative position to canvas*/
    let rect = canvas.getBoundingClientRect();
    let posX = event.x - rect.x;
    let posY = event.y - rect.y;

    return [posX, posY];
}
function getCellPos(mouseX, mouseY) {
    /*get the position of the start of the cell on the canvas (top left corner)*/
    let cellX = Math.floor(mouseX / cellW) * cellW;
    let cellY = Math.floor(mouseY / cellH) * cellH;
    return [cellX, cellY];
}

/*drawing buttons event handlers
* when button is clicked set mode, change cursor
*/
penBut.addEventListener('click', () => {
    canvas.style.cursor = `url("/icons/pen.png") ${0} ${24}, auto`;
    currentMode = 'pen';
});
eraseBut.addEventListener('click', () => {
    canvas.style.cursor = `url("/icons/eraser.png") ${0} ${24}, auto`;
    currentMode = 'eraser';
});
fillBut.addEventListener('click', () => {
    canvas.style.cursor = `url("/icons/fill.png") ${0} ${24}, auto`;
    currentMode = 'filler';
});
clearBut.addEventListener('click', () => {
    canvas.style.cursor = 'url("pixel-art-cursor.png"), auto';
    if (window.confirm('Click OK to erase your drawing')) {
        canvasAsArr = initCanvasArr();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(canvas, nbRow, nbCol);
    }
});
lassoBut.addEventListener('click', () => {
    canvas.style.cursor = 'url("pixel-art-cursor.png"), auto';
    currentMode = 'lasso';
});

pickerBut.addEventListener('click', () => {
    canvas.style.cursor = `url("/icons/picker.png") ${0} ${22}, auto`;
    currentMode = 'picker';
});

moveBut.addEventListener('click', () => {
    canvas.style.cursor = `url("/icons/move.png") ${11} ${12}, auto`;
    currentMode = 'move';
});

smallPenBut.addEventListener('click', () => {
    penSize = 1;
});

mediumPenBut.addEventListener('click', () => {
    penSize = 2;
});

/*fill cell given coordinates of top left corner*/
function fillCellAtPos(cellX, cellY, color) {
    ctx.fillStyle = color;
    let region = new Path2D();
    region.rect(cellX + 1, cellY + 1, cellW - 2, cellH - 2);
    region.closePath();
    ctx.fill(region);
}

/*given pen size draw on canvas*/
function drawPenOnCanvas(cellX, cellY, penSize, penColor) {
    if (penSize === 1) {
        fillCellAtPos(cellX, cellY, penColor);
    }
    else if (penSize === 2) {
        fillCellAtPos(cellX + cellW, cellY, penColor);
        fillCellAtPos(cellX, cellY + cellH, penColor);
        fillCellAtPos(cellX + cellW, cellY + cellH, penColor);
        fillCellAtPos(cellX, cellY, penColor);
    }
}

function drawPenOnCanvasArray(mouseX, mouseY, penSize, color) {
    if (penSize === 1) {
        canvasAsArr[Math.floor(mouseY / cellH) * nbCol + Math.floor(mouseX / cellW)] = color;
    }
    else if (penSize === 2) {
        canvasAsArr[Math.floor(mouseY / cellH + 1) * nbCol + Math.floor(mouseX / cellW)] = color;
        canvasAsArr[Math.floor(mouseY / cellH) * nbCol + Math.floor(mouseX / cellW + 1)] = color;
        canvasAsArr[Math.floor(mouseY / cellH + 1) * nbCol + Math.floor(mouseX / cellW + 1)] = color;
        canvasAsArr[Math.floor(mouseY / cellH) * nbCol + Math.floor(mouseX / cellW)] = color;
    }
}
/*--------------------------------*/

function getCellColor(cellX, cellY) {
    return canvasAsArr[Math.floor(cellY / cellH) * nbCol + Math.floor(cellX / cellW)];
}

/*when canvas clicked, given current drawing mode :
* do something*/
function onCanvasClick(event) {
    let mousePos = getMousePos(event);
    let mouseX = mousePos[0];
    let mouseY = mousePos[1];

    let cellPos = getCellPos(mouseX, mouseY);
    let cellX = cellPos[0];
    let cellY = cellPos[1];

    if (currentMode === 'pen') {
        let color = colorChooser.value;
        isDrawing = true;
        /*
        canvasAsArr[Math.floor(mouseY / cellH) * nbCol + Math.floor(mouseX / cellW)] = ctx.fillStyle;
        fillCellAtPos(cellX, cellY, color);
        */
         drawPenOnCanvas(cellX, cellY, penSize, color);
         drawPenOnCanvasArray(mouseX, mouseY, penSize, ctx.fillStyle);
    }

    if (currentMode === 'eraser') {
        let whiteColor = '#ffffff';
        isDrawing = true;
        /*
        canvasAsArr[Math.floor(mouseY / cellH) * nbCol + Math.floor(mouseX / cellW)] = '#ffffff00';
        fillCellAtPos(cellX, cellY, whiteColor);
        */
        drawPenOnCanvas(cellX, cellY, penSize, whiteColor);
        drawPenOnCanvasArray(mouseX, mouseY, penSize, '#ffffff00');
    }

    if (currentMode === 'filler') {
        /*replace color of cells connected to clicked cell by
        * current color chooser value*/
        fill(canvasAsArr, Math.floor(cellX / cellW),
            Math.floor(cellY / cellH),
            colorChooser.value,
            getCellColor(cellX, cellY));
    }

    if (currentMode === 'lasso') {
        isLassoing = true;
        console.log(cellPos);
        ctx.fillStyle = '#0000ff';
        if (pointsInsideLasso.length % 3 === 0 && pointsInsideLasso.length > 1) {
            let lastPoint = pointsInsideLasso[pointsInsideLasso.length - 1];
            let prevLineW = ctx.lineWidth;
            ctx.lineWidth = 3;
            drawLine(lastPoint[0],
                     lastPoint[1],
                     mousePos[0],
                     mousePos[1]);
            ctx.lineWidth = prevLineW;
        }
        pointsInsideLasso.push(mousePos);
    }

    /*
    if (currentMode === 'move') {
        if (isMoving) {

        }
    }
    */

    if (currentMode === 'picker') {
        colorChooser.value = getCellColor(cellX, cellY);
    }
}

/*given point coordinates check if point is inside given polygon
* algorithm from "eecs.umich.edu" (raycast method)
*/
function pointIsInPolygon(polygon, p) {
    let counter = 0;
    let p1 = polygon[0];

    let N = polygon.length;
    let pX = p[0], pY = p[1];

    for (let i = 1; i <= N; i++) {
        let p2 = polygon[i % N];

        let p1X = p1[0], p1Y = p1[1];
        let p2X = p2[0], p2Y = p2[1];

        if (pY > Math.min(p1Y, p2Y)) {
            if (pY <= Math.max(p1Y, p2Y)) {
                if (pX <= Math.max(p1X, p2X)) {
                    if (p1Y !== p2Y) {
                        let xInters = (pY - p1Y) * (p2X - p1X) / (p2Y - p1Y) + p1X;
                        if (p1X === p2X || pX <= xInters) {
                            counter += 1;
                        }
                    }
                }
            }
        }
        p1 = p2;
    }

    return counter % 2 !== 0;
}

/*queue class (used to perform flood fill (to fill cells))*/
class Queue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    /*
    peek() {
        return this.elements[this.head];
    }
    */

    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
}
/*todo : cleanup fill function*/
function fill(canvasArr, x, y, toPlace, toReplace) {
    console.log(canvasArr[y * nbCol + x]);
    if (canvasArr[y * nbCol + x] === toReplace) {
        let q = new Queue();
        q.enqueue([x, y]);
        canvasArr[y * nbCol + x] = toPlace;

        while (!q.isEmpty) {
            let cell = q.dequeue();
            let valX = cell[0];
            let valY = cell[1];

            fillCellAtPos(valX * (canvas.height / nbRow), valY * (canvas.width / nbCol), toPlace);

            if (valY + 1 < canvas.height && canvasArr[(valY + 1) * nbCol + valX] === toReplace) {
                let value = valY + 1;
                canvasArr[(valY + 1) * nbCol + valX] = toPlace;
                fillCellAtPos(valX * (canvas.height / nbRow), value * (canvas.width / nbCol), toPlace);
                q.enqueue([valX, value]);
            }

            if (valY - 1 >= 0 && canvasArr[(valY - 1) * nbCol + valX] === toReplace) {
                let value = valY - 1;
                canvasArr[(valY - 1) * nbCol + valX] = toPlace;
                fillCellAtPos(valX * (canvas.height / nbRow), value * (canvas.width / nbCol), toPlace);
                q.enqueue([valX, value]);
            }

            if (valX + 1 < canvas.width && canvasArr[valY * nbCol + (valX + 1)] === toReplace) {
                let value = valX + 1;
                canvasArr[valY * nbCol + (valX + 1)] = toPlace;
                fillCellAtPos(value * (canvas.height / nbRow), valY * (canvas.width / nbCol), toPlace);
                q.enqueue([value, valY]);
            }

            if (valX - 1 >= 0 && canvasArr[valY * nbCol + (valX - 1)] === toReplace) {
                let value = valX - 1;
                canvasArr[valY * nbCol + (valX - 1)] = toPlace;
                fillCellAtPos(value * (canvas.height / nbRow), valY * (canvas.width / nbCol), toPlace);
                q.enqueue([value, valY]);
            }
        }
    }
}

/*use canvas stored as array to redraw canvas (without grid lines)*/
function createResultImage(canvasAsArr, width, height, nbRow, nbCol) {
    let newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;

    let newCtx = newCanvas.getContext('2d');

    let cellWidth = width / nbCol;
    let cellHeight = height / nbRow;

    for (let i = 0; i < nbRow; i++) {
        for (let j = 0; j < nbCol; j++) {
            let prevCtxFill = newCtx.fillStyle;

            newCtx.fillStyle = canvasAsArr[i * nbCol + j];

            let region = new Path2D();
            region.rect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
            region.closePath();
            newCtx.fill(region);

            newCtx.fillStyle = prevCtxFill;
        }
    }
    return newCanvas;
}
/*
let download_img = function(el) {
    // get image URL from canvas object
    let newCanvas = createResultImage(canvasAsArr, canvas.width, canvas.height, nbRow, nbCol);
    el.href = newCanvas.toDataURL("image/jpg");
};
*/

downloadBut.addEventListener('click', () => {
   let canvasUrl = createResultImage(canvasAsArr, canvas.width, canvas.height, nbRow, nbCol).toDataURL();
   const dlLink = document.createElement('a');
   dlLink.href = canvasUrl;
   let name = prompt();
   while (name === '') {
       name = prompt();
   }
   dlLink.download = name;
   dlLink.click();
});

/*if mouse is down draw something*/
canvas.addEventListener('mousedown', e => {

    /*
    if (currentMode === 'move') {
        if (!isMoving) {
            let cellPos = getCellPos(getMousePos(e)[0], getMousePos(e)[1]);
            console.log(cellPos);
            cellsToMove.push(cellPos);
            isMoving = true;
        }
    }
    */

    onCanvasClick(e);
});
/*while mouse is moving do something*/
canvas.addEventListener('mousemove', e => {
    if (isDrawing) {
        onCanvasClick(e);
    }
    if (isLassoing) {
        onCanvasClick(e);
    }
});
/*if mouse is up / stops moving do something else (stop drawing)*/
canvas.addEventListener('mouseup', e => {
    if (isDrawing) {
        onCanvasClick(e);
        isDrawing = false;
    }

    if (isLassoing) {
        onCanvasClick(e);
        isLassoing = false;
        for (let i = 0; i < nbCol; i++) {
            for (let j = 0; j < nbRow; j++) {
                if (pointIsInPolygon(pointsInsideLasso, [i * cellW, j * cellH])) {
                    fillCellAtPos(i * cellW, j * cellH, 'rgba(0,0,255,0.5)');
                }
            }
        }
    }

    /*
    if (isMoving) {
        let cell = cellsToMove[cellsToMove.length - 1];
        console.log(cellsToMove);
        let mousePos = getMousePos(e);
        let mouseX = mousePos[0], mouseY = mousePos[1];

        let cellDestPos = getCellPos(mousePos[0], mousePos[1]);
        let cellDestX = cellDestPos[0], cellDestY = cellDestPos[1];

        fillCellAtPos(cellDestPos[0], cellDestPos[1], getCellColor(cell[0], cell[1]));
        //canvasAsArr[cellDestY * nbCol + cellDestX] = getCellColor(cell[0], cell[1]);
        console.log(cellDestPos);
        fillCellAtPos(cell[0], cell[1], 'rgba(255, 255, 255)');
        //cellsToMove = [];

        isMoving = false;
    }
    */
});

window.addEventListener('load', () => {
    drawGrid(canvas, nbRow, nbCol);
});