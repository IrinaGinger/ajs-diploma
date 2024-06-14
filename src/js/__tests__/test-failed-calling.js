import GameStateService from "../GameStateService";

const stateService = new GameStateService('');

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

test('load should be failed', () => {  
  stateService.load.mockImplementation(() => {
    throw new Error("Invalid state")
  });
  
  expect(() => stateService.load()).toThrow('Invalid state');
});