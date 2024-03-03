import Character from '../Character';

export default class Swordsman extends Character {
  constructor (level, type = 'swordsman') {
    super(level);
    this.type = type;
    this.attack = 40;                   
    this.defence = 10; 
  } 
}