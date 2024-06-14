import Character from '../Character';

export default class Bowman extends Character {
  constructor (level) {
    super(level, 'bowman');
    this.attack = 25;                   
    this.defence = 25; 
    this.moving = 2;                  // допустимая дальность перемещений
    this.longrange = 2;               // допустимая дальность атаки
  } 
}