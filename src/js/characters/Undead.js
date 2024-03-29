import Character from '../Character';

export default class Undead extends Character {
  constructor (level, type = 'undead') {
    super(level);
    this.type = type;
    this.attack = 40;                   
    this.defence = 10; 
    this.moving = 4;
    this.longrange = 1;
  } 
}