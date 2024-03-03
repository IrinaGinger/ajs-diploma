import {generateTeam} from '../generators';
import Bowman from '../characters/Bowman';
// import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
// import Undead from '../characters/Undead';
// import Vampire from '../characters/Vampire';

const allowedTypes = [Bowman, Swordsman, Magician];
const charNumber = 3;
const maxLevel = 4;
const playerTeam = generateTeam(allowedTypes, maxLevel, charNumber);

test('В команде правильное количество персонажей', () => {
    expect(playerTeam.characters.length).toBe(charNumber);
})

test('Уровень персонажей в допустимом диапазоне', () => {
    for (let i = 0; i < charNumber; i++) {
        expect(playerTeam.characters[i].level >= 0 && playerTeam.characters[i].level <= maxLevel).toBe(true);
    }
})