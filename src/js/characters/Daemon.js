import Character from '../Character';

export default class Daemon extends Character {
  constructor (level, type = 'daemon') {
    super(level);
    this.type = type;
    this.attack = 10;                   
    this.defence = 10; 
    this.moving = 1;
    this.longrange = 4;
  } 
}