import Character from '../Character';

export default class Magician extends Character {
  constructor (level) {
    super(level, 'magician');
    this.attack = 10;                   
    this.defence = 40; 
    this.moving = 1;              // допустимая дальность перемещений
    this.longrange = 4;           // допустимая дальность атаки
  } 
}