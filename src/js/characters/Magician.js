import Character from '../Character';

export default class Magician extends Character {
  constructor (level, type = 'magician') {
    super(level);
    this.type = type;
    this.attack = 10;                   
    this.defence = 40; 
  } 
}