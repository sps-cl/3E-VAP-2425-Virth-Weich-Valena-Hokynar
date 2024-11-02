
const socket = io();
const board = document.getElementById('board');
const rows = 8;
const cols = 8;
let selectedPiece = null;


// vytvoření tabulky
function createBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);

      // vytvoření černých kamenů
      if (row < 3 && (row + col) % 2 !== 0) {
        const piece = document.createElement('div');
        piece.classList.add('piece', 'black-piece');
        piece.textContent = '⬤';
        piece.dataset.color = 'black';
        cell.appendChild(piece);

        // vytvoření bilých kamenů
      } else if (row > 4 && (row + col) % 2 !== 0) {
        const piece = document.createElement('div');
        piece.classList.add('piece', 'white-piece');
        piece.textContent = '⬤';
        piece.dataset.color = 'white';
        cell.appendChild(piece);
      }
    }
  }
}

// omezení skoků. Lze skákat pouze o 1 políčko úhlopříčně.
function isValidMove(startCell, endCell) {
  const startRow = parseInt(startCell.dataset.row);
  const startCol = parseInt(startCell.dataset.col);
  const endRow = parseInt(endCell.dataset.row);
  const endCol = parseInt(endCell.dataset.col);
  const piece = startCell.querySelector('.piece');

  if (!piece) return false;

  const direction = piece.dataset.color === 'black' ? 1 : -1;
  const rowDiff = endRow - startRow;
  const colDiff = Math.abs(endCol - startCol);

  if (colDiff === 1 && rowDiff === direction && !endCell.querySelector('.piece')) {
    return true;
  }

  if (colDiff === 2 && rowDiff === 2 * direction && !endCell.querySelector(".piece")) {
    const middleRow = (startRow + endRow) / 2;
    const middleCol = (startCol + endCol) / 2;
    const middleCell = board.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
    const middlePiece = middleCell.querySelector('.piece');

    if (middlePiece && middlePiece.dataset.color !== piece.dataset.color) {
      const captureData = {
        row: middleRow,
        col: middleCol,
        color: middlePiece.dataset.color,
      };

      socket.emit("capture", captureData);
      middleCell.removeChild(middlePiece); 
      return true;
    }
  }

  return false;
}


function onCellClick(event) {
  const cell = event.currentTarget;
  const piece = cell.querySelector('.piece');

  if (selectedPiece) {
    selectedPiece.classList.remove("selected");
    const startCell = selectedPiece.parentElement;

    if (isValidMove(startCell, cell)) {
      const moveData = {
        fromRow: startCell.dataset.row,
        fromCol: startCell.dataset.col,
        toRow: cell.dataset.row,
        toCol: cell.dataset.col,
      };

      cell.appendChild(selectedPiece);
      socket.emit("pohybKameneClient", moveData); // odesílání event pohybu na server

      selectedPiece = null;
    }
  } else if (piece) {
    selectedPiece = piece;
  }

  if (piece) {
    selectedPiece = piece;
    selectedPiece.classList.add("selected");
  }
}

// Funkce, ktera konroluje kdo je na tahu
let currentPlayer = 'white';

function switchPlayer() {
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
}

function isCurrentPlayerPiece(piece) {
  return piece && piece.dataset.color === currentPlayer;
}

// Funkce, ktera umoznuje pohyb kamene pokud je hrac na tahu
function onCellClick(event) {
  const cell = event.currentTarget;
  const piece = cell.querySelector('.piece');

  if (selectedPiece) {
    selectedPiece.classList.remove("selected");
    const startCell = selectedPiece.parentElement;

    if (isValidMove(startCell, cell)) {
      const moveData = {
        fromRow: startCell.dataset.row,
        fromCol: startCell.dataset.col,
        toRow: cell.dataset.row,
        toCol: cell.dataset.col,
      };

      cell.appendChild(selectedPiece);
      socket.emit("pohybKameneClient", moveData); // odesílání event pohybu na server

      selectedPiece = null;
      switchPlayer();
    }
  } else if (piece && isCurrentPlayerPiece(piece)) {
    selectedPiece = piece;
    selectedPiece.classList.add("selected");
  }
}

// příjímaní event pohybu
socket.on("pohybKameneServer", (moveData) => {
  console.log("moveData: ", moveData);
  const { fromRow, fromCol, toRow, toCol } = moveData;

  const startCell = board.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}']`);
  const endCell = board.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);

  const piece = startCell.querySelector('.piece');
  if (piece && !endCell.querySelector('.piece')) {
    endCell.appendChild(piece);
  }
  
});

socket.on("captureServer", (captureData) => {
  const { row, col } = captureData;
  const middleCell = board.querySelector(`[data-row='${row}'][data-col='${col}']`);
  const middlePiece = middleCell.querySelector('.piece');

  if (middlePiece) {
    middleCell.removeChild(middlePiece);
  }
});

createBoard();