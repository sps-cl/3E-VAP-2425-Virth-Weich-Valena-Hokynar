const socket = io();
const board = document.getElementById('board');
const rows = 8;
const cols = 8;
let selectedPiece = null;
let blackPieceNum = 12;
let whitePieceNum = 12;

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

  const isKing = piece.classList.contains('king');
  const direction = piece.dataset.color === 'black' ? 1 : -1;
  const rowDiff = endRow - startRow;
  const colDiff = Math.abs(endCol - startCol);

  if (isKing) {
    // Kral se muze pohybovat o 1 policko uhlopricne v jakemkoliv smeru
    if (colDiff === 1 && Math.abs(rowDiff) === 1 && !endCell.querySelector('.piece')) {
      return true;
    }
    // Kral muze skakat pres figurku soupere
    if (colDiff === 2 && Math.abs(rowDiff) === 2 && !endCell.querySelector('.piece')) {
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

        if (middlePiece.dataset.color === "black") {
          blackPieceNum -= 1;
          console.log("černý:" + blackPieceNum);
          if (blackPieceNum === 0 ) {
            winWhite();
          }
        } else {
          if (middlePiece.dataset.color === "white") {
              whitePieceNum -= 1;
              console.log("bílý:" + whitePieceNum);
              if (whitePieceNum === 0) {
              winBlack();
            }
          }
        }

        socket.emit("capture", captureData);
        middleCell.removeChild(middlePiece);
        return true;
      }
    }
  } else {
    // obycejna figurka se muze pohybovat pouze o 1 policko uhlopricne dopredu
    if (colDiff === 1 && rowDiff === direction && !endCell.querySelector('.piece')) {
      return true;
    }
    // Obycejna figurka muze skakat pres figurku soupere
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

        if (middlePiece.dataset.color === "black") {
          blackPieceNum -= 1;
          console.log("černý:" + blackPieceNum);
          if (blackPieceNum === 0 ) {
            winWhite();
          }
        } else {
          if (middlePiece.dataset.color === "white") {
              whitePieceNum -= 1;
              console.log("bílý:" + whitePieceNum);
              if (whitePieceNum === 0) {
              winBlack();
            }
          }
        }

        socket.emit("capture", captureData);
        middleCell.removeChild(middlePiece);
        return true;
      }
    }
  }

  return false;
}

function promoteToKing(piece) {
  piece.classList.add('king');
}

function isPromotionRow(row, piece) {
  const pieceColor = piece.dataset.color;
  return (pieceColor === 'white' && row === '0') || (pieceColor === 'black' && row === '7');
}

function handleMove(startCell, endCell, piece) {
  const moveData = {
    fromRow: startCell.dataset.row,
    fromCol: startCell.dataset.col,
    toRow: endCell.dataset.row,
    toCol: endCell.dataset.col,
  };

  endCell.appendChild(piece);
  socket.emit("pohybKameneClient", moveData); // odesílání event pohybu na server

  if (isPromotionRow(endCell.dataset.row, piece)) {
    promoteToKing(piece);
  }

  selectedPiece = null;
  switchPlayer();
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
    if (piece && isCurrentPlayerPiece(piece)) {
      // Zrusi vyber momentalne vybrane figurky a vybere novou 
      selectedPiece.classList.remove("selected");
      selectedPiece = piece;
      selectedPiece.classList.add("selected");
    } else {
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

        if (isPromotionRow(cell.dataset.row, selectedPiece)) {
          promoteToKing(selectedPiece);
        }

        selectedPiece = null;
        switchPlayer();
      } else {
        selectedPiece = null;
      }
    }
  } else if (piece && isCurrentPlayerPiece(piece)) {
    selectedPiece = piece;
    piece.classList.add("selected");
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
    if (isPromotionRow(toRow, piece)) {
      promoteToKing(piece);
    }
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

function reset () {
  socket.emit("reset");
}

socket.on("reset", () => {
  location.reload();
})

function winBlack () {
  socket.emit("win", "black");
}

function winWhite () {
  socket.emit("win", "white");
}

socket.on("win", (winner) => {
  if (winner === "black") {
    const overlayBlack = document.getElementsByClassName("winningOverlayBlack")[0];
    overlayBlack.style.display = "flex";
  } else {
    const overlayWhite = document.getElementsByClassName("winningOverlayWhite")[0];
    overlayWhite.style.display = "flex";
  }
})

createBoard();