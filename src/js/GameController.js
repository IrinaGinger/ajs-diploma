import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

import PositionedCharacter from './PositionedCharacter';

import {generateTeam} from './generators';

import tooltipString from './tooltip';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.playerTeam = {};              // команда игрока 
    this.computerTeam = {};            // команда компьютера

    this.positionedCharacters = [];     // массив позиционированных персонажей 
   //  this.computerPosCharacters = [];   // массив позиционированных персонажей компьютера
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.gamePlay.drawUi('prairie');

    const charactersNumber = 2;                                                       // количество персонажей игрока и компьютера
    const levelNumber = 4;                                                            // количество уровней персонажей
    const playerTypes = [Bowman, Swordsman, Magician];                                // доступные классы игрока
    const computerTypes = [Vampire, Undead, Daemon];                                  // доступные классы компьютера

    this.playerTeam = generateTeam(playerTypes, levelNumber, charactersNumber);      // формирование команды игрока 
    this.computerTeam = generateTeam(computerTypes, levelNumber, charactersNumber);  // формирование команды компьютера 

    let isPosition;

    let i = 0;
    while (i < charactersNumber) {
      let playerCharPosition = Math.floor(Math.random() * (this.gamePlay.boardSize)) * this.gamePlay.boardSize + i;
      isPosition = false;

      for (let j = 0; j < this.positionedCharacters.length; j++) {
        if (this.positionedCharacters[j].position === playerCharPosition) {
          isPosition = true;
          break;
        }
      }

      if (!isPosition) {
        this.positionedCharacters.push(new PositionedCharacter(this.playerTeam.characters[i], playerCharPosition));
        i++;
      }
    }

    i = 0;
    while (i < charactersNumber) {
      let computerCharPosition = Math.floor(Math.random() * (this.gamePlay.boardSize)) * this.gamePlay.boardSize + (this.gamePlay.boardSize - i - 1);
      isPosition = false;

      for (let j = 0; j < this.positionedCharacters.length; j++) {
        if (this.positionedCharacters[j].position === computerCharPosition) {
          isPosition = true;
          break;
        }
      }

      if (!isPosition) {
        this.positionedCharacters.push(new PositionedCharacter(this.computerTeam.characters[i], computerCharPosition));
        i++;
      }
    }

    this.gamePlay.redrawPositions(this.positionedCharacters);
    
    this.addingCellListener('Enter');
    this.addingCellListener('Leave');
    this.addingCellListener('Click');
  }

  addingCellListener(eventType) { 
//addCellEnterListener - onCellEnter
//addCellLeaveListener - onCellLeave
//addCellClickListener - onCellClick
    let listener = `addCell${eventType}Listener`;
    let callback = `onCell${eventType}`;
    
    let enterFunc = this[callback].bind(this);
    this.gamePlay[listener](enterFunc);
 }

 onCellClick(index) {
    // TODO: react to click
    console.log('click ', index);                 // !!!временно!!!
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    let tooltip;

    if (this.gamePlay.cells[index].hasChildNodes()) {
      const charType = this.gamePlay.cells[index].firstChild.classList[1];
      this.positionedCharacters.forEach((elem) => {
        if (elem.character.type === charType) {
          tooltip = tooltipString(elem.character);
        }
      })

      this.gamePlay.showCellTooltip(tooltip, index);
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }
}
