import Character from '../Character';

test('создание объекта класса Character выбрасывает ошибку', () => {
  expect(() => new Character(1)).toThrow(new Error('Создание объекта класса Character запрещено'));
});