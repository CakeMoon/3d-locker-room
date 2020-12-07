const sqlite3 = require('sqlite3');

let sqlDb;

// name the columns of our tables for localization
const columnNames = {
  userId: "id",
  userName: "name",
  userPassword: "password",

  imageId: "id",
  imageName: "name",
  imageOwner: "uid",
  imageLink: "link",
  imageWidth: "width",
  imageHeight: "height",

  modelId: "id",
  modelName: "name",
  modelOwner: "uid",
  modelContent: "content",
};
Object.freeze(columnNames);

function createDb() {
  console.log("created our db!");
  sqlDb = new sqlite3.Database('lockerroomdb.db', function() {
    createUserTable();
    createImageTable();
    createModelTable()
  });
};

function createUserTable() {
  sqlDb.run(`CREATE TABLE IF NOT EXISTS users (
    ${columnNames.userId} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${columnNames.userName} TEXT NOT NULL UNIQUE,
    ${columnNames.userPassword} TEXT NOT NULL
  )`);
};

function createImageTable() {
  sqlDb.run(`CREATE TABLE IF NOT EXISTS images (
    ${columnNames.imageId} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${columnNames.imageName} TEXT NOT NULL UNIQUE,
    ${columnNames.imageOwner} INTEGER NOT NULL,
    ${columnNames.imageLink} TEXT NOT NULL,
    ${columnNames.imageWidth} INTEGER NOT NULL,
    ${columnNames.imageHeight} INTEGER NOT NULL,
    FOREIGN KEY(${columnNames.imageOwner})
    REFERENCES users(${columnNames.userId})
  )`);
};

function createModelTable() {
  sqlDb.run(`CREATE TABLE IF NOT EXISTS model3ds (
    ${columnNames.modelId} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${columnNames.modelName} TEXT NOT NULL UNIQUE,
    ${columnNames.modelOwner} INTEGER NOT NULL,
    ${columnNames.modelContent} TEXT NOT NULL,
    FOREIGN KEY(${columnNames.modelOwner})
    REFERENCES users(${columnNames.userId})
  )`);
};

// Helper wrapper functions that return promises that resolve when sql queries are complete.

function run(sqlQuery) {
  return new Promise((resolve, reject) => {
    sqlDb.run(sqlQuery, (err) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve();
      }
    })
  });
};

function get(sqlQuery) {
  return new Promise((resolve, reject) => {
    sqlDb.get(sqlQuery, (err, row) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(row);
      }
    })
  });
};

function all(sqlQuery) {
  return new Promise((resolve, reject) => {
    sqlDb.all(sqlQuery, (err, rows) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(rows);
      }
    })
  });
};

createDb();

module.exports = {
  columnNames,
  get,
  all,
  run,
};