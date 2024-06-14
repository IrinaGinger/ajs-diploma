import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

import PositionedCharacter from './PositionedCharacter';
import Team from './Team';

export default class GameState {
  constructor (gameLevel, lastIndex, activePlayer, userWin) {
    this.gameLevel = gameLevel;                 // текущий уровень игры
    this.userTeam = null;                       // команда пользователя
    this.computerTeam = null;                   // команда компьютера
    this.positionedCharacters = null;           // массив позционированных персонажей
    this.lastIndex = lastIndex;                 // последняя выбранная ячейка
    this.activePlayer = activePlayer;           // текущий игрок (user || bot)
    this.userWin = userWin;                     // количество побед пользователя
  }

  static from(object) {
    // TODO: create object
    if (typeof object === 'object') {
      const userTypes = {
        bowman: Bowman,
        swordsman: Swordsman,
        magician: Magician,     
      }
      const compTypes = {
        vampire: Vampire,
        undead: Undead,
        daemon: Daemon,        
      }
      const allTypes = {...userTypes, ...compTypes};
        
      const createCharacter = (character) => {
        const characterClass = allTypes[character.type];
        if (!characterClass) {
          throw new Error('Неизвестный тип');
        }
        const char = new characterClass(character.level);
        char.health = character.health;
        char.attack = character.attack;                   
        char.defence = character.defence; 
        char.moving = character.moving;
        char.longrange = character.longrange;
        return char;
      }
      
      const userTeam = new Team([]);
      const compTeam = new Team([]);
      const positionedChar = [];
      for (const positionChar of object.positionedCharacters) {
        const char = createCharacter(positionChar.character);
        if (Object.keys(userTypes).includes(char.type)) {
          userTeam.characters.push(char);
        }
        if (Object.keys(compTypes).includes(char.type)) {
          compTeam.characters.push(char);
        }

        positionedChar.push(new PositionedCharacter(char, positionChar.position));
      }

      const gameState = new GameState();
      gameState.gameLevel = object.gameLevel;
      gameState.userTeam = userTeam;
      gameState.computerTeam = compTeam;
      gameState.positionedCharacters = positionedChar;
      gameState.lastIndex = object.lastIndex;
      gameState.activePlayer = object.activePlayer; 
      gameState.userWin = object.userWin;

      return gameState;
    }

    return null;
  }

  getPositionCharacter(index) {
    return this.positionedCharacters.find((elem) => elem.position === index);
  }
}
