/*qeury to postgis */
var restify     = require('restify'),
    fs          = require('fs'),
    pg          = require('pg-query')
  var username = "postgres" // sandbox username
  var password = "gis" // read only privileges on our table
  var host = "localhost"
  var database = "osm_daegu" // database name
  var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection
var table_name  = "road";
pg.connectionParameters = conString;// + '/' +table_name;
var app = restify.createServer()
app.use(restify.queryParser())
app.use(restify.CORS())
app.use(restify.fullResponse())

// Routes
app.get('/roaddata', function (req, res, next){
  
   pg('SELECT id, st_asgeojson(geom) FROM public.road_geom;', function(err, rows, result){   

  if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  });
});
app.get('/buildingdata', function (req, res, next){


   pg('select id, st_asgeojson(geom) from public.building_geom;', function(err, rows, result){   
  if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  });
});
app.get('/tagdata', function (req, res, next){
var query = req.query;
var tag = query.tag.split(',');

var sql = 'select id from public.building_geom where tag in (';
var i = 0;
for(i = 0;i < tag.length - 2;i++) {
	sql += "\'" + tag[i] + "\',";
}
sql += "\'" + tag[i] + "\')";
console.log(sql);
  pg(sql + ';', function(err, rows, result){   

//select * from building_geom where ST_geometrytype(geom) = 'ST_Polygon'
  if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  });
});
app.get('/parks/within', function (req, res, next){
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
  console.log('SELECT id FROM (select id,geom from public.road_geom union select id,geom from public.building_geom) as u WHERE ST_Intersects(st_transform(st_setsrid(ST_GeomFromText(\'POLYGON(('+query.lat1+ " " + query.lon1 +"," +query.lat2+" "+query.lon1+","+query.lat2+" "+query.lon2+","+query.lat1+" "+ query.lon2+","+query.lat1+" "+ query.lon1+"))'),4326),3857), st_setsrid(u.geom,3857)) ;");
  //pg('SELECT st_astext(loc) FROM public.\"' + table_name+ '\" t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.loc) LIMIT "+limit+';', function(err, rows, result){
  //pg('SELECT st_asgeojson(loc) FROM public.' + table_name + ';', function(err, rows, result){
   //pg('SELECT st_asgeojson(loc) FROM public.' + table_name+ ' t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.loc) LIMIT "+limit+';', function(err, rows, result){
   //pg('SELECT st_asgeojson(way) FROM public.' + table_name+ ' t WHERE ST_Intersects(ST_GeomFromText(\'POLYGON(('+query.lat1+ " " + query.lon1 +"," +query.lat2+" "+query.lon1+","+query.lat2+" "+query.lon2+","+query.lat1+" "+ query.lon2+","+query.lat1+" "+ query.lon1+"))'), t.loc) LIMIT "+limit+';', function(err, rows, result){
   /*console.log('SELECT st_asgeojson(way) FROM ' + table_name+ ' t WHERE ST_Intersects(st_transform(st_setsrid(ST_GeomFromText(\'POLYGON(('+query.lon1+ " " + query.lat1 +"," +query.lon2+" "+query.lat1+","+query.llo2+" "+query.lat2+","+query.lon1+" "+ query.lat2+","+query.lon1+" "+ query.lat1+"))'),4326),3857), st_setsrid(t.way,3857)) LIMIT "+limit+';');
  //pg('SELECT st_astext(loc) FROM public.\"' + table_name+ '\" t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.loc) LIMIT "+limit+';', function(err, rows, result){
  //pg('SELECT st_asgeojson(loc) FROM public.' + table_name + ';', function(err, rows, result){
   //pg('SELECT st_asgeojson(loc) FROM public.' + table_name+ ' t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.loc) LIMIT "+limit+';', function(err, rows, result){
   //pg('SELECT st_asgeojson(way) FROM public.' + table_name+ ' t WHERE ST_Intersects(ST_GeomFromText(\'POLYGON(('+query.lat1+ " " + query.lon1 +"," +query.lat2+" "+query.lon1+","+query.lat2+" "+query.lon2+","+query.lat1+" "+ query.lon2+","+query.lat1+" "+ query.lon1+"))'), t.loc) LIMIT "+limit+';', function(err, rows, result){
   pg('SELECT st_asgeojson(way) FROM ' + table_name+ ' t WHERE ST_Intersects(st_transform(st_setsrid(ST_GeomFromText(\'POLYGON(('+query.lon1+ " " + query.lat1 +"," +query.lon2+" "+query.lat1+","+query.lon2+" "+query.lat2+","+query.lon1+" "+ query.lat2+","+query.lon1+" "+ query.lat1+"))'),4326),3857), st_setsrid(t.way,3857)) LIMIT "+limit+';', function(err, rows, result){
 */

   pg('SELECT id FROM (select id,geom from public.road_geom union select id,geom from public.building_geom) as u WHERE ST_Intersects(st_transform(st_setsrid(ST_GeomFromText(\'POLYGON(('+query.lat1+ " " + query.lon1 +"," +query.lat2+" "+query.lon1+","+query.lat2+" "+query.lon2+","+query.lat1+" "+ query.lon2+","+query.lat1+" "+ query.lon1+"))'),4326),4326), st_setsrid(u.geom,4326)) ;", function(err, rows, result){   

  if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  });
});

//app.get('/parks', db.selectAll);
// Static assets
app.get(/\/(css|js|img)\/?.*/, restify.serveStatic({directory: './static/'}));
app.get('/', function (req, res, next)
{
  var data = fs.readFileSync(__dirname + '/hello.html');
  res.status(200);
  res.header('Content-Type', 'text/html');
  res.end(data.toString().replace(/host:port/g, req.header('Host')));
});
 app.get('/node_modules/leaflet-zoombox/L.Control.ZoomBox.js', function (req, res, next)
{
  var data = fs.readFileSync(__dirname + '/node_modules/leaflet-zoombox/L.Control.ZoomBox.js');
  res.status(200);
  res.header('Content-Type', 'text/js');
  res.end(data.toString().replace(/host:port/g, req.header('Host')));
});
  app.get('/node_modules/leaflet-zoombox/L.Control.ZoomBox.css', function (req, res, next)
{
  var data = fs.readFileSync(__dirname + '/node_modules/leaflet-zoombox/L.Control.ZoomBox.css');
  res.status(200);
  res.header('Content-Type', 'text/css');
  res.end(data.toString().replace(/host:port/g, req.header('Host')));
});
app.listen('3000', '127.0.0.1', function () {
  console.log( "Listening on " + '127.0.0.1' + ", port " + '3000' )
});
