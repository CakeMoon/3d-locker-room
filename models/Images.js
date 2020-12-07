const db = require('../db/db_config');

class Images {
  static async addOne(uid, name, link, width, height) {
    return db.run(`INSERT INTO images (${db.columnNames.imageOwner}, ${db.columnNames.imageName}, ${db.columnNames.imageLink}, ${db.columnNames.imageWidth}, ${db.columnNames.imageHeight})
                  VALUES (${uid}, '${name}', '${link}', ${width}, ${height})`)
              .then( () => {
                return Images.findOne(uid, link);
              });
  }

  static async findOne(uid, link) {
    return db.get(`SELECT * FROM images WHERE ${db.columnNames.imageOwner} = ${uid} AND ${db.columnNames.imageLink} = '${link}'`);
  }

  static async findOneById(id) {
    return db.get(`SELECT * FROM images WHERE ${db.columnNames.imageId} = ${id}`);
  }

  static async findAll(uid) {
    return db.all(`SELECT * FROM images WHERE ${db.columnNames.imageOwner} = ${uid}`);
  }
  
  static async deleteOne(id) {
    return Images.findOneById(id)
            .then( (image) => {
              db.run(`DELETE FROM images WHERE ${db.columnNames.imageId} = ${id}`);
              return image;
            });
  }

}

module.exports = Images;
