const board = document.getElementById('board');
const rows = 8;
const cols = 8;
let selectedPiece = null;

    function createBoard() {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = document.createElement('div');
          cell.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
          cell.dataset.row = row;
          cell.dataset.col = col;
          cell.addEventListener('click', onCellClick);
          board.appendChild(cell);

          if (row < 3 && (row + col) % 2 !== 0) {
            const piece = document.createElement('div');
            piece.classList.add('piece', 'black-piece');
            piece.textContent = '⬤';
            piece.dataset.color = 'black';
            cell.appendChild(piece);
            } 
            else if (row > 4 && (row + col) % 2 !== 0) {
            const piece = document.createElement('div');
            piece.classList.add('piece', 'white-piece');
            piece.textContent = '⬤';
            piece.dataset.color = 'white';
            cell.appendChild(piece);
            }
        }
      }
    }

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

      if (colDiff === 2 && rowDiff === 2 * direction) {
        const middleRow = (startRow + endRow) / 2;
        const middleCol = (startCol + endCol) / 2;
        const middleCell = board.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
        const middlePiece = middleCell.querySelector('.piece');

        if (middlePiece && middlePiece.dataset.color !== piece.dataset.color) {
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
        const startCell = selectedPiece.parentElement;
        if (isValidMove(startCell, cell)) {
          cell.appendChild(selectedPiece);
          selectedPiece = null;
        }
      } else if (piece) {
        selectedPiece = piece;
      }
    }

    createBoard();