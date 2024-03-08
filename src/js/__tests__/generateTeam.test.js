import {generateTeam} from '../generators';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';

const allowedTypes = [Bowman, Swordsman, Magician];
const charNumber = 3;
const maxLevel = 4;
const playerTeam = generateTeam(allowedTypes, maxLevel, charNumber);

test('В команде правильное количество персонажей', () => {
    expect(playerTeam.characters.length).toBe(charNumber);
})

test('Уровень персонажей в допустимом диапазоне', () => {
    for (let i = 0; i < charNumber; i++) {
        expect(playerTeam.characters[i].level >= 1 && playerTeam.characters[i].level <= maxLevel).toBe(true);
    }
})