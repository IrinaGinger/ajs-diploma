import {characterGenerator} from '../generators';
import Bowman from '../characters/Bowman';
// import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
// import Undead from '../characters/Undead';
// import Vampire from '../characters/Vampire';

const count = 32;

test('Генерируются персонажи в нужном количестве из допустимого перечня', () => {
    const allowedTypes = [Bowman, Swordsman, Magician];
    const generator = characterGenerator(allowedTypes, 4);
    for (let i = 0; i < count; i++) {
        let classChar = generator.next().value;
        let isAllowed = false;
        allowedTypes.forEach(item => {
          if (classChar instanceof item) {
            isAllowed = true;
          }
        });
        expect(isAllowed).toBe(true);
    }
})