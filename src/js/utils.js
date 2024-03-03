/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  if (index >= boardSize ** 2) {
    throw new Error('Некорректный индекс');
  }
  
  switch (index) {
    case 0:
      return 'top-left';
    case (boardSize - 1):
      return 'top-right';
    case (boardSize ** 2 - boardSize):
      return 'bottom-left';
    case (boardSize ** 2 - 1):
      return 'bottom-right';
    default:
      if (index < boardSize) {
        return 'top';
      } else if (index % boardSize === 0) {
        return 'left';
      } else if (index % boardSize === boardSize - 1) {
        return 'right';
      } else if (index > boardSize ** 2 - boardSize) {
        return 'bottom';
      }
      return 'center';
  }
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
