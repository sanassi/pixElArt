const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let colorChooser = document.getElementById('colorChooser');

canvas.width = 500;
canvas.height = 500;

const nbRow = 25;
const nbCol = 25;

let canvasArr = new Array(nbRow * nbCol);

for (let i = 0; i < nbRow * nbCol; i++) {
    canvasArr[i] = 'rgba(255,255,255,0)';
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawGrid(canvas, nbRow, nbCol) {
    let cellWidth = canvas.width / nbCol;
    let cellHeight = canvas.height / nbRow;

    for (let i = 0; i < nbCol; i++) {
        drawLine(i * cellWidth, 0, i * cellWidth, canvas.height);
    }

    for (let i = 0; i < nbRow; i++) {
        drawLine(0, i * cellHeight, canvas.width, i * cellHeight);
    }
}

drawGrid(canvas, nbRow, nbCol);
let isDrawing = false;

function fillCellAtPoint(x, y) {
    let cellWidth = canvas.width / nbCol;
    let cellHeight = canvas.height / nbRow;

    let cellX = Math.floor(x / cellWidth) * cellWidth;
    let cellY = Math.floor(y / cellHeight) * cellHeight;

    let prevCtxFill = ctx.fillStyle;
    ctx.fillStyle = colorChooser.value;

    canvasArr[Math.floor(y / cellHeight) * nbCol + Math.floor(x / cellWidth)] = ctx.fillStyle;

    let region = new Path2D();
    region.rect(cellX, cellY, cellWidth, cellHeight);
    region.closePath();
    ctx.fill(region);
    ctx.fillStyle = prevCtxFill;
}

function fillCellAtMousePosition(event) {
    isDrawing = true;
    let rect = canvas.getBoundingClientRect();
    let posX = event.x - rect.x;
    let posY = event.y - rect.y;

    fillCellAtPoint(posX, posY);
    drawGrid(canvas, nbRow, nbCol);
}

function createResultImage(canvasArr, width, height, nbRow, nbCol) {
    let newCanvas = document.createElement('canvas');

    newCanvas.width = width;
    newCanvas.height = height;

    let newCtx = newCanvas.getContext('2d');

    let cellWidth = width / nbCol;
    let cellHeight = height / nbRow;

    for (let i = 0; i < nbRow; i++) {
        for (let j = 0; j < nbCol; j++) {
            let prevCtxFill = newCtx.fillStyle;

            newCtx.fillStyle = canvasArr[i * nbCol + j];

            let region = new Path2D();
            region.rect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
            region.closePath();
            newCtx.fill(region);

            newCtx.fillStyle = prevCtxFill;
        }
    }

    return newCanvas;
}

download_img = function(el) {
    // get image URI from canvas object
    let newCanvas = createResultImage(canvasArr, canvas.width, canvas.height, nbRow, nbCol);
    el.href = newCanvas.toDataURL("image/jpg");
};

/*
testButton.addEventListener('click', () => {
    createResultImage(canvasArr, canvas.width, canvas.height, nbRow, nbCol);
})
*/

canvas.onmousedown = fillCellAtMousePosition;

canvas.addEventListener('mousemove' , e => {
    if (isDrawing === true) {
        fillCellAtMousePosition(e);
    }
});

canvas.addEventListener('mouseup', e => {
    if (isDrawing === true) {
        fillCellAtMousePosition(e);
        isDrawing = false;
    }
});