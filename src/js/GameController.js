import themes from './themes';

import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';

import {generateTeam} from './generators';
import teamStart from './modules/teamstart';
import compAction from './modules/compaction';
import characterLevelUp from './modules/levelup';

import tooltipString from './modules/tooltip';
import {allowedMoveRange, allowedAttackRange} from './modules/range';

import cursors from './cursors';

import GamePlay from './GamePlay';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    
    this.charactersNumber = 2;                               // количество персонажей пользователя и компьютера
    this.levelNumber = 4;                                    // количество уровней персонажей
    this.userTypes = [Bowman, Swordsman, Magician];          // доступные классы пользователя
    this.computerTypes = [Vampire, Undead, Daemon];          // доступные классы компьютера

    this.greenIndex = null;               // последняя ячейка, выделенная зеленым цветом
    this.redIndex = null;                 // последняя ячейка, выделенная красным цветом

    this.gameState = new GameState(1, null, 'user', 0);
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
   
    this.gamePlay.drawUi(Object.values(themes)[this.gameState.gameLevel - 1]);

    const positionedCharacters = [];                          // массив позиционированных персонажей 

    if (this.gameState.gameLevel === 1) {
      this.gameState.userTeam = generateTeam(this.userTypes, this.levelNumber, this.charactersNumber);      // формирование команды пользователя
      positionedCharacters.push(...teamStart(this.gameState.userTeam, 'user', this.gamePlay.boardSize));
    } else {
      for (let i = 0; i < this.gameState.userTeam.characters.length; i++) {
        this.gameState.positionedCharacters[i].character = characterLevelUp(this.gameState.positionedCharacters[i].character);
        positionedCharacters.push(this.gameState.positionedCharacters[i]);
      }
    }

    this.gameState.computerTeam = generateTeam(this.computerTypes, this.levelNumber, this.charactersNumber);   // формирование команды компьютера
    positionedCharacters.push(...teamStart(this.gameState.computerTeam, 'bot', this.gamePlay.boardSize));  

    console.log('старт уровня ', this.gameState.gameLevel);
    console.log('команда пользователя: ', this.gameState.userTeam);
    console.log('команда компьютера: ', this.gameState.computerTeam);

    this.gameState.positionedCharacters = positionedCharacters;

    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
    
    this.addingCellListener('Enter');
    this.addingCellListener('Leave');
    this.addingCellListener('Click');

    this.gamePlay.addNewGameListener(this.newGameCall.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGameCall.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGameCall.bind(this));
  }

  // формирование слушателя соответствующего типа с вызовом соответствующего callback
    //addCellEnterListener - onCellEnter
    //addCellLeaveListener - onCellLeave
    //addCellClickListener - onCellClick
  addingCellListener(eventType) { 
    const enterFunc = this[`onCell${eventType}`].bind(this);
    this.gamePlay[`addCell${eventType}Listener`](enterFunc);
  }

  charType(index) {
    const posChar = this.gameState.getPositionCharacter(index);
    if (!posChar) {
        return null;
    }

    return this.gameState.userTeam.characters.includes(posChar.character) ? 'user' : 'bot';
  }

  // старт новой игры
  newGameCall() {
    this.gamePlay.removeCellListeners();
    this.gamePlay.removeGameListeners();

    this.gameState = new GameState(1, null, 'user', this.gameState.userWin);
    this.init();
  }

  // сохранение игры
  saveGameCall() {
    this.stateService.save(this.gameState);
  }

  // загрузка состояния игры
  loadGameCall() {
    const data = this.stateService.load();
    if (!data) {
      GamePlay.showMessage('Нет сохраненных игр');
      return;
    }
    this.gameState = GameState.from(data);
    this.gamePlay.drawUi(Object.values(themes)[this.gameState.gameLevel - 1]);
    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
    if (this.gameState.lastIndex) {
      this.gamePlay.selectCell(this.gameState.lastIndex);
    }
  }

  onCellClick(index) {
    // TODO: react to click

    let currentChar, tempArray;
    let compActionFunc = compAction.bind(this);

    if (this.gameState.activePlayer !== 'user') {
      alert('Дождитесь хода противника');
      return;
    }

    if (this.gameState.getPositionCharacter(index) !== undefined) {                // в ячейке есть персонаж
      if (this.charType(index) === 'user') {                                         // в ячейке персонаж пользователя
        if (this.gameState.lastIndex !== null) {
          this.gamePlay.deselectCell(this.gameState.lastIndex);
        }
        this.gamePlay.selectCell(index);          
        this.gameState.lastIndex = index;
      } else {                                                                  // в ячейке персонаж компьютера
        if (this.redIndex !== null) {                   // ранее был выбран персонаж пользователя и допустимый диапазон атаки                             
          currentChar = this.gameState.getPositionCharacter(this.gameState.lastIndex);
          const target = this.gameState.getPositionCharacter(this.redIndex);
          const damage = Math.round(Math.max(currentChar.character.attack - target.character.defence, currentChar.character.attack * 0.1));
          
          tempArray = this.gameState.positionedCharacters.filter((elem) => elem !== target);
          target.character.health = Math.max(target.character.health - damage, 0);
          this.gameState.positionedCharacters = tempArray.concat(target);

          this.redIndex = null;
          this.gamePlay.deselectCell(this.gameState.lastIndex);
          this.gamePlay.deselectCell(index);
          this.gameState.activePlayer ='bot';
           
          this.gamePlay.showDamage(index, damage)
            .then(() => {
              console.log(`пользователь атаковал персонажем ${currentChar.character.type}, цель: ${target.character.type}, урон ${damage}, следующий ход компьютера`);
          
              if (target.character.health === 0) {
                this.gameState.positionedCharacters = this.gameState.positionedCharacters.filter((elem) => elem !== target);
                this.gameState.lastIndex = null;
                this.gameState.computerTeam.characters.splice(this.gameState.computerTeam.characters.indexOf(target.character), 1);
                
                console.log(`смерть персонажа ${target.character.type}`);
              }

              this.gamePlay.redrawPositions(this.gameState.positionedCharacters);

              if (this.gameState.computerTeam.characters.length === 0) {
                this.gamePlay.removeCellListeners();
                GamePlay.showMessage('Уровень пройден');

                this.gameState.userWin += 1;
                
                if (this.gameState.gameLevel < 4) {
                  this.gameState.gameLevel += 1;
                  this.gameState.activePlayer = 'user';

                  this.gamePlay.removeGameListeners();
                  this.init();
                } else {
                  GamePlay.showMessage('Игра завершена. Вы победили!');
                }                
              } else {
                compActionFunc();
              }
            });
          
        } else {                                      // нет выбранного персонажа пользователя или ячейка вне допустимого диапазона атаки
          GamePlay.showError("Недопустимое действие");
        }
      }

    } else {                                                                  // пустая ячейка
      if (this.gameState.activePlayer === 'user' && this.greenIndex !== null) {      // ранее был выбран персонаж пользователя и допустимый диапазон перемещения
        currentChar = this.gameState.getPositionCharacter(this.gameState.lastIndex);
        
        tempArray = this.gameState.positionedCharacters.filter((elem) => elem !== currentChar);
        currentChar.position = index;
        this.gameState.positionedCharacters = tempArray.concat(currentChar);

        this.gamePlay.deselectCell(this.gameState.lastIndex);
        this.gamePlay.deselectCell(index);
        this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
        
        console.log(`пользователь переместил персонажа ${currentChar.character.type} с поз. ${this.gameState.lastIndex} на поз. ${index}, следующий ход компьютера`);
        this.gameState.lastIndex = index;
        this.greenIndex = null;
        this.gameState.activePlayer ='bot';

        compActionFunc();

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

    if (this.gameState.lastIndex !== null) {
      currentChar = this.gameState.getPositionCharacter(this.gameState.lastIndex);
    }

    const nextChar = this.gameState.getPositionCharacter(index);
    
    if (nextChar == undefined) {                                        // пустая ячейка
      if (this.gameState.lastIndex !== null && this.gameState.activePlayer === 'user') {
        if (allowedMoveRange(this.gameState.lastIndex, currentChar.character.moving, this.gamePlay.boardSize).includes(index)) {
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

      charOwner = this.charType(index);

      if ( this.gameState.activePlayer === 'user' ) {
        if (charOwner === 'user') {                                                    // в ячейке персонаж пользователя
          this.gamePlay.setCursor(cursors.pointer);
        } else if (this.gameState.lastIndex !== null && charOwner === 'bot') {        // в ячейке персонаж компьютера
          if (allowedAttackRange(this.gameState.lastIndex, currentChar.character.longrange, this.gamePlay.boardSize).includes(index)) {
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
  