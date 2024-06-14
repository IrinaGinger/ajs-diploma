import Character from '../Character';

export default class Vampire extends Character {
  constructor (level) {
    super(level, 'vampire');
    this.attack = 25;                   
    this.defence = 25; 
    this.moving = 2;                // допустимая дальность перемещений
    this.longrange = 2;             // допустимая дальность атаки
  } 
}