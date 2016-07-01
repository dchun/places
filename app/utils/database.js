var React = require('react-native');
var SQLite = require('react-native-sqlite-storage');

var db_name = "Places.db";
var db_version = "1.0";
var db = SQLite.openDatabase(db_name,db_version);

SQLite.enablePromise(true);

var database = {

  errorCB(err){
    console.log("Error " + (err.message || err));
  },

  initialize(){
    return new Promise(function(resolve, reject) {
      db.executeSql('SELECT 1 FROM version LIMIT 1')
        .then(results => resolve(results))
        .catch((error) => reject(error));
    });
  },

  populateDB() {
    return new Promise(function(resolve, reject) {
      db.transaction(tx => {

        tx.executeSql('DROP TABLE IF EXISTS places;');
        tx.executeSql('DROP TABLE IF EXISTS categories;');
        tx.executeSql('DROP TABLE IF EXISTS category_relations;');
        tx.executeSql('DROP TABLE IF EXISTS tags;');
        tx.executeSql('DROP TABLE IF EXISTS tag_relations;');

        tx.executeSql('CREATE TABLE IF NOT EXISTS version( '
            + 'version_id INTEGER PRIMARY KEY NOT NULL); ').catch((error) => {  
            this.errorCB(error) 
        });

        tx.executeSql('CREATE TABLE IF NOT EXISTS places( '
            + 'id INTEGER PRIMARY KEY NOT NULL, '
            + 'name VARCHAR(255), '
            + 'latitude FLOAT, '
            + 'longitude FLOAT, '
            + 'address VARCHAR(255), '
            + 'phone VARCHAR(255), '
            + 'note TEXT, '
            + 'category_id INTEGER, '
            + 'FOREIGN KEY ( category_id ) REFERENCES categories ( id ) ); ').catch((error) => {  
            this.errorCB(error) 
        });

        tx.executeSql('CREATE TABLE IF NOT EXISTS categories( '
            + 'id INTEGER PRIMARY KEY NOT NULL, '
            + 'name VARCHAR(255), '
            + 'color VARCHAR(255) ); ').catch((error) => {  
            this.errorCB(error)     });         

        tx.executeSql('CREATE TABLE IF NOT EXISTS tags( '
            + 'id INTEGER PRIMARY KEY NOT NULL, '
            + 'name VARCHAR(255) ); ').catch((error) => {  
            this.errorCB(error)     }); 

        tx.executeSql('CREATE TABLE IF NOT EXISTS tag_relations( '
            + 'id INTEGER PRIMARY KEY NOT NULL, '
            + 'tag_id INTEGER NOT NULL, '
            + 'place_id INTEGER NOT NULL, ' 
            + 'FOREIGN KEY ( tag_id ) REFERENCES tags ( id ) '
            + 'FOREIGN KEY ( place_id ) REFERENCES places ( id )); ').catch((error) => {  
            this.errorCB(error)     }); 

        // tx.executeSql('INSERT INTO places (id, name, latitude, longitude, address, phone, note, category_id) VALUES (1,"Lush",10.78274,106.705482,"Đường Lý Tự Trọng 2, Ho Chi Minh City, Thành Phố Hồ Chí Minh, Vietnam","‎+84 8 38242496","Tuesday nights ladies night",1);');
        // tx.executeSql('INSERT INTO places (id, name, latitude, longitude, address, phone, note, category_id) VALUES (3,"Chi\'s Cafe",10.767938,106.694268,"Đường Phạm Ngũ Lão 185/32, Ho Chi Minh City, Thành Phố Hồ Chí Minh, Vietnam","‎+84 90 3643446","Food is so so. Go there to rent motorbikes. $60 per mo for a Nuovo 3",2);');
        // tx.executeSql('INSERT INTO places (id, name, latitude, longitude, address, phone, note, category_id) VALUES (4,"L\'Usine Cafe - Đồng Khởi",10.775796,106.703288,"Đường Đồng Khởi 141, Ho Chi Minh City, Thành Phố Hồ Chí Minh 710041, Vietnam","‎+84 8 66743565","Good place to work",3);');
        // tx.executeSql('INSERT INTO places (id, name, latitude, longitude, address, phone, note, category_id) VALUES (6,"Hong Hac Boutique Hotel",10.776411,106.691438,"Đường Trương Định, Ho Chi Minh City, Thành Phố Hồ Chí Minh, Vietnam","‎+84 8 39302847","Newly remodeled. Good Location",5);');

        // tx.executeSql('INSERT INTO categories (id, name, color) VALUES (1, "Clubs", "D32F2F");');
        // tx.executeSql('INSERT INTO categories (id, name, color) VALUES (2, "Restaurants", "F57F17");');
        // tx.executeSql('INSERT INTO categories (id, name, color) VALUES (3, "Cafes", "795548");');
        // tx.executeSql('INSERT INTO categories (id, name, color) VALUES (4, "Coworking", "0288D1");');
        // tx.executeSql('INSERT INTO categories (id, name, color) VALUES (5, "Hotels", "7B1FA2");');

        // tx.executeSql('INSERT INTO tags (id, name) VALUES (1, "Rentals");');
        // tx.executeSql('INSERT INTO tags (id, name) VALUES (2, "Good Food");');
        // tx.executeSql('INSERT INTO tags (id, name) VALUES (3, "Workplace");');
        // tx.executeSql('INSERT INTO tags (id, name) VALUES (4, "Good Prices");');

        // tx.executeSql('INSERT INTO tag_relations (id, tag_id, place_id) VALUES (1, 3, 1);');
        // tx.executeSql('INSERT INTO tag_relations (id, tag_id, place_id) VALUES (2, 4, 2);');
        // tx.executeSql('INSERT INTO tag_relations (id, tag_id, place_id) VALUES (3, 5, 3);');
        // tx.executeSql('INSERT INTO tag_relations (id, tag_id, place_id) VALUES (4, 6, 4);');

      })
      .then(results => resolve(results))
      .catch(error => resolve(error));
    });
  },

  closeDatabase(){
    if (db) {
      console.log("Closing database ...");
      db.close().then((status) => {
        console.log("Database CLOSED");
      }).catch((error) => {
        this.errorCB(error);
      });
    } else {
      console.log("Database was not OPENED");
    }
  },

  deleteDatabase(){
    console.log("Deleting database");
    SQLite.deleteDatabase(db_name).then(() => {
      console.log("Database DELETED");
    }).catch((error) => {
      this.errorCB(error);
    });
  },

  formatRows(results){
    let data = [],
    len = results.rows.length;
    for (let i = 0; i < len; i++) {
      let row = results.rows.item(i);
      data.push(row);
    }
    return data;    
  },

  getEverything(){
    let that = this;
    let sql = 'SELECT p.*, '
    + '(SELECT GROUP_CONCAT("{id:\'" || t.id || "\', name:\'" || t.name || "\', checked:\'" || CASE WHEN tr.id IS NOT NULL THEN 1 ELSE 0 END || "\'}", ",") FROM tags t LEFT JOIN tag_relations tr ON tr.tag_id = t.id AND tr.place_id = p.id) AS tags '     
    + 'FROM places p ';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql)
        .then(results => resolve(that.formatRows(results[0])))
        .catch(error => reject(error));
    });
  },

  getPlace(id){
    let sql = 'SELECT p.*, c.name AS category_name, c.color AS category_color '
    + 'FROM places p '
    + 'LEFT JOIN categories c '
    + 'ON p.category_id = c.id '
    + 'WHERE p.id = ?';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql, [id])
        .then(results => resolve(results[0].rows.item(0)))
        .catch(error => reject(error));   
    });
  },

  getPlaces(){
    let that = this;
    let sql = 'SELECT p.*, c.name AS category_name, c.color AS category_color, '
    + '(SELECT GROUP_CONCAT(t.name) FROM tags t LEFT JOIN tag_relations tr ON tr.tag_id = t.id AND tr.place_id = p.id WHERE tr.id NOT NULL) AS tags '     
    + 'FROM places p '
    + 'LEFT JOIN categories c '
    + 'ON p.category_id = c.id';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql)
        .then(results => resolve(that.formatRows(results[0])))
        .catch(error => reject(error));
    });
  },

  getFilteredPlaces(region,distance,filters){
    let that = this;
    let conditions,
    sql;
    if(filters.category !== 0){
      if(!filters.tags.includes(0)){
        conditions = [region.latitude, region.longitude, distance, filters.category];
        conditions.push(...filters.tags);
        sql = 'SELECT p.*, c.name AS category_name, c.color AS category_color '
        + 'FROM places p '
        + 'LEFT JOIN categories c '
        + 'ON p.category_id = c.id '
        + 'JOIN tag_relations tr '  
        + 'ON tr.place_id = p.id '
        + 'WHERE distance(latitude, longitude, ?, ?) < ? '
        + 'AND p.category_id = ? '
        + 'AND tr.tag_id IN ('
        + '?,'.repeat(filters.tags.length).slice(0, -1)
        + ')';
      } else {
        conditions = [region.latitude, region.longitude, distance, filters.category];
        sql = 'SELECT p.*, c.name AS category_name, c.color AS category_color '
        + 'FROM places p '
        + 'LEFT JOIN categories c '
        + 'ON p.category_id = c.id '
        + 'WHERE distance(latitude, longitude, ?, ?) < ? '
        + 'AND p.category_id = ?';
      }
    } else {
      if(!filters.tags.includes(0)){
        conditions = [region.latitude, region.longitude, distance];
        conditions.push(...filters.tags);
        sql = 'SELECT p.*, c.name AS category_name, c.color AS category_color '
        + 'FROM places p '
        + 'LEFT JOIN categories c '
        + 'ON p.category_id = c.id '
        + 'JOIN tag_relations tr '  
        + 'ON tr.place_id = p.id '
        + 'WHERE distance(latitude, longitude, ?, ?) < ? '
        + 'AND tr.tag_id IN ('
        + '?,'.repeat(filters.tags.length).slice(0, -1)
        + ')';
      } else {
        conditions = [region.latitude, region.longitude, distance];
        sql = 'SELECT p.*, c.name AS category_name, c.color AS category_color '
        + 'FROM places p '
        + 'LEFT JOIN categories c '
        + 'ON p.category_id = c.id '
        + 'WHERE distance(latitude, longitude, ?, ?) < ?';        
      }
    }
    return new Promise(function(resolve, reject) {
      db.executeSql(sql, conditions)
        .then(results => resolve(that.formatRows(results[0])))
        .catch(error => reject(error));
    });
  },

  getPlaceTags(pid){
    let that = this;
    let sql = 'SELECT t.*, '
    + 'CASE WHEN tr.id IS NOT NULL THEN tr.id ELSE null END tag_relation_id, '
    + 'CASE WHEN tr.id IS NOT NULL THEN 1 ELSE 0 END checked '
    + 'FROM tags t '
    + 'LEFT JOIN tag_relations tr '  
    + 'ON tr.tag_id = t.id '
    + 'AND tr.place_id = ? '
    + 'GROUP BY t.id';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql, [pid])
        .then(results => resolve(that.formatRows(results[0])))
        .catch(error => reject(error));
    });
  },

  createPlace(data){
    let psql = 'INSERT INTO places (name, latitude, longitude, address, phone, note, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    tsql = 'INSERT INTO tag_relations (tag_id, place_id) VALUES (?, ?)';
    return new Promise(function(resolve, reject) {
      db.executeSql(psql, [data.name, data.latitude, data.longitude, data.address, data.phone, data.note, data.category.id])
        .then(results => {
          if(data.tags){
            data.tags.forEach(tag => {
              db.executeSql(tsql, [tag.id, results[0].insertId]).catch(error => console.log(error));
            });      
          }  
          resolve(results);    
        }).catch(error => resolve(error));
    });
  },

  updatePlace(data){
    let psql = 'UPDATE places SET name = ?, latitude = ?, longitude = ?, address = ?, phone = ?, note = ?, category_id = ? WHERE id = ?',
    tcsql = 'INSERT INTO tag_relations (tag_id, place_id) VALUES (?, ?)',
    tdsql = 'DELETE FROM tag_relations WHERE id = ?';
    return new Promise(function(resolve, reject) {
      db.executeSql(psql, [data.name, data.latitude, data.longitude, data.address, data.phone, data.note, data.category.id, data.id])
        .then(results => {
          if(data.tags){
            data.tags.forEach(tag => {
              if(tag.tag_relation_id && tag.checked == false){
                db.executeSql(tdsql, [tag.tag_relation_id]).catch(error => console.log(error));
              } else if(!tag.tag_relation_id && tag.checked == true){
                db.executeSql(tcsql, [tag.id, data.id]).catch(error => console.log(error));
              }
            });      
          }
          resolve(results);
        }).catch(error => reject(error));
    });
  },

  deletePlace(id){
    let sql = 'DELETE FROM places WHERE id = ?';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql, [id])
        .then(() => resolve(id))
        .catch(error => reject(error));
    });
  },

  getCategories(){
    let that = this;
    let sql = 'SELECT * FROM categories';      
    return new Promise(function(resolve, reject) {
      db.executeSql(sql)
        .then(results => resolve(that.formatRows(results[0])))
        .catch(error => reject(error));
    });
  },

  createCategory(name,color){
    let isql = 'INSERT INTO categories (name, color) VALUES (?, ?)';
    let ssql = 'SELECT * FROM categories WHERE id = last_insert_rowid()';
    return new Promise(function(resolve, reject) {
      db.executeSql(isql, [name, color]).catch(error => console.log(error));
      db.executeSql(ssql)
        .then(results => resolve(results[0].rows.item(0)))
        .catch(error => reject(error));
    });
  },

  updateCategory(data){
    let usql = 'UPDATE categories SET name = ?, color = ? WHERE id = ?';
    let ssql = 'SELECT * FROM categories WHERE id = ?';
    return new Promise(function(resolve, reject) {
      db.executeSql(usql, [data.name, data.color, data.id]).catch(error => console.log(error));
      db.executeSql(ssql, [data.id])
        .then(results => resolve(results[0].rows.item(0)))
        .catch(error => reject(error));
    });
  },

  deleteCategory(id){
    let sql = 'DELETE FROM categories WHERE id = ?;';
    + 'UPDATE places SET category_id = NULL WHERE category_id = ?';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql, [id, id])
        .then(() => resolve(id))
        .catch(error => reject(error));
    });
  },

  getTags(){
    let that = this;
    let sql = 'SELECT * FROM tags';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql)
        .then(results => resolve(that.formatRows(results[0])))
        .catch(error => reject(error));
    });
  },

  getTagRelations(){
    let that = this;
    let sql = 'SELECT * FROM tag_relations';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql)
        .then(results => resolve(that.formatRows(results[0])))
        .catch(error => reject(error));
    });
  },

  createTag(name){
    let isql = 'INSERT INTO tags (name) VALUES (?)';
    let ssql = 'SELECT * FROM tags WHERE id = last_insert_rowid()';
    return new Promise(function(resolve, reject) {
      db.executeSql(isql, [name]).catch(error => console.log(error));
      db.executeSql(ssql)
        .then(results => resolve(results[0].rows.item(0)))
        .catch(error => reject(error));
    });
  },

  deleteTag(id){
    let sql = 'DELETE FROM tags WHERE id = ?;'
    + 'DELETE FROM tag_relations WHERE tag_id = ?;';
    return new Promise(function(resolve, reject) {
      db.executeSql(sql, [id, id])
        .then(() => resolve(id))
        .catch(error => reject(error));
    });
  },
}

module.exports = database;