const getUserByEmail = function(email, database) {
    // lookup magic...
    let user = {};
    for (let keys in database) {
      if (database[keys].email === email) {
        user[keys] = database[keys];
      } 
    }
    return user;
  };

  module.exports = getUserByEmail