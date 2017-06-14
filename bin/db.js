var config      = require('config'),
    pg          = require('pg-query')
    var username = "postgres" // sandbox username
  var password = "gis" // read only privileges on our table
  var host = "localhost"
  var database = "linestrings" // database name
  var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

/*var config = {
  user: 'postgres', //env var: PGUSER 
  database: 'linestrings', //env var: PGDATABASE 
  password: 'gis', //env var: PGPASSWORD 
  host: 'localhost', // Server hosting the postgres database 
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};
//const pool = new pg.Pool(config);*/
var table_name  = "newFlag1";
pg.connectionParameters = conString + '/' +table_name;
//var points = require('../parkcoord.json');
 
/*function initDB(){
  pg('CREATE EXTENSION postgis;', createDBSchema);
} 
function createDBSchema(err, rows, result) {
  if(err && err.code == "ECONNREFUSED"){
    return console.error("DB connection unavailable, see README notes for setup assistance\n", err);
  }
  var query = "CREATE TABLE "+table_name+
    " ( gid serial NOT NULL, name character varying(240), the_geom geometry, CONSTRAINT "+table_name+ "_pkey PRIMARY KEY (gid), CONSTRAINT enforce_dims_geom CHECK (st_ndims(the_geom) = 2), CONSTRAINT enforce_geotype_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),CONSTRAINT enforce_srid_geom CHECK (st_srid(the_geom) = 4326) ) WITH ( OIDS=FALSE );";
  pg(query, addSpatialIndex);
};
function addSpatialIndex(err, rows, result) {
  pg("CREATE INDEX "+table_name+"_geom_gist ON "+table_name+" USING gist (the_geom);", importMapPoints);
}
function importMapPoints(err, rows, result) {
  var query = "Insert into "+table_name+" (name, the_geom) VALUES " + points.map(mapPinSQL).join(",") + ';';
  pg(query, function(err, rows, result) {
    var response = 'Data import completed!';
    return response;
  });
};
function mapPinSQL(pin) {
  var query = '';  
  if(typeof(pin) == 'object'){
    query = "('" + pin.Name.replace(/'/g,"''") + "', ST_GeomFromText('POINT(" + pin.pos[0] +" "+ pin.pos[1] + " )', 4326))";  
  }
  return query;
};*/
function rangeqeury(err, rows, result) {
  var query = "select ST_GeomFromText(loc) from public.\"newFlag1\";";
  pg(query, function(err, rows, result) {
    var response = 'Data import completed!';
    return response;
  });
};
function select_box(req, res, next){
  //clean our input variables before forming our DB query:
  var query = req.query;
  var limit = (typeof(query.limit) !== "undefined") ? query.limit : 40;
  if(!(Number(query.lat1) 
    && Number(query.lon1) 
    && Number(query.lat2) 
    && Number(query.lon2)
    && Number(limit)))
  {
    res.send(500, {http_status:400,error_msg: "this endpoint requires two pair of lat, long coordinates: lat1 lon1 lat2 lon2\na query 'limit' parameter can be optionally specified as well."});
    return console.error('could not connect to postgres', err);
  }
  pg('SELECT st_astext(loc) FROM ' + table_name+ ' t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.loc) LIMIT "+limit+';', function(err, rows, result){
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  })
};