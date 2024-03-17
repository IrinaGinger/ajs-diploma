
// функция для определения допустимого диапазона ячеек для перемещения
export function allowedMoveRange(index, distance, boardSize) {
    const allowedCells = [];
    
    const row = Math.floor(index / boardSize);
    const column = index % boardSize; 
    
    for (let i = 1; i <= distance; i++) {
      if (column - i >= 0) {
        allowedCells.push(index - i);
      }

      if (column + i < boardSize) {  
        allowedCells.push(index + i);
      }
      
      if (row - i >= 0) {
        allowedCells.push(index - boardSize * i);
      }

      if (row + i < boardSize) {
        allowedCells.push(index + boardSize * i);
      }

      if (column - i >= 0 && row - i >= 0) {
        allowedCells.push(index - boardSize * i - i);
      }

      if (column + i < boardSize && row - i >= 0) {
        allowedCells.push(index - boardSize * i + i);
      }

      if (column - i >= 0 && row + i < boardSize) {
        allowedCells.push(index + boardSize * i - i);
      }
      if (column + i < boardSize && row + i < boardSize) {
        allowedCells.push(index + boardSize * i + i);
      }
    }

    return allowedCells.sort((a, b) => {return a - b});
  }

  // функция для определения допустимого диапазона ячеек для атаки
  export function allowedAttackRange(index, distance, boardSize) {
    const allowedCells = [];
    const row = Math.floor(index / boardSize);
    
    for (let i = 1; i <= distance; i++) {
      if (row - i >= 0) {
        allowedCells.push(index - boardSize * i);
      }

      if (row + i < 8) {
        allowedCells.push(index + boardSize * i);
      }
    }

    const colCells = [index, ...allowedCells];

    colCells.forEach((cell) => {
      const column = cell % boardSize;

      for (let i = 1; i <= distance; i++) {
        if (column + i < boardSize) {
          allowedCells.push(cell + i);
        }
        
        if (column - i >= 0) {
          allowedCells.push(cell - i);
        }
      }
    })

    return allowedCells.sort((a, b) => {return a - b});
  }