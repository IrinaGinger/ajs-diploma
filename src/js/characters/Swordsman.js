import Character from '../Character';

export default class Swordsman extends Character {
  constructor (level) {
    super(level, 'swordsman');
    this.attack = 40;                   
    this.defence = 10; 
    this.moving = 4;                // допустимая дальность перемещений
    this.longrange = 1;             // допустимая дальность атаки
  } 
}