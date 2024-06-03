class Game {
  constructor(client) {
    this.client = client;
  }

  async createGame(player1, player2) {
    const gameId = `game:${Date.now()}`;
    const gameData = {
      player1,
      player2,
      boardState: 'start',
      moves: [],
      turn: 'white',
      result: 'ongoing',
    };

    await this.client.set(gameId, JSON.stringify(gameData));
    return gameId;
  }

  async getGame(gameId) {
    const gameData = await this.client.get(gameId);
    return JSON.parse(gameData);
  }

  async updateGame(gameId, update) {
    const gameData = await this.getGame(gameId);
    const updatedGameData = { ...gameData, ...update };

    await this.client.set(gameId, JSON.stringify(updatedGameData));
  }
}

module.exports = Game;
