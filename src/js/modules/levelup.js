export default function characterLevelUp(character) {
  character.attack = Math.round(Math.max(character.attack, character.attack * (80 + character.health) / 100));
  character.defence = Math.round(Math.max(character.defence, character.defence * (80 + character.health) / 100));
  character.health = Math.min(character.health + 80, 100);
  character.level = Math.min(character.level + 1, 4);
  return character;
}