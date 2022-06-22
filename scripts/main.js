const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

const colorChooser = document.getElementById('colorChooser');
const colorHistory = document.getElementById('colorHistory');

const penButton = document.getElementById('penButton');
const eraserButton = document.getElementById('eraserButton');
const fillButton = document.getElementById('fillButton');

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

function fillCellAtPoint(x, y) {
    let cellWidth = canvas.width / nbCol;
    let cellHeight = canvas.height / nbRow;

    /*get the position of the start of the cell on the canvas (top left corner)*/
    let cellX = Math.floor(x / cellWidth) * cellWidth;
    let cellY = Math.floor(y / cellHeight) * cellHeight;

    /*given the drawing mode (pen or eraser) set the color accordingly*/
    let prevCtxFill = ctx.fillStyle;
    if (isPen === true) {
        ctx.fillStyle = colorChooser.value;
        canvasArr[Math.floor(y / cellHeight) * nbCol + Math.floor(x / cellWidth)] = ctx.fillStyle;
    }
    else {
        // eraser mode
        // set canvas cell color as white
        ctx.fillStyle = '#ffffff';
        // set canvas array cell to transparent
        canvasArr[Math.floor(y / cellHeight) * nbCol + Math.floor(x / cellWidth)] = '#ffffff00';
    }

    /*draw the cell on the canvas*/
    let region = new Path2D();
    region.rect(cellX + 1, cellY + 1, cellWidth - 2, cellHeight - 2);
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
    //drawGrid(canvas, nbRow, nbCol);
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
    if (canvasArr[y * nbCol + x] === toReplace) {
        console.log('fill()');
        let q = new Queue();
        q.enqueue([x, y]);
        canvasArr[y * nbCol + x] = toPlace;

        while (!q.isEmpty) {
            let cell = q.dequeue();
            let valX = cell[0];
            let valY = cell[1];

            fillCellAtPoint(valX * (canvas.height / nbRow), valY * (canvas.width / nbCol));


            if (valY + 1 < canvas.height && canvasArr[(valY + 1) * nbCol + valX] === toReplace) {
                let value = valY + 1;
                canvasArr[(valY + 1) * nbCol + valX] = toPlace;
                q.enqueue([valX, value]);
            }

            if (valY - 1 >= 0 && canvasArr[(valY - 1) * nbCol + valX] === toReplace) {
                let value = valY - 1;
                canvasArr[(valY - 1) * nbCol + valX] = toPlace;
                q.enqueue([valX, value]);
            }

            if (valX + 1 < canvas.width && canvasArr[valY * nbCol + (valX + 1)] === toReplace) {
                let value = valX + 1;
                canvasArr[valY * nbCol + (valX + 1)] = toPlace;
                q.enqueue([value, valY]);
            }

            if (valX - 1 >= 0 && canvasArr[valY * nbCol + (valX - 1)] === toReplace) {
                let value = valX - 1;
                canvasArr[valY * nbCol + (valX - 1)] = toPlace;
                q.enqueue([value, valY]);
            }
        }
    }
}

let isFiller = false;
fillButton.addEventListener('click',  () => {
    isPen = false;
    isEraser = false;
    isFiller = true;
    //fill(canvasArr, 10, 10, '#001dff', 'rgba(255,255,255,0)');
});

canvas.addEventListener('mousedown', e => {
    if (isFiller) {
        isDrawing = true;
        /*get mouse relative position to canvas*/
        let rect = canvas.getBoundingClientRect();
        let posX = e.x - rect.x;
        let posY = e.y - rect.y;

        fill(canvasArr, posX, posY, '#001dff', 'rgba(255,255,255,0)');
    }
})

let download_img = function(el) {
    // get image URI from canvas object
    let newCanvas = createResultImage(canvasArr, canvas.width, canvas.height, nbRow, nbCol);
    el.href = newCanvas.toDataURL("image/jpg");
};

/*main event listeners*/
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