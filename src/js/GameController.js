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

    this.greenIndex = null;               // последняя ячейка, выделенная зеленым цветом
    this.redIndex = null;                 // последняя ячейка, выделенная красным цветом
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    
    let currentTheme = themes.prairie;
    this.gamePlay.drawUi(currentTheme);

    const charactersNumber = 2;                               // количество персонажей пользователя и компьютера
    const levelNumber = 4;                                    // количество уровней персонажей
    const userTypes = [Bowman, Swordsman, Magician];          // доступные классы пользователя
    const computerTypes = [Vampire, Undead, Daemon];          // доступные классы компьютера
    const positionedCharacters = [];                          // массив позиционированных персонажей 

    const userTeam = generateTeam(userTypes, levelNumber, charactersNumber);                    // команда пользователя
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
      activePlayer: 'user',
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

    let currentChar, tempArray;

    if (GameState.state.activePlayer !== 'user') {
      alert('Дождитесь хода противника');
      return;
    }

    if (GameState.getPositionCharacter(index) !== undefined) {                // в ячейке есть персонаж
      if (charType(index) === 'user') {                                         // в ячейке персонаж пользователя
        if (GameState.state.lastIndex != null) {
          this.gamePlay.deselectCell(GameState.state.lastIndex);
        }
        this.gamePlay.selectCell(index);          
        GameState.state.lastIndex = index;
      } else {                                                                  // в ячейке персонаж компьютера
        if (this.redIndex !== null) {                   // ранее был выбран персонаж пользователя и допустимый диапазон                                
          currentChar = GameState.getPositionCharacter(GameState.state.lastIndex); 
          const target = GameState.getPositionCharacter(this.redIndex);
          const damage = Math.round(Math.max(currentChar.character.attack - target.character.defence, currentChar.character.attack * 0.1));
          
          tempArray = GameState.state.positionedCharacters.filter((elem) => elem !== target);
          target.character.health = target.character.health - damage;
          GameState.state.positionedCharacters = tempArray.concat(target);

          this.gamePlay.showDamage(index, damage)
            .then(() => {
              this.gamePlay.redrawPositions(GameState.state.positionedCharacters);
            });
          this.redIndex = null;
          GameState.state.activePlayer ='bot';
        } else {                                      // нет выбранного персонажа пользователя или ячейка вне допустимого диапазона атаки
          GamePlay.showError("Недопустимое действие");
        }
      }

    } else {                                                                  // пустая ячейка
      if (this.greenIndex !== null) {                   // ранее был выбран персонаж пользователя и допустимый диапазон
        currentChar = GameState.getPositionCharacter(GameState.state.lastIndex);
        
        tempArray = GameState.state.positionedCharacters.filter((elem) => elem !== currentChar);
        currentChar.position = index;
        GameState.state.positionedCharacters = tempArray.concat(currentChar);

        this.gamePlay.deselectCell(GameState.state.lastIndex);
        this.gamePlay.redrawPositions(GameState.state.positionedCharacters);
        this.gamePlay.selectCell(index);
        GameState.state.lastIndex = index;
        this.greenIndex = null;
        GameState.state.activePlayer ='bot';            
      } else {                                          // нет выбранного персонажа пользователя или ячейка вне допустимого диапазона перемещений
        GamePlay.showError("Недопустимое действие");
      }                                                                
    }     
  }

  onCellEnter(index) {
    // react to mouse enter
    
    let currentChar, charOwner;

    if (this.greenIndex !== null) {
      this.gamePlay.deselectCell(this.greenIndex);
      this.greenIndex = null;
    }

    if (this.redIndex !== null) {
      this.gamePlay.deselectCell(this.redIndex);
      this.redIndex = null;
    }

    if (GameState.state.lastIndex !== null) {
      currentChar = GameState.getPositionCharacter(GameState.state.lastIndex);
    }

    const nextChar = GameState.getPositionCharacter(index);
    if (nextChar == undefined) {                                        // пустая ячейка
      if (GameState.state.lastIndex !== null && GameState.state.activePlayer === 'user') {
        if (allowedMoveRange(GameState.state.lastIndex, currentChar.character.moving, this.gamePlay.boardSize).includes(index)) {
          this.gamePlay.selectCell(index, 'green');
          this.greenIndex = index;
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    } else {                                                              // в ячейке есть персонаж 
      const tooltip = tooltipString(nextChar.character);
      this.gamePlay.showCellTooltip(tooltip, index);

      charOwner = charType(index);
      if ( GameState.state.activePlayer === 'user' ) {
        if (charOwner === 'user') {                                                    // в ячейке персонаж пользователя
          this.gamePlay.setCursor(cursors.pointer);
        } else if (GameState.state.lastIndex !== null && charOwner === 'bot') {        // в ячейке персонаж компьютера
          if (allowedAttackRange(GameState.state.lastIndex, currentChar.character.longrange, this.gamePlay.boardSize).includes(index)) {
            this.gamePlay.selectCell(index, 'red');
            this.redIndex = index;
            this.gamePlay.setCursor(cursors.crosshair);
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
        }
      }      
    }
  }

  onCellLeave(index) {
    // react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

}
  