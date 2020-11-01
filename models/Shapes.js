
let data = [];

 /**
 * @class Shapes
 * Stores all Shapes.
 */
class Shapes {
    /**
     * @prop {numbers[]} x - x
     * @prop {numbers[]} y - y
     * @prop {numbers[]} z - z
     * @return {Chair} - created Shapes
     */
    static addOne(x, y, z) {
      const shape = {x, y, z};
      if (Chairs.findOne(user) != undefined) {
        return undefined;
      } 
      data.push(chair);
      return chair;
    }
  
    /**
     * Find a Chair by user
     * @param {string} user - user
     * @return {Freet | undefined} - found Chair
     */
    static findOne(user) {
      const chair =  data.filter(chair => chair.user === user)[0];
      return chair;
    }


    /**
    * Return an array of all of Chairs.
    * @return {Chair[]}
    */
    static findAll() {
      return data;
    }
  
    /**
     * Update a Chair.
     * @param {string} user - user
     * @prop {numbers[]]} x - x
     * @prop {numbers[]]} y - y
     * @return {Freet | undefined} - updated Chair
     */
    static updateOne(user, x, y) {
      const chair = Chairs.findOne(user);
      chair.x = x;
      chair.y = y;
      return chair;
    }
}

  module.exports = Chairs;
  