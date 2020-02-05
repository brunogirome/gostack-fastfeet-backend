import Sequelize from 'sequelize';

import databaseConfig from '../config/database';

import Users from '../app/models/User';

const models = [Users];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
