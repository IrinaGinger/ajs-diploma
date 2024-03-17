import Character from '../Character';

export default class Vampire extends Character {
  constructor (level, type = 'vampire') {
    super(level);
    this.type = type;
    this.attack = 25;                   
    this.defence = 25; 
    this.moving = 2;
    this.longrange = 2;
  } 
}