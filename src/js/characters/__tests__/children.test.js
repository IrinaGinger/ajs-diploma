import Bowman from '../Bowman';
import Daemon from '../Daemon';
import Magician from '../Magician';
import Swordsman from '../Swordsman';
import Undead from '../Undead';
import Vampire from '../Vampire';

const bowman = new Bowman(1); 
const daemon = new Daemon(1);
const magician = new Magician(1); 
const swordsman = new Swordsman(1); 
const undead = new Undead(1);
const vampire = new Vampire(1); 

test('создается объект класса Bowman с правильными характеристиками', () => {
    const correct = {
        level: 1,
        type: 'bowman',
        health: 50,
        attack: 25,
        defence: 25,
        moving: 2,
        longrange: 2,
    }
    expect(bowman).toEqual(correct);
});

test('создается объект класса Daemon с правильными характеристиками', () => { 
   const correct = {
        level: 1,
        type: 'daemon',
        health: 50,
        attack: 10,
        defence: 40,
        moving: 1,
        longrange: 4,
    }
    expect(daemon).toEqual(correct);
});

test('создается объект класса Magician с правильными характеристиками', () => {
    const correct = {
        level: 1,
        type: 'magician',
        health: 50,
        attack: 10,
        defence: 40,
        moving: 1,
        longrange: 4,
    }
    expect(magician).toEqual(correct);
});

test('создается объект класса Swordsman с правильными характеристиками', () => {
    const correct = {
        level: 1,
        type: 'swordsman',
        health: 50,
        attack: 40,
        defence: 10,
        moving: 4,
        longrange: 1,
    }
    expect(swordsman).toEqual(correct);
});

test('создается объект класса Undead с правильными характеристиками', () => {
    const correct = {
        level: 1,
        type: 'undead',
        health: 50,
        attack: 40,
        defence: 10,
        moving: 4,
        longrange: 1,
    }
    expect(undead).toEqual(correct);
});

test('создается объект класса Vampire с правильными характеристиками', () => {
    const correct = {
        level: 1,
        type: 'vampire',
        health: 50,
        attack: 25,
        defence: 25,
        moving: 2,
        longrange: 2,
    }
    expect(vampire).toEqual(correct);
});