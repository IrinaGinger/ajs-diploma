import themes from './themes';

import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

import {generateTeam} from './generators';
import teamStart from './modules/teamstart';
import charType from './modules/chartype';

import tooltipString from './modules/tooltip';
import {allowedMoveRange, allowedAttackRange} from './modules/range';

import cursors from './cursors';

import GamePlay from './GamePlay';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.activePlayer = 'user';         // текущий игрок (чей следующий ход)
    this.aimIndex = null;               // последняя ячейка, выделенная зеленым или красным цветом
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    
    let currentTheme = themes.prairie;
    this.gamePlay.drawUi(currentTheme);

    const charactersNumber = 2;                               // количество персонажей игрока и компьютера
    const levelNumber = 4;                                    // количество уровней персонажей
    const userTypes = [Bowman, Swordsman, Magician];          // доступные классы игрока
    const computerTypes = [Vampire, Undead, Daemon];          // доступные классы компьютера
    const positionedCharacters = [];                          // массив позиционированных персонажей 

    const userTeam = generateTeam(userTypes, levelNumber, charactersNumber);                    // команда игрока
    const computerTeam = generateTeam(computerTypes, levelNumber, charactersNumber);            // команда компьютера
    
    positionedCharacters.push(...teamStart(userTeam, 'user', this.gamePlay.boardSize));
    positionedCharacters.push(...teamStart(computerTeam, 'bot', this.gamePlay.boardSize));  

    this.gamePlay.redrawPositions(positionedCharacters);

    GameState.from({
      theme: currentTheme,
      userTeam: userTeam,
      computerTeam: computerTeam,
      positionedCharacters: positionedCharacters,
      lastIndex: null,
      activePlayer: this.activePlayer,
    });
    
    this.addingCellListener('Enter');
    this.addingCellListener('Leave');
    this.addingCellListener('Click');
  }

  // формирование слушателя соответствующего типа с вызовом соответствующего callback
    //addCellEnterListener - onCellEnter
    //addCellLeaveListener - onCellLeave
    //addCellClickListener - onCellClick
  addingCellListener(eventType) { 

    let listener = `addCell${eventType}Listener`;
    let callback = `onCell${eventType}`;
    
    let enterFunc = this[callback].bind(this);
    this.gamePlay[listener](enterFunc);
 }

 onCellClick(index) {
    // TODO: react to click

    if (GameState.state.activePlayer === 'user') {

      if (GameState.getPositionCharacter(index) !== undefined) {
        if (charType(index) === 'user') {
          if (GameState.state.lastIndex != null) {
            this.gamePlay.deselectCell(GameState.state.lastIndex);
          }
          this.gamePlay.selectCell(index);          
          GameState.state.lastIndex = index;
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

    let currentChar;

    if (this.aimIndex !== null) {
      this.gamePlay.deselectCell(this.aimIndex);
    }

    if (GameState.state.lastIndex !== null) {
      currentChar = GameState.getPositionCharacter(GameState.state.lastIndex);
    }

    const nextChar = GameState.getPositionCharacter(index);
    if (nextChar !== undefined) {                                        // в ячейке есть персонаж
      const tooltip = tooltipString(nextChar.character);
      this.gamePlay.showCellTooltip(tooltip, index);

      if ((GameState.state.lastIndex !== null) && GameState.state.activePlayer === 'user') {
        if (charType(index) === 'user') {                                                    // в ячейке персонаж игрока
          this.gamePlay.setCursor(cursors.pointer);
        } else if (charType(index) === 'bot') {                                             // в ячейке персонаж компьютера
          if (allowedAttackRange(GameState.state.lastIndex, currentChar.character.longrange, this.gamePlay.boardSize).includes(index)) {
            this.gamePlay.selectCell(index, 'red');
            this.aimIndex = index;
            this.gamePlay.setCursor(cursors.crosshair);
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
        }
      }
    } else {                                                                                  // пустая ячейка 
      if (GameState.state.lastIndex !== null) {
        if (allowedMoveRange(GameState.state.lastIndex, currentChar.character.moving, this.gamePlay.boardSize).includes(index)) {
          this.gamePlay.selectCell(index, 'green');
          this.aimIndex = index;
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    // react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }

}
  