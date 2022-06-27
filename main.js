const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

const penBut = document.getElementById('penButton');
const eraseBut = document.getElementById('eraserButton');
const fillBut = document.getElementById('fillButton');
const colorChooser = document.getElementById('colorChooser');
const colorHistory = document.getElementById('colorHistory');

const clearBut = document.getElementById('clearButton');

canvas.height = 500;
canvas.width = 500;
const nbRow = 20;
const nbCol = 20;
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
/*add previous colors to history*/
function addColorToColorHist()
{
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

/*drawing buttons event handlers*/
penBut.addEventListener('click', () => {
    currentMode = 'pen';
});
eraseBut.addEventListener('click', () => {
    currentMode = 'eraser';
});
fillBut.addEventListener('click', () => {
    currentMode = 'filler';
});

clearBut.addEventListener('click', () => {
    if (window.confirm('Click OK to erase your drawing')) {
        canvasAsArr = initCanvasArr();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(canvas, nbRow, nbCol);
    }
})

function fillCellAtPos(cellX, cellY, color) {
    ctx.fillStyle = color;
    let region = new Path2D();
    region.rect(cellX + 1, cellY + 1, cellW - 2, cellH - 2);
    region.closePath();
    ctx.fill(region);
}

function getCellColor(cellX, cellY) {
    return canvasAsArr[Math.floor(cellY / cellH) * nbCol + Math.floor(cellX / cellW)];
}

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
        canvasAsArr[Math.floor(mouseY / cellH) * nbCol + Math.floor(mouseX / cellW)] = ctx.fillStyle;
        fillCellAtPos(cellX, cellY, color);
    }

    if (currentMode === 'eraser') {
        let whiteColor = '#ffffff';
        isDrawing = true;
        canvasAsArr[Math.floor(mouseY / cellH) * nbCol + Math.floor(mouseX / cellW)] = '#ffffff00';
        fillCellAtPos(cellX, cellY, whiteColor);
    }

    if (currentMode === 'filler') {
        /*replace colo of cells connected to clicked cell by
        * current color chooser value*/
        fill(canvasAsArr, Math.floor(cellX / cellW),
            Math.floor(cellY / cellH),
            colorChooser.value,
            getCellColor(cellX, cellY));
    }
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
    peek() {
        return this.elements[this.head];
    }
    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
}

function fill(canvasArr, x, y, toPlace, toReplace) {
    console.log(canvasArr[y * nbCol + x]);
    if (canvasArr[y * nbCol + x] === toReplace) {
        console.log('fill()');
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

let download_img = function(el) {
    // get image URI from canvas object
    let newCanvas = createResultImage(canvasAsArr, canvas.width, canvas.height, nbRow, nbCol);
    el.href = newCanvas.toDataURL("image/jpg");
};

canvas.addEventListener('mousedown', e => {
    onCanvasClick(e);
});
canvas.addEventListener('mousemove', e => {
    if (isDrawing) {
        onCanvasClick(e);
    }
});
canvas.addEventListener('mouseup', e => {
    if (isDrawing) {
        onCanvasClick(e);
        isDrawing = false;
    }
});
window.addEventListener('load', () => {
    drawGrid(canvas, nbRow, nbCol);
});