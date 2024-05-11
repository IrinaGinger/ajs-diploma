import Team from './Team';
import characterLevelUp from './modules/levelup';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    let typeNumber = Math.floor(Math.random() * allowedTypes.length);
    let level = Math.floor(Math.random() * maxLevel) + 1;
    let randomClass = allowedTypes[typeNumber];
    let char = new randomClass(1);

    for (let j = 2; j <= level; j++) {
      char = characterLevelUp(char);
    }

    yield char;
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let charactersArray = [];
  const teamGenerator = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i++) {
    charactersArray.push(teamGenerator.next().value);
  }
  return new Team(charactersArray);
}
