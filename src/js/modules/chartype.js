import GameState from '../GameState';

// функция возвращает тип персонажа в клетке

export default function charType(index) {
    const positionCharacter = GameState.getPositionCharacter(index);

    if (!positionCharacter) {
        return null;
    }

    return GameState.state.userTeam.characters.includes(positionCharacter.character) ? 'user' : 'bot';
}