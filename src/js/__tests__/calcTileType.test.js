import {calcTileType} from '../utils';

test ('index >= boardSize ** 2 выбрасывает исключение', () => {
  expect(() => calcTileType(65, 8)).toThrow('Некорректный индекс');
});

const dataList = [
  [0, 8, 'top-left'],
  [1, 8, 'top'],
  [7, 8, 'top-right'],
  [7, 7, 'left'],
  [13, 7, 'right'],
  [57, 8, 'bottom'],
  [56, 8, 'bottom-left'],
  [63, 8, 'bottom-right'],
  [35, 10, 'center'],
];

test.each(dataList)('Правильно определяется положение', (index, boardSize, expected) => {
  const result = calcTileType(index, boardSize);
  expect(result).toBe(expected);
});