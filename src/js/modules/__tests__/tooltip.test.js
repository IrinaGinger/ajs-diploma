import tooltipString from '../tooltip';
import Bowman from '../../characters/Bowman';

const bowman = new Bowman(1);

test('Выводится строка подсказки', () => {
    const correct = `${String.fromCodePoint(0x1F396)}1${String.fromCodePoint(0x2694)}25${String.fromCodePoint(0x1F6E1)}25${String.fromCodePoint(0x2764)}50`;
    expect(tooltipString(bowman)).toBe(correct);
})