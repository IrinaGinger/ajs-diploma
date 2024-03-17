import {allowedMoveRange, allowedAttackRange} from '../range';
import Bowman from '../../characters/Bowman';
import Swordsman from '../../characters/Swordsman';
import Magician from '../../characters/Magician';
import Vampire from '../../characters/Vampire';
import Undead from '../../characters/Undead';
import Daemon from '../../characters/Daemon';

const bowman = new Bowman(1);
const daemon = new Daemon(1);
const magician = new Magician(1); 
const swordsman = new Swordsman(1); 
const undead = new Undead(1);
const vampire = new Vampire(1); 

const dataList1 = [
    [0, bowman, 8, [1, 2, 8, 9, 16, 18]],
    [4, swordsman, 8, [0, 1, 2, 3, 5, 6, 7, 11, 12, 13, 18, 20, 22, 25, 28, 31, 32, 36]],
    [27, magician, 8, [18, 19, 20, 26, 28, 34, 35, 36]],
    [61, vampire, 8, [43, 45, 47, 52, 53, 54, 59, 60, 62, 63]],
    [7, undead, 8, [3, 4, 5, 6, 14, 15, 21, 23, 28, 31, 35, 39]],
    [31, daemon, 8, [22, 23, 30, 38, 39]]
  ];
  
  test.each(dataList1)('Правильно определяются возможные ячейки перехода', (index, character, boardSize, expected) => {
    const result = allowedMoveRange(index, character.moving, boardSize);

    expect(result).toEqual(expected);
  });

  const dataList2 = [
    [0, bowman, 8, [1, 2, 8, 9, 10, 16, 17, 18]],
    [27, swordsman, 8, [18, 19, 20, 26, 28, 34, 35, 36]],
    [4, magician, 8, [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]],
    [32, vampire, 8, [16, 17, 18, 24, 25, 26, 33, 34, 40, 41, 42, 48, 49, 50]],
    [54, undead, 8, [45, 46, 47, 53, 55, 61, 62, 63]],
    [63, daemon, 8, [27, 28, 29, 30, 31, 35, 36, 37, 38, 39, 43, 44, 45, 46, 47, 51, 52, 53, 54, 55, 59, 60, 61, 62]]
  ];
  
  test.each(dataList2)('Правильно определяются возможные ячейки атаки', (index, character, boardSize, expected) => {
    const result = allowedAttackRange(index, character.longrange, boardSize);

    expect(result).toEqual(expected);
  });