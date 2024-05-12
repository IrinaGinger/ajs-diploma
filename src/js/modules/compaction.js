import GamePlay from '../GamePlay';
import GameState from '../GameState';
import {allowedMoveRange, allowedAttackRange} from './range';

export default function compAction(boardSize) {
  // формируем позиционированные списки команд пользователя и компьютера
  let userTeamPositioned = [];
  let compTeamPositioned = [];
  let tempArray = [];

  GameState.state.positionedCharacters.forEach(elem => {
    for (let i = 0; i < GameState.state.userTeam.characters.length; i++) {
      if (elem.character.type === GameState.state.userTeam.characters[i].type && !userTeamPositioned.includes(elem)) {
        userTeamPositioned.push(elem);
      }
    }
    for (let i = 0; i < GameState.state.computerTeam.characters.length; i++) {
      // console.log(GameState.state.computerTeam.characters[i].type);

      if (elem.character.type === GameState.state.computerTeam.characters[i].type && !compTeamPositioned.includes(elem)) {
        compTeamPositioned.push(elem);
      }
    }
  });

  // сортируем персонажей компьютера (начиная с наибольшей силы атаки) 
  compTeamPositioned.sort((a, b) => {
    if (a.character.attack < b.character.attack) {
        return 1;
    }
    if (a.character.attack > b.character.attack) {
        return -1;
    }
    return 0;
  });
  
  // начиная с самого сильного персонажа компьютера пытаемся найти цель для атаки
  compTeamPositioned.forEach(currentChar => {
    
    userTeamPositioned.forEach(elem => {
      // выбираем первого персонажа пользователя, который находится в диапазоне атаки
      if (allowedAttackRange(currentChar.position, currentChar.character.longrange, boardSize).includes(elem.position)) {  

        if (GameState.state.activePlayer ==='bot') {
          const target = GameState.getPositionCharacter(elem.position);
          const damage = Math.round(Math.max(currentChar.character.attack - target.character.defence, currentChar.character.attack * 0.1));
          
          tempArray = GameState.state.positionedCharacters.filter((item) => item !== target);
          target.character.health = Math.max(target.character.health - damage, 0);
          GameState.state.positionedCharacters = tempArray.concat(target);
          
          GameState.state.activePlayer ='user';
          console.log(`компьютер атаковал персонажем ${currentChar.character.type}, цель: ${target.character.type}, урон ${damage}, следующий ход пользователя`);

          this.gamePlay.showDamage(elem.position, damage)
            .then(() => {
              if (target.character.health === 0) {
                GameState.state.positionedCharacters = GameState.state.positionedCharacters.filter((item) => item !== target);
                GameState.state.userTeam.characters.splice(GameState.state.userTeam.characters.indexOf(target.character), 1);
                
                GameState.state.lastIndex = null;
                console.log(`смерть персонажа ${target.character.type}`);
              }

              this.gamePlay.redrawPositions(GameState.state.positionedCharacters);

              if (GameState.state.userTeam.characters.length === 0) {
                GamePlay.removeEventListeners(); 
                GamePlay.showMessage('Game Over');
              }
              
              return;
            });
        }
      }
    })
  });
  
  // если не нашлось ни одного персонажа пользователя в диапазоне атаки всех персонажей компьютера
  if (GameState.state.activePlayer ==='bot') {
    let compMovingArray = [];
    let userSurround = [];
    let newPosition = -1;

    compTeamPositioned.forEach(currentChar => {
      // формируем массив из всех возможных точек перемещения персонажа компьютера
      compMovingArray = allowedMoveRange(currentChar.position, currentChar.character.moving, boardSize);

      GameState.state.positionedCharacters.forEach(elem => {
        // удаляем из допустимого диапазона позиции, занятые другими персонажами
        if (compMovingArray.includes(elem.position)) {
          compMovingArray.filter(item => {item !== elem.position})
        }
      })    

      for (let j = 0; j < userTeamPositioned.length; j++) {
        if (newPosition < 0) {

          // формируем массив клеток, из которых можно осуществить атаку на персонажа пользователя 
          userSurround = allowedAttackRange(userTeamPositioned[j].position, currentChar.character.longrange, boardSize);
                  
          // проверяем, можно ли подойти на расстояние атаки к персонажу игрока
          for (let i = 0; i < compMovingArray.length; i++) {
            if (userSurround.includes(compMovingArray[i])) {
              newPosition = compMovingArray[i];
              
              // удаляем персонажа компьютера из текущей позиции и присваиваем ему новую
              console.log(`компьютер переместил персонажа ${currentChar.character.type} с поз. ${currentChar.position} на поз. ${newPosition}, следующий ход пользователя`);
              
              tempArray = GameState.state.positionedCharacters.filter(elem => elem !== currentChar);
              currentChar.position = newPosition;
              GameState.state.positionedCharacters = tempArray.concat(currentChar);

              this.gamePlay.redrawPositions(GameState.state.positionedCharacters);
                            
              GameState.state.activePlayer ='user';
              break;
            }
          }
        }
      }
    });
      
    // если на расстояние атаки к персонажу пользователя подойти нельзя
    // перемещаем самого сильного персонажа компьютера на максимально близкое расстояние
    if (GameState.state.activePlayer ==='bot') {
      let currentRange = 1;
      compMovingArray = allowedMoveRange(compTeamPositioned[0].position, compTeamPositioned[0].character.moving, boardSize);

      GameState.state.positionedCharacters.forEach(elem => {
        // удаляем из допустимого диапазона позиции, занятые другими персонажами
        if (compMovingArray.includes(elem.position)) {
          compMovingArray.filter(item => {item !== elem.position})
        }
      })    

      for (let i = 0; i < userTeamPositioned.length; i++) {
        userSurround.push(allowedAttackRange(userTeamPositioned[i].position, compTeamPositioned[0].character.longrange, boardSize));
      }

      while (newPosition < 0) {
        for (let i = 0; i < compMovingArray.length; i++) {
          if (newPosition < 0) {
            for (let j = 0; j < userSurround.length; j++) {
              if (Math.abs(compMovingArray[i] - userSurround[j]) === currentRange || 
              Math.abs(compMovingArray[i] - userSurround[j]) === boardSize + currentRange - 1) {
                newPosition = compMovingArray[i];
                
                // удаляем персонажа компьютера из текущей позиции и присваиваем ему новую
                console.log(`компьютер переместил персонажа ${compTeamPositioned[0].character.type} с поз. ${compTeamPositioned[0].position} на поз. ${newPosition}, следующий ход пользователя`);
                
                tempArray = GameState.state.positionedCharacters.filter((elem) => elem !== compTeamPositioned[0]);
                compTeamPositioned[0].position = newPosition;
                GameState.state.positionedCharacters = tempArray.concat(compTeamPositioned[0]);

                this.gamePlay.redrawPositions(GameState.state.positionedCharacters);
                              
                GameState.state.activePlayer ='user';
                break;
              }
            }
          }
        }
        currentRange += 1;
      }
    }

    return;
    
  }
}
