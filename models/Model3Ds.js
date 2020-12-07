const db = require('../db/db_config');

class Model3Ds {
  static async addOne(uid, name, content) {
    return db.run(`INSERT INTO model3ds (${db.columnNames.modelName}, ${db.columnNames.modelOwner}, ${db.columnNames.modelContent})
                  VALUES ('${name}', ${uid}, '${content}')`)
              .then( () => {
                console.log("OOO");
                return Model3Ds.findOne(name);
              });
  }

  static async findOne(name) {
    return db.get(`SELECT * FROM model3ds WHERE ${db.columnNames.modelName} = '${name}'`);
  }

  static async findOneById(id) {
    return db.get(`SELECT * FROM model3ds WHERE ${db.columnNames.modelId} = ${id}`);
  }

  static async findAll(uid) {
    return db.all(`SELECT * FROM model3ds WHERE ${db.columnNames.modelOwner} = ${uid}`);
  }
  
  static async deleteOne(id) {
    return Model3Ds.findOneById(id)
            .then( (model3d) => {
              console.log("Model found!");
              db.run(`DELETE FROM model3ds WHERE ${db.columnNames.modelId} = ${id}`);
              console.log("Model deleted!");
              return model3d;
            });
  }

}

module.exports = Model3Ds;
