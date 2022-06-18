const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let colorChooser = document.getElementById('colorChooser');
const colorHistory = document.getElementById('colorHistory');

let penButton = document.getElementById('penButton');
let eraserButton = document.getElementById('eraserButton');

canvas.width = 500;
canvas.height = 500;

const nbRow = 50;
const nbCol = 50;

let canvasArr = new Array(nbRow * nbCol);

let isPen = true;
let isEraser = false;

penButton.addEventListener('click', () => {
    isPen = true;
    isEraser = false;
    console.log('isPen');
});

eraserButton.addEventListener('click', () => {
    isPen = false;
    isEraser = true;
    console.log('isEraser');
});

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

/*convert color from rgb(r, g, b) format to hex (code from css-tricks.com )*/
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

function addColorToColorHist()
{
    let button = document.createElement('button');
    button.style.backgroundColor = colorChooser.value;
    button.addEventListener('click', () => {
        colorChooser.value = RGBToHex(button.style.backgroundColor);
    });
    colorHistory.appendChild(button);
}

colorChooser.addEventListener('change', addColorToColorHist);

function fillCellAtPoint(x, y) {
    let cellWidth = canvas.width / nbCol;
    let cellHeight = canvas.height / nbRow;

    /*get the position of the start of the cell on the canvas (top left corner)*/
    let cellX = Math.floor(x / cellWidth) * cellWidth;
    let cellY = Math.floor(y / cellHeight) * cellHeight;

    /*given the drawing mode (pen or eraser) set the color accordingly*/
    let prevCtxFill = ctx.fillStyle;
    if (isPen === true)
    {
        ctx.fillStyle = colorChooser.value;
        canvasArr[Math.floor(y / cellHeight) * nbCol + Math.floor(x / cellWidth)] = ctx.fillStyle;
    }
    else // eraser
    {
        // set canvas cell color as white
        ctx.fillStyle = '#ffffff';
        // set canvas array cell to transparent
        canvasArr[Math.floor(y / cellHeight) * nbCol + Math.floor(x / cellWidth)] = '#ffffff00';
    }

    /*draw the cell on the canvas*/
    let region = new Path2D();
    region.rect(cellX, cellY, cellWidth, cellHeight);
    region.closePath();
    ctx.fill(region);
    /*reset the context fill style*/
    ctx.fillStyle = prevCtxFill;
}

/*given the mouse event fill cell*/
function fillCellAtMousePosition(event) {
    isDrawing = true;
    /*get mouse relative position to canvas*/
    let rect = canvas.getBoundingClientRect();
    let posX = event.x - rect.x;
    let posY = event.y - rect.y;

    fillCellAtPoint(posX, posY);
    /*redraw the grid*/
    drawGrid(canvas, nbRow, nbCol);
}

/*use canvas array (2d array to represent drawing (without grid lines)) to
* create image to download*/
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