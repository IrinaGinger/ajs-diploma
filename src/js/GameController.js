import themes from './themes';

import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

import PositionedCharacter from './PositionedCharacter';

import {generateTeam} from './generators';

import tooltipString from './tooltip';

import GamePlay from './GamePlay';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.currentTheme = '';             // текущая тема
    this.playerTeam = {};               // команда игрока
    this.computerTeam = {};             // команда компьютера
    this.positionedCharacters = [];     // массив позиционированных персонажей 

    this.activePlayer = 1;              // чей следующий ход (1 - игрок, 2 - компьютер)
    this.lastIndex = null;              // последняя выбранная ячейка с персонажем игрока
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    
    this.currentTheme = themes.prairie;
    this.gamePlay.drawUi(this.currentTheme);

    const charactersNumber = 2;                                                        // количество персонажей игрока и компьютера
    const levelNumber = 4;                                                             // количество уровней персонажей
    const playerTypes = [Bowman, Swordsman, Magician];                                 // доступные классы игрока
    const computerTypes = [Vampire, Undead, Daemon];                                   // доступные классы компьютера

    this.teamStart(charactersNumber, levelNumber, playerTypes, computerTypes);

    this.gamePlay.redrawPositions(this.positionedCharacters);

    GameState.from({
      theme: this.currentTheme,
      playerTeam: this.playerTeam,
      computerTeam: this.computerTeam,
      positionedCharacters: this.positionedCharacters,
      lastIndex: this.lastIndex,
      activePlayer: this.activePlayer,
    });
    
    this.addingCellListener('Enter');
    this.addingCellListener('Leave');
    this.addingCellListener('Click');
  }

  teamStart(charNumber, levelNumber, playerTypes, computerTypes) {
    this.playerTeam = generateTeam(playerTypes, levelNumber, charNumber);      // формирование команды игрока 
    this.computerTeam = generateTeam(computerTypes, levelNumber, charNumber);  // формирование команды компьютера 

    let isPosition;

    let i = 0;
    while (i < charNumber) {
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
    while (i < charNumber) {
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
    console.log(GameState.state);
    if (GameState.state.activePlayer === 1) {

      if (this.gamePlay.cells[index].hasChildNodes()) {
        const charType = this.gamePlay.cells[index].firstChild.classList[1];
        let isType = false;
        
        for (let j = 0; j < this.playerTeam.characters.length; j++) {
          if (this.playerTeam.characters[j].type === charType) {
            isType = true;
            break;
          }
        }

        if (isType) {
          if (this.lastIndex != null) {
            this.gamePlay.deselectCell(this.lastIndex);
          }
          this.gamePlay.selectCell(index);
          this.lastIndex = index;

          GameState.from({
            theme: this.currentTheme,
            playerTeam: this.playerTeam,
            computerTeam: this.computerTeam,
            positionedCharacters: this.positionedCharacters,
            lastIndex: this.lastIndex,
            activePlayer: this.activePlayer,
          });
        } else {
          GamePlay.showError("Чужой персонаж");
        }

      } else {
        GamePlay.showError("Ячейка пуста");
      }
    }
  }

  onCellEnter(index) {
    // react to mouse enter
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
    // react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }
}
