import GameStateService from '../GameStateService';

const stateService = new GameStateService('');

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

test('load should be success', () => {  
  const result = {
    gameLevel: 1,              
    userTeam: {
      characters: [
        { type: 'bowman', level: 4, attack: 106, defence: 106, health: 100, moving: 2, longrange: 2 },
        { type: 'swordsman', level: 3, attack: 94, defence: 23, health: 100, moving: 4, longrange: 1 }
      ]
    },                       
    computerTeam: {
      characters: [
        { type: 'undead', level: 4, attack: 169, defence: 41, health: 100, moving: 4, longrange: 1 },
        { type: 'vampire', level: 1, attack: 25, defence: 25, health: 50, moving: 2, longrange: 2 }
      ]
    },                                
    positionedCharacters: [
      {
        character: { type: 'bowman', level: 4, attack: 106, defence: 106, health: 100, moving: 2, longrange: 2 },
        position: 0
      },
      {
        character: { type: 'swordsman', level: 3, attack: 94, defence: 23, health: 100, moving: 4, longrange: 1 },
        position: 53
      },
      {
        character: { type: 'undead', level: 4, attack: 169, defence: 41, health: 100, moving: 4, longrange: 1 },
        position: 55
      },
      {
        character: { type: 'vampire', level: 1, attack: 25, defence: 25, health: 50, moving: 2, longrange: 2 },
        position: 6
      }
    ],           
    lastIndex: 0,                 
    activePlayer: 'user',         
    userWin: 0,          
  }
  
  const response = JSON.stringify(result);
  stateService.load.mockReturnValue(response);

  expect(JSON.parse(stateService.load())).toEqual(result);
});