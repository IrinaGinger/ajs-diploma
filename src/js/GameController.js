import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

import PositionedCharacter from './PositionedCharacter';

import {generateTeam} from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi('prairie');

    const charactersNumber = 2;                                                       // количество персонажей игрока и компьютера
    const levelNumber = 4;                                                            // количество уровней персонажей
    const playerTypes = [Bowman, Swordsman, Magician];                                // доступные классы игрока
    const computerTypes = [Vampire, Undead, Daemon];                                  // доступные классы компьютера
    const playerTeam = generateTeam(playerTypes, levelNumber, charactersNumber);      // команда игрока (4 уровня, 2 персонажа)
    const computerTeam = generateTeam(computerTypes, levelNumber, charactersNumber);  // команда компьютера (4 уровня, 2 персонажа)
    const playerPosCharacters = [];                                                   // массив позиционированных персонажей игрока
    const computerPosCharacters = [];                                                 // массив позиционированных персонажей компьютера

    let i = 0;
    while (i < charactersNumber) {
      let playerCharPosition = Math.floor(Math.random() * (this.gamePlay.boardSize)) * this.gamePlay.boardSize + i;
      let isPosition = false;

      for (let j = 0; j < playerPosCharacters.length; j++) {
        if (playerPosCharacters[j].position === playerCharPosition) {
          isPosition = true;
          break;
        }
      }

      if (!isPosition) {
        playerPosCharacters.push(new PositionedCharacter(playerTeam.characters[i], playerCharPosition));
        i++;
      }
    }

    i = 0;
    while (i < charactersNumber) {
      let computerCharPosition = Math.floor(Math.random() * (this.gamePlay.boardSize)) * this.gamePlay.boardSize + (this.gamePlay.boardSize - i - 1);
      let isPosition = false;

      for (let j = 0; j < computerPosCharacters.length; j++) {
        if (computerPosCharacters[j].position === computerCharPosition) {
          isPosition = true;
          break;
        }
      }

      if (!isPosition) {
        computerPosCharacters.push(new PositionedCharacter(computerTeam.characters[i], computerCharPosition));
        i++;
      }
    }

    this.gamePlay.redrawPositions([...playerPosCharacters, ...computerPosCharacters]);

  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
