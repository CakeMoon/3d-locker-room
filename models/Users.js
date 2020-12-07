const db = require('../db/db_config');

/**
 * @typedef User
 * 
 * @prop {number} id - id of the user
 * @prop {string} name - name of the user
 * @prop {string} password - password of the user
 */

 /**
 * @class Users
 * Stores all Users.
 */
class Users {
  /**
   * Add a User.
   * @param {string} username - username
   * @param {string} password - password
   * @return {User} - created User
   */
  static async addOne(name, password) {
    // first insert the user into the db then fetch the user from the DB
    return db.run(`INSERT INTO users (${db.columnNames.userName}, ${db.columnNames.userPassword}) VALUES ('${name}', '${password}')`)
              .then( () => {
                return Users.findOneName(name);
              });
  }
  
  /**
   * Find a User by name.
   * @param {string} name - name of User to find
   * @return {User | undefined} - found User
   */
  static async findOneName(name) {
    return db.get(`SELECT * FROM users WHERE ${db.columnNames.userName} = '${name}'`);
  }

  /**
   * Find a User by id.
   * @param {number} id - id of User to find
   * @return {User | undefined} - found User
   */
  static async findOneId(id) {
    return db.get(`SELECT * FROM users WHERE ${db.columnNames.userId} = ${id}`);
  }

  /**
   * Find Users by ids.
   * @param {number} ids - ids of Users to find
   * @return {User[] | undefined} - found Users
   */
  static async findAllId(ids) {
    const userIds = "(" + ids.map((x) => { return "'" + x + "'" }).join(", ") + ")";
    console.log(userIds);
    return db.get(`SELECT * FROM users WHERE ${db.columnNames.userId} in ${userIds}`);
  }
  
  /**
   * Return an array of all of the Users.
   * @return {User[]}
   */
  static async findAll() {
    return db.all(`SELECT * FROM users`);
  }

  /**
   * Update a User's Name.
   * @param {number} id - id of user to update
   * @param {string} username - new username
   * @return {User | undefined} - updated User
   */
  static async updateOneName(id, name) {
    return db.run(`UPDATE users SET ${db.columnNames.userName} = '${name}' 
                  WHERE ${db.columnNames.userId} == ${id}`)
              .then( () => {
                return Users.findOneId(id);
              });
  }

  /**
   * Update a User.
   * @param {number} id - id of user to update
   * @param {string} password - new password
   * @return {User | undefined} - updated User
   */
  static async updateOnePassword(id, password) {
    return db.run(`UPDATE users SET ${db.columnNames.userPassword} = '${password}'
                  WHERE ${db.columnNames.userId} = ${id}`)
              .then( () => {
                return Users.findOneId(id);
              });
  }

  /**
   * Delete a User
   * @param {number} id - id of user to delete
   * @return {User | undefined} - deleted User
   */
  static async deleteOne(id) {
    return Users.findOneId(id)
            .then( (user) => {
              db.run(`DELETE FROM users WHERE ${db.columnNames.userId} = ${id}`);
              return user;
            });
  }

}

module.exports = Users;
