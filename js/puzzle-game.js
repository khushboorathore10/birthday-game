const rows = 3;
const cols = 3;
const targetSize = 225;

const puzzleGrid = document.getElementById("puzzleGrid");
const piecesContainer = document.getElementById("piecesContainer");
const referenceImage = document.getElementById("referenceImage");

let pieceWidth = targetSize / cols;
let pieceHeight = targetSize / rows;
let placed = new Array(rows * cols).fill(null);

let image = new Image();
image.src = referenceImage.src;

let resizedImage = new Image();


image.onload = () => {
  const loader = document.getElementById("loader");
  const referenceImage = document.getElementById("referenceImage");

  // Resize original image to 225x225 using an offscreen canvas
  const resizeCanvas = document.createElement("canvas");
  resizeCanvas.width = targetSize;
  resizeCanvas.height = targetSize;
  const resizeCtx = resizeCanvas.getContext("2d");
  resizeCtx.drawImage(image, 0, 0, targetSize, targetSize);

  resizedImage.src = resizeCanvas.toDataURL();

  resizedImage.onload = () => {
    const loader = document.getElementById("loader");
    const referenceImage = document.getElementById("referenceImage");
  
    referenceImage.style.width = targetSize + "px";
    referenceImage.style.height = targetSize + "px";
    puzzleGrid.style.width = targetSize + "px";
    puzzleGrid.style.height = targetSize + "px";
  
    loader.style.display = "none";                // Hide loader
    referenceImage.style.opacity = 1;             // Show image
    referenceImage.style.transition = "opacity 0.5s ease-in"; // Smooth fade
  
    createGrid();
    generatePieces();
  };
  
};


// Create the grid cells
function createGrid() {
  puzzleGrid.innerHTML = "";

  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = i;
    cell.style.width = pieceWidth + "px";
    cell.style.height = pieceHeight + "px";
    cell.style.position = "relative";
    cell.style.boxSizing = "border-box";
    cell.style.border = "1px solid #ccc";

    cell.addEventListener("dragover", (e) => e.preventDefault());

    cell.addEventListener("drop", (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const index = parseInt(cell.dataset.index);

      if (placed[index]) return;

      const pieceData = {
        row: data.row,
        col: data.col,
        sx: data.sx,
        sy: data.sy,
      };

      placed[index] = pieceData;
      drawPiece(cell, pieceData);

      const pieceEl = document.getElementById(data.id);
      if (pieceEl) pieceEl.remove();

      checkIfSolved();
    });

    puzzleGrid.appendChild(cell);
  }
}

// Generate shuffled pieces
function generatePieces() {
  let pieces = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = col * pieceWidth;
      const sy = row * pieceHeight;
      pieces.push({ row, col, sx, sy });
    }
  }

  pieces.sort(() => 0.5 - Math.random());

  pieces.forEach((piece) => {
    const pieceCanvas = document.createElement("canvas");
    pieceCanvas.width = pieceWidth;
    pieceCanvas.height = pieceHeight;
    pieceCanvas.className = "pieceCanvas";
    pieceCanvas.draggable = true;
    pieceCanvas.id = `piece-${piece.row}-${piece.col}`;

    const ctx = pieceCanvas.getContext("2d");
    ctx.drawImage(
      resizedImage,
      piece.sx,
      piece.sy,
      pieceWidth,
      pieceHeight,
      0,
      0,
      pieceWidth,
      pieceHeight
    );

    pieceCanvas.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          row: piece.row,
          col: piece.col,
          sx: piece.sx,
          sy: piece.sy,
          from: "sidebar",
          id: pieceCanvas.id,
        })
      );
    });

    piecesContainer.appendChild(pieceCanvas);
  });
}

// Draw a piece in a grid cell
function drawPiece(cell, piece) {
  const canvas = document.createElement("canvas");
  canvas.width = pieceWidth;
  canvas.height = pieceHeight;
  canvas.className = "droppedCanvas";
  canvas.style.position = "absolute";
  canvas.style.top = 0;
  canvas.style.left = 0;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    resizedImage,
    piece.sx,
    piece.sy,
    pieceWidth,
    pieceHeight,
    0,
    0,
    pieceWidth,
    pieceHeight
  );

  // Allow moving this piece again
  canvas.draggable = true;
  canvas.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        row: piece.row,
        col: piece.col,
        sx: piece.sx,
        sy: piece.sy,
        from: "grid",
        id: null,
      })
    );
    placed[parseInt(cell.dataset.index)] = null; // Unplace it
    canvas.remove(); // Remove canvas so it can be moved
  });

  cell.appendChild(canvas);
}

// Check for correct puzzle placement
function checkIfSolved() {
  for (let i = 0; i < placed.length; i++) {
    const correctRow = Math.floor(i / cols);
    const correctCol = i % cols;
    const p = placed[i];

    if (!p || p.row !== correctRow || p.col !== correctCol) return;
  }

  setTimeout(() => {
    const modal = document.createElement("div");
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      ">
        <div style="
          background: white;
          padding: 30px 40px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        ">
          <h2 style="color: #fd2032;">Yayy... you got it!</h2>
          <h2>🎉 🎉 🎉</h2>
          <button onclick="startGame('adventure')" style="
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1rem;
            background-color: #e75480;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          ">
            Start Adventure Game
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }, 100);
}



