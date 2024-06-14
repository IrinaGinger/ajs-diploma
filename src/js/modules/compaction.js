import GamePlay from '../GamePlay';
import {allowedMoveRange, allowedAttackRange} from './range';

export default function compAction() {
// gameState, boardSize

  // формируем позиционированные списки команд пользователя и компьютера
  let userTeamPositioned = [];
  let compTeamPositioned = [];
  let tempArray = [];

  this.gameState.positionedCharacters.forEach(elem => {
    for (let i = 0; i < this.gameState.userTeam.characters.length; i++) {
      if (elem.character.type === this.gameState.userTeam.characters[i].type && !userTeamPositioned.includes(elem)) {
        userTeamPositioned.push(elem);
      }
    }
    for (let i = 0; i < this.gameState.computerTeam.characters.length; i++) {
      if (elem.character.type === this.gameState.computerTeam.characters[i].type && !compTeamPositioned.includes(elem)) {
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
      if (allowedAttackRange(currentChar.position, currentChar.character.longrange, this.gamePlay.boardSize).includes(elem.position)) {  

        if (this.gameState.activePlayer ==='bot') {
          const target = this.gameState.getPositionCharacter(elem.position);
          const damage = Math.round(Math.max(currentChar.character.attack - target.character.defence, currentChar.character.attack * 0.1));
          
          tempArray = this.gameState.positionedCharacters.filter((item) => item !== target);
          target.character.health = Math.max(target.character.health - damage, 0);
          this.gameState.positionedCharacters = tempArray.concat(target);
          
          this.gameState.activePlayer ='user';
          
          this.gamePlay.showDamage(elem.position, damage)
            .then(() => {
              console.log(`компьютер атаковал персонажем ${currentChar.character.type}, цель: ${target.character.type}, урон ${damage}, следующий ход пользователя`);

              if (target.character.health === 0) {
                this.gameState.positionedCharacters = this.gameState.positionedCharacters.filter((item) => item !== target);
                this.gameState.userTeam.characters.splice(this.gameState.userTeam.characters.indexOf(target.character), 1);
                
                this.gameState.lastIndex = null;
                console.log(`смерть персонажа ${target.character.type}`);
              }

              this.gamePlay.redrawPositions(this.gameState.positionedCharacters);

              if (this.gameState.userTeam.characters.length === 0) {
                GamePlay.showMessage('Game Over');
              }

              return;
            });
        }
      }
    })
  });
  
  // если не нашлось ни одного персонажа пользователя в диапазоне атаки всех персонажей компьютера
  if (this.gameState.activePlayer === 'bot') {
    let compMovingArray = [];
    let userSurround = [];
    let newPosition = -1;

    compTeamPositioned.forEach(currentChar => {
      // формируем массив из всех возможных точек перемещения персонажа компьютера
      compMovingArray = allowedMoveRange(currentChar.position, currentChar.character.moving, this.gamePlay.boardSize);

      this.gameState.positionedCharacters.forEach(elem => {
        // удаляем из допустимого диапазона позиции, занятые другими персонажами
        if (compMovingArray.includes(elem.position)) {
          compMovingArray.filter(item => {item !== elem.position})
        }
      })    

      for (let j = 0; j < userTeamPositioned.length; j++) {
        if (newPosition < 0) {

          // формируем массив клеток, из которых можно осуществить атаку на персонажа пользователя 
          userSurround = allowedAttackRange(userTeamPositioned[j].position, currentChar.character.longrange, this.gamePlay.boardSize);
                  
          // проверяем, можно ли подойти на расстояние атаки к персонажу игрока
          for (let i = 0; i < compMovingArray.length; i++) {
            if (userSurround.includes(compMovingArray[i])) {
              newPosition = compMovingArray[i];
              
              // удаляем персонажа компьютера из текущей позиции и присваиваем ему новую
              console.log(`компьютер переместил персонажа ${currentChar.character.type} с поз. ${currentChar.position} на поз. ${newPosition}, следующий ход пользователя`);
              
              tempArray = this.gameState.positionedCharacters.filter(elem => elem !== currentChar);
              currentChar.position = newPosition;
              this.gameState.positionedCharacters = tempArray.concat(currentChar);

              this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
                            
              this.gameState.activePlayer ='user';
              break;
            }
          }
        }
      }
    });
      
    // если на расстояние атаки к персонажу пользователя подойти нельзя
    // перемещаем самого сильного персонажа компьютера на максимально близкое расстояние
    if (this.gameState.activePlayer === 'bot') {
      let currentRange = 1;
      compMovingArray = allowedMoveRange(compTeamPositioned[0].position, compTeamPositioned[0].character.moving, this.gamePlay.boardSize);

      this.gameState.positionedCharacters.forEach(elem => {
        // удаляем из допустимого диапазона позиции, занятые другими персонажами
        if (compMovingArray.includes(elem.position)) {
          compMovingArray.filter(item => {item !== elem.position})
        }
      })    

      for (let i = 0; i < userTeamPositioned.length; i++) {
        userSurround.push(allowedAttackRange(userTeamPositioned[i].position, compTeamPositioned[0].character.longrange, this.gamePlay.boardSize));
      }

      while (newPosition < 0) {
        for (let i = 0; i < compMovingArray.length; i++) {
          if (newPosition < 0) {
            for (let j = 0; j < userSurround.length; j++) {
              if (Math.abs(compMovingArray[i] - userSurround[j]) === currentRange || 
              Math.abs(compMovingArray[i] - userSurround[j]) === this.gamePlay.boardSize + currentRange - 1) {
                newPosition = compMovingArray[i];
                
                // удаляем персонажа компьютера из текущей позиции и присваиваем ему новую
                console.log(`компьютер переместил персонажа ${compTeamPositioned[0].character.type} с поз. ${compTeamPositioned[0].position} на поз. ${newPosition}, следующий ход пользователя`);
                
                tempArray = this.gameState.positionedCharacters.filter((elem) => elem !== compTeamPositioned[0]);
                compTeamPositioned[0].position = newPosition;
                this.gameState.positionedCharacters = tempArray.concat(compTeamPositioned[0]);

                this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
                              
                this.gameState.activePlayer ='user';
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
