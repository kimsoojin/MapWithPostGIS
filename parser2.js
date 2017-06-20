var express = require('express');
var app = express();
var http = require('http');
var util = require('util');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var fs = require('fs');
var pg = require('pg-query')
var username = "postgres" // sandbox username
var password = "1234" // read only privileges on our table
var host = "localhost"
var database = "postgres" // database name
var conString = "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection
var table_name = "public.buildings";
var count = 0;
//pg.connectionParameters = conString;// + '/' +table_name;
//var app = restify.createServer();
//app.use(restify.queryParser());
//app.use(restify.CORS());
//app.use(restify.fullResponse());


//app.set('view engine', 'ejs');  //tell Express we're using EJS

//app.get('/', function (req, res) {

function building_parser() {}

function road_parser() {}

(function() {
  var pg = require("pg");
  //var conString = "postgres://postgres:postgres@127.0.0.1:5433/test";
  var client = new pg.Client(conString);
  client.connect();
  //client.query("create table point_geom (id int NOT NULL, name char(50), tag char(50),geom geometry('POINT',3857))");
  //client.query("create table line_geom (id int NOT NULL, name char(50), tag char(50),geom geometry('LINESTRING',3857))");
  //client.query("create table polygon_geom (id int NOT NULL, name char(50), tag char(50),geom geometry('POLYGON',3857))");
  //client.query("create table geom_all (id int, name char(50),tag char(50), geom geometry);");
  client.query("create table building_geom (id int, name char(50),tag char(50), geom geometry,primary key(id));");
  client.query("create table road_geom (id int, name char(50),tag char(50), geom geometry,primary key(id));");
  //client.query("create table area_geom (id int, name char(50),tag char(50), geom geometry,primary key(id));");
  //var query_insert = "insert into geoms (id, name, tag, geom) values (";
  //var q_st_building = 'insert into buildings (id, name,building,position) values(';
  //var q_st_road = 'insert into roads (id, name, road,positions) values(';
  //var q_st_building_poly = "insert into poly (id, name, tag , positions) values(";

  var xml = fs.readFileSync('./map.osm', {
    encoding: 'utf-8'
  });
  parser.parseString(xml, function(err, result) {
    //console.log(util.inspect(result['osm']['node'],false,null));
    var node_list = result['osm']['node'];
    var way_list = result['osm']['way'];
    var building_map = {};
    var road_map = {};
    var area_map = {};

/*
for (var i = 0; i < node_list.length; i++) {
  //console.log(util.inspect(node_list[i],false,null));

  if (node_list[i].hasOwnProperty('tag')) {
    var b_name;
    var flag_accept = false;
    var name_accept = false;
    var b_type;

    var node = node_list[i];

    for (var j = 0; j < node_list[i]['tag'].length; j++) {
      //console.log(util.inspect(node_list[i]['tag'][j]['$'], false, null));

      if (node['tag'][j]['$']['k'] == 'name') {
        b_name = node['tag'][j]['$']['v'];
        name_accept = true;
      } else if (node['tag'][j]['$']['k'] == 'amenity') {
        b_type = node['tag'][j]['$']['v'];
        if(b_type == 'yes'){
          b_type = 'building';
        }
        flag_accept = true;
      } else if (node['tag'][j]['$']['k'] == 'building') {
        b_type = 'building';
        flag_accept = true;
      }
       else if(node['tag'][j]['$']['k'] == 'shop'){
         b_type = 'shop';
         flag_accept = true;
       }

    }
    if (flag_accept == true && name_accept == true) {

      if (building_map.hasOwnProperty(b_type)) {
        var v = building_map[b_type];
        building_map[b_type] = v + 1;
      } else {
        building_map[b_type] = 1;
      }
      var id = node['$']['id'];
      var lat = node['$']['lat'];
      var lon = node['$']['lon'];
      if (b_name.length > 50) {
        b_name = b_name.slice(0, 50);
      }
      var query_insert = "insert into building_geom (id, name, tag, geom) values (";
      var ins_st = query_insert + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'POINT(' + lat + ' ' + lon + ')\',3857));';
      //ins_st += ' select \''+id+'\' from buildings where not exists(select * from buildings where id = \''+id+'\')';
      //console.log(ins_st);
      var query = client.query(ins_st);
      flag_accept = false;
      name_accept = true;
      count++;
      /*
      query.on('error', function(error) {
        console.log(error);
        console.log(ins_st);
        console.log(count);
      });

      query.on('row', (row) => {
        results.push(row);

      });

    }

  }
}
*/

    for (var i = 0; i < way_list.length; i++) {
      if (way_list[i].hasOwnProperty('tag')) {
        var ref_list = way_list[i]['nd'];
        var ref_lat_list = [];
        var ref_lon_list = [];
        var lat;
        var lon;
        for (var j = 0; j < ref_list.length; j++) {
          var nd_id = ref_list[j]['$']['ref'];
          for (var k = 0; k < node_list.length; k++) {
            if (node_list[k]['$']['id'] == nd_id) {
              lat = node_list[k]['$']['lat'];
              lon = node_list[k]['$']['lon'];
              break;
            }
          }
          ref_lat_list.push(lat);
          ref_lon_list.push(lon);
        }

        var b_name;
        var b_type;
        var b_type_name;
        var flag_accept = false;
        var name_accept = false;
        var road_accept = false;
        var building_accept = false;
        var area_accept = false;
        var node = way_list[i];
        var type_flag = false;
        for (var j = 0; j < way_list[i]['tag'].length; j++) {
          //console.log(util.inspect(node_list[i]['tag'][j]['$'], false, null));

          if (node['tag'][j]['$']['k'] == 'name') {
            b_name = node['tag'][j]['$']['v'];
            name_accept = true;
          } else if (node['tag'][j]['$']['k'] == 'highway') {
            b_type = node['tag'][j]['$']['v'];
            if(b_type == 'yes'){
              b_type = 'highway';
            }
            road_accept = true;
            type_flag = true;
          } else if (node['tag'][j]['$']['k'] == 'building') {
            b_type = node['tag'][j]['$']['v'];
            if(b_type == 'yes'){
              b_type = 'building';
            }
            type_flag = true;
            building_accept = true;
          } else if (node['tag'][j]['$']['k'] == 'waterway') {
            b_type = node['tag'][j]['$']['v'];
            if(b_type == 'yes'){
              b_type = 'waterway';
            }
            type_flag = true;
            area_accept = true;
          } else if (node['tag'][j]['$']['k'] == 'golf') {
            b_type = 'golf';
            type_flag = true;
            area_accept = true;
          }else if(node['tag'][j]['$']['k'] == 'leisure' || node['tag'][j]['$']['k'] == 'area' || node['tag'][j]['$']['k'] == 'landuse'){
            b_type = node['tag'][j]['$']['v'];
            type_flag = true;
            area_accept = true;
          }
          /*
          else if (node['tag'][j]['$']['k'] == 'building') {
            b_type = 'building';
            flag_accept = true;
          }
          */

          if(type_flag == true && name_accept == true){
            break;
          }
        }
        if (name_accept == true && road_accept == true && building_accept == false && area_accept == false) {
          if (road_map.hasOwnProperty(b_type)) {
            var v = road_map[b_type];
            road_map[b_type] = v + 1;
          } else {
            road_map[b_type] = 1;
          }
          var id = node['$']['id'];
          var lat = node['$']['lat'];
          var lon = node['$']['lon'];
          if (b_name.length > 50) {
            b_name = b_name.slice(0, 50);
          }
          //이 부분 반복문으로 고쳐야 됨. lat_list랑 lon_list 써서 linestring만들것
          var query_insert = "insert into road_geom (id, name, tag, geom) values (";
          var ins_st = query_insert + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'LINESTRING(';
          for (var k = 0; k < ref_lat_list.length; k++) {
            ins_st = ins_st + ref_lat_list[k];
            ins_st = ins_st + ' ';
            ins_st = ins_st + ref_lon_list[k];
            ins_st = ins_st + ',';
          }
          ins_st = ins_st.slice(0, ins_st.length - 1);
          ins_st += ')\',3857));';
          //ins_st += 'ON DUPLICATE KEY UPDATE;'
          //  ins_st += ' select \''+id+'\' from roads where not exists(select * from roads where id = \''+id+'\')';
          //console.log(ins_st);

          var query = client.query(ins_st);

          count++;

          query.on('row', (row) => {
            results.push(row);

          });

        } else if (name_accept == true && road_accept == false && building_accept == true && area_accept == false) {
          if (building_map.hasOwnProperty(b_type)) {
            var v = building_map[b_type];
            building_map[b_type] = v + 1;
          } else {
            building_map[b_type] = 1;
          }

          var id = node['$']['id'];
          var lat = node['$']['lat'];
          var lon = node['$']['lon'];
          if (b_name.length > 50) {
            b_name = b_name.slice(0, 50);
          }


            var query_insert = "insert into building_geom (id, name, tag, geom) values (";
            //이 부분 반복문으로 고쳐야 됨. lat_list랑 lon_list 써서 linestring만들것
            var ins_st = query_insert + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'POLYGON((';
            for (var k = 0; k < ref_lat_list.length; k++) {
              ins_st = ins_st + ref_lat_list[k];
              ins_st = ins_st + ' ';
              ins_st = ins_st + ref_lon_list[k];
              ins_st = ins_st + ',';
            }
            ins_st = ins_st.slice(0, ins_st.length - 1);
            ins_st += '))\',3857));';
            //ins_st += 'ON DUPLICATE KEY UPDATE'
            //  ins_st += ' select \''+id+'\' from roads where not exists(select * from roads where id = \''+id+'\')';
            //console.log(ins_st);
            var query = client.query(ins_st);


          count++;

          query.on('error', function(error) {
            //console.log(error);
            //console.log(ins_st);

          });
          query.on('row', (row) => {
            results.push(row);

          });


        }
        /*
        else if( road_accept == false && building_accept ==false && area_accept == true){
          if(ref_lat_list[0] == ref_lat_list[ref_lat_list.length-1] && ref_lon_list[0] == ref_lon_list[ref_lon_list.length-1]){
            if (area_map.hasOwnProperty(b_type)) {
              var v = area_map[b_type];
              area_map[b_type] = v + 1;
            } else {
              area_map[b_type] = 1;
            }
            var query_insert = "insert into area_geom (id, name, tag, geom) values (";
            //이 부분 반복문으로 고쳐야 됨. lat_list랑 lon_list 써서 linestring만들것
            var ins_st = query_insert + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'POLYGON((';


            for (var k = 0; k < ref_lat_list.length; k++) {
              ins_st = ins_st + ref_lat_list[k];
              ins_st = ins_st + ' ';
              ins_st = ins_st + ref_lon_list[k];
              ins_st = ins_st + ',';
            }
            ins_st = ins_st.slice(0, ins_st.length - 1);
            ins_st += '))\',3857));';
            //ins_st += 'ON DUPLICATE KEY UPDATE;'
            //  ins_st += ' select \''+id+'\' from roads where not exists(select * from roads where id = \''+id+'\')';
            //console.log(ins_st);
            var query = client.query(ins_st);
          }
          /*
          else{
            if (road_map.hasOwnProperty(b_type)) {
              var v = road_map[b_type];
              road_map[b_type] = v + 1;
            } else {
              road_map[b_type] = 1;
            }
            var query_insert = "insert into road_geom (id, name, tag, geom) values (";
            //이 부분 반복문으로 고쳐야 됨. lat_list랑 lon_list 써서 linestring만들것
            var ins_st = query_insert + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'LINESTRING(';


            for (var k = 0; k < ref_lat_list.length; k++) {
              ins_st = ins_st + ref_lat_list[k];
              ins_st = ins_st + ' ';
              ins_st = ins_st + ref_lon_list[k];
              ins_st = ins_st + ',';
            }
            ins_st = ins_st.slice(0, ins_st.length - 1);
            ins_st += ')\',3857));';
            //  ins_st += ' select \''+id+'\' from roads where not exists(select * from roads where id = \''+id+'\')';
            //console.log(ins_st);
            var query = client.query(ins_st);
          }
          */

        }

      }




    console.log(JSON.stringify(building_map));
    console.log(JSON.stringify(road_map));
    console.log(JSON.stringify(area_map));
  });

})();



//});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
  console.log(count);
});
