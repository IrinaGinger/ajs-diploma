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

    this.gameLevel = 1;

    this.charactersNumber = 2;                               // количество персонажей пользователя и компьютера
    this.levelNumber = 4;                                    // количество уровней персонажей
    this.userTypes = [Bowman, Swordsman, Magician];          // доступные классы пользователя
    this.computerTypes = [Vampire, Undead, Daemon];          // доступные классы компьютера

    this.lastIndex = null;                // последняя выбранная ячейка с персонажем пользователя
    this.greenIndex = null;               // последняя ячейка, выделенная зеленым цветом
    this.redIndex = null;                 // последняя ячейка, выделенная красным цветом

    this.userWin = 0;                     // кол-во побед пользователя

  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
   
    this.gamePlay.drawUi(Object.values(themes)[this.gameLevel - 1]);

    const positionedCharacters = [];                          // массив позиционированных персонажей 

    if (this.gameLevel === 1) {
      this.userTeam = generateTeam(this.userTypes, this.levelNumber, this.charactersNumber);                    // команда пользователя
      positionedCharacters.push(...teamStart(this.userTeam, 'user', this.gamePlay.boardSize));
    } else {
      for (let i = 0; i < GameState.state.userTeam.characters.length; i++) {
        GameState.state.positionedCharacters[i].character = characterLevelUp(GameState.state.positionedCharacters[i].character);
        positionedCharacters.push(GameState.state.positionedCharacters[i]);
      }
    }

    this.computerTeam = generateTeam(this.computerTypes, this.levelNumber, this.charactersNumber);            // команда компьютера
    positionedCharacters.push(...teamStart(this.computerTeam, 'bot', this.gamePlay.boardSize));  

    console.log('старт уровня ', this.gameLevel);
    console.log('команда пользователя ', this.userTeam);
    console.log('команда компьютера', this.computerTeam);

    GameState.from({
      gameLevel: this.gameLevel,
      userTeam: this.userTeam,
      computerTeam: this.computerTeam,
      positionedCharacters: positionedCharacters,
      lastIndex: this.lastIndex,
      activePlayer: 'user',
      userWin: this.userWin,
    });

    this.gamePlay.redrawPositions(GameState.state.positionedCharacters);
    
    this.addingCellListener('Enter');
    this.addingCellListener('Leave');
    this.addingCellListener('Click');

    let newGameFunc = this.newGameCall.bind(this);
    this.gamePlay.addNewGameListener(newGameFunc);

    let saveGameFunc = this.saveGameCall.bind(this);
    this.gamePlay.addSaveGameListener(saveGameFunc);

    let loadGameFunc = this.loadGameCall.bind(this);
    this.gamePlay.addLoadGameListener(loadGameFunc);
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

  // старт новой игры
  newGameCall() {
    GamePlay.removeEventListeners();
    this.gameLevel = 1;
    this.init();
  }

  // сохранение игры
  saveGameCall() {
    this.stateService.save(GameState.state);
  }

  // загрузка состояния игры
  loadGameCall() {
    GameState.from(this.stateService.load());
    this.gameLevel = GameState.state.gameLevel;
    this.userTeam = GameState.state.userTeam;
    this.computerTeam = GameState.state.computerTeam;
    this.gamePlay.redrawPositions(GameState.state.positionedCharacters);
  }

  onCellClick(index) {
    // TODO: react to click

    let currentChar, tempArray;
    let compActionFunc = compAction.bind(this);

    if (GameState.state.activePlayer !== 'user') {
      alert('Дождитесь хода противника');
      return;
    }

    if (GameState.getPositionCharacter(index) !== undefined) {                // в ячейке есть персонаж
      if (charType(index) === 'user') {                                         // в ячейке персонаж пользователя
        if (GameState.state.lastIndex !== null) {
          this.gamePlay.deselectCell(GameState.state.lastIndex);
        }
        this.gamePlay.selectCell(index);          
        GameState.state.lastIndex = index;
      } else {                                                                  // в ячейке персонаж компьютера
        if (this.redIndex !== null) {                   // ранее был выбран персонаж пользователя и допустимый диапазон атаки                             
          currentChar = GameState.getPositionCharacter(GameState.state.lastIndex);
          const target = GameState.getPositionCharacter(this.redIndex);
          const damage = Math.round(Math.max(currentChar.character.attack - target.character.defence, currentChar.character.attack * 0.1));
          
          tempArray = GameState.state.positionedCharacters.filter((elem) => elem !== target);
          target.character.health = Math.max(target.character.health - damage, 0);
          GameState.state.positionedCharacters = tempArray.concat(target);

          console.log(`пользователь атаковал персонажем ${currentChar.character.type}, цель: ${target.character.type}, урон ${damage}, следующий ход компьютера`);
          
          this.redIndex = null;
          this.gamePlay.deselectCell(GameState.state.lastIndex);
          this.gamePlay.deselectCell(index);
          GameState.state.activePlayer ='bot';
           
          this.gamePlay.showDamage(index, damage)
            .then(() => {
              if (target.character.health === 0) {
                GameState.state.positionedCharacters = GameState.state.positionedCharacters.filter((elem) => elem !== target);
                GameState.state.lastIndex = null;
                GameState.state.computerTeam.characters.splice(GameState.state.computerTeam.characters.indexOf(target.character), 1);
                
                console.log(`смерть персонажа ${target.character.type}`);
              }

              this.gamePlay.redrawPositions(GameState.state.positionedCharacters);

              if (GameState.state.computerTeam.characters.length === 0) {
                GamePlay.removeEventListeners();
                GamePlay.showMessage('Уровень пройден');

                this.userWin += 1;
                GameState.state.userWin = this.userWin;

                if (this.gameLevel < 4) {
                  this.gameLevel += 1;
                  GameState.state.gameLevel = this.gameLevel;
                  this.init();
                } else {
                  GamePlay.showMessage('Игра завершена. Вы победили!');
                }                
              } else {
                compActionFunc(this.gamePlay.boardSize);
              }
            });
          
        } else {                                      // нет выбранного персонажа пользователя или ячейка вне допустимого диапазона атаки
          GamePlay.showError("Недопустимое действие");
        }
      }

    } else {                                                                  // пустая ячейка
      if (this.greenIndex !== null) {                   // ранее был выбран персонаж пользователя и допустимый диапазон перемещения
        currentChar = GameState.getPositionCharacter(GameState.state.lastIndex);
        
        tempArray = GameState.state.positionedCharacters.filter((elem) => elem !== currentChar);
        currentChar.position = index;
        GameState.state.positionedCharacters = tempArray.concat(currentChar);

        this.gamePlay.deselectCell(GameState.state.lastIndex);
        this.gamePlay.deselectCell(index);
        this.gamePlay.redrawPositions(GameState.state.positionedCharacters);
        
        console.log(`пользователь переместил персонажа ${currentChar.character.type} с поз. ${GameState.state.lastIndex} на поз. ${index}, следующий ход компьютера`);
        GameState.state.lastIndex = index;
        this.greenIndex = null;
        GameState.state.activePlayer ='bot';

        compActionFunc(this.gamePlay.boardSize);         
           
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
  