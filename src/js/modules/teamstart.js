// функция заполняет массив позиционированных персонажей

import PositionedCharacter from '../PositionedCharacter';

export default function teamStart(team, playerType, boardSize) {
    let charPosition, positionedCharacters = [];

    let i = 0;
    
    while (i < team.characters.length) {
        if (playerType === 'user') {
            charPosition = Math.floor(Math.random() * (boardSize)) * boardSize + i;
        } else if (playerType === 'bot') {
            charPosition = Math.floor(Math.random() * (boardSize)) * boardSize + (boardSize - i - 1);
        } else {
            throw new Error('Неверно указан тип игрока');
        }

        if (positionedCharacters.find((elem) => elem.position === charPosition) == undefined) {
            positionedCharacters.push(new PositionedCharacter(team.characters[i], charPosition));
            i++;
        }
    }

    return positionedCharacters;
}