export default class GameState {
  static state = {};

  static from(object) {
    // TODO: create object
    if (typeof object === 'object') {
      this.state = object;
    }

    return null;
  }

  static getPositionCharacter(index) {
    return this.state.positionedCharacters.find((elem) => elem.position === index);
  }
}
