var express = require('express');
var app = express();
var http = require('http');
var util = require('util');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var fs = require('fs');
var pg = require('pg-query')
var username = "postgres" // sandbox username
var password = "gis" // read only privileges on our table
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
  var q_st_building = 'insert into buildings (id, name,building,position) values(';
  var q_st_road = 'insert into roads (id, name, road,positions) values(';

  var xml = fs.readFileSync('./map.osm', {
    encoding: 'utf-8'
  });
  parser.parseString(xml, function(err, result) {
    //console.log(util.inspect(result['osm']['node'],false,null));
    var node_list = result['osm']['node'];
    var way_list = result['osm']['way'];
    var building_map = {};
    var road_map = {};
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
            flag_accept = true;
          } else if (node['tag'][j]['$']['k'] == 'building') {
            b_type = 'building';
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

          var ins_st = q_st_building + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'POINT(' + lat + ' ' + lon + ')\',3857))';
          //ins_st += ' select \''+id+'\' from buildings where not exists(select * from buildings where id = \''+id+'\')';
          //console.log(ins_st);
          var query = client.query(ins_st);
          flag_accept = false;
          name_accept = true;
          count++;
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
        var flag_accept = false;
        var name_accept = false;
        var building_accept = false;
        var node = way_list[i];
        for (var j = 0; j < way_list[i]['tag'].length; j++) {
          //console.log(util.inspect(node_list[i]['tag'][j]['$'], false, null));

          if (node['tag'][j]['$']['k'] == 'name') {
            b_name = node['tag'][j]['$']['v'];
            name_accept = true;
          } else if (node['tag'][j]['$']['k'] == 'highway') {
            b_type = node['tag'][j]['$']['v'];
            flag_accept = true;
          }
          //빌딩이고 폴리곤인 경우에 대한 처리
          /*
          else if (node['tag'][j]['$']['k'] == 'building') {
            b_type = node['tag'][j]['$']['v'];
            if(b_type == 'yes'){
              b_type = 'building';
            }
            building_accept = true;
          }
          */
          /*
          else if (node['tag'][j]['$']['k'] == 'building') {
            b_type = 'building';
            flag_accept = true;
          }
          */
        }
        if (flag_accept == true && name_accept == true) {
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
          var ins_st = q_st_road + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'LINESTRING(';
          for (var k = 0; k < ref_lat_list.length; k++) {
            ins_st = ins_st + ref_lat_list[k];
            ins_st = ins_st + ' ';
            ins_st = ins_st + ref_lon_list[k];
            ins_st = ins_st + ',';
          }
          ins_st = ins_st.slice(0, ins_st.length - 1);
          ins_st += ')\',3857))';
          //  ins_st += ' select \''+id+'\' from roads where not exists(select * from roads where id = \''+id+'\')';
          //console.log(ins_st);
          var query = client.query(ins_st);

          count++;
          query.on('error', function(error) {
            console.log(error);
            console.log(ins_st);
            console.log(count);
          });
          query.on('row', (row) => {
            results.push(row);

          });
        }
        //아래 부분은 building이고 polygon인 경우에 대한 처리.
        /*
        else if(name_accept == true && building_accept == true){
          if(building_map.hasOwnProperty(b_type)){
            var v = building_map[b_type];
            building_map[b_type] = v + 1;
          }
          else{
            building_map[b_type] = 1;
          }
          var id = node['$']['id'];
          var lat = node['$']['lat'];
          var lon = node['$']['lon'];
          if (b_name.length > 50) {
            b_name = b_name.slice(0, 50);
          }
          //이 부분 반복문으로 고쳐야 됨. lat_list랑 lon_list 써서 linestring만들것
          var ins_st = q_st_road + id + ',\'' + b_name + '\',\'' + b_type + '\',ST_GeomFromText(\'POLYGON(';
          for (var k = 0; k < ref_lat_list.length; k++) {
            ins_st = ins_st + ref_lat_list[k];
            ins_st = ins_st + ' ';
            ins_st = ins_st + ref_lon_list[k];
            ins_st = ins_st + ',';
          }
          ins_st = ins_st.slice(0, ins_st.length - 1);
          ins_st += ')\',3857))';
        //  ins_st += ' select \''+id+'\' from roads where not exists(select * from roads where id = \''+id+'\')';
          //console.log(ins_st);
          var query = client.query(ins_st);

          count++;
          query.on('error', function(error) {
            console.log(error);
            console.log(ins_st);
            console.log(count);
          });
          query.on('row', (row) => {
            results.push(row);

          });

        }
        */
      }
    }
    console.log(JSON.stringify(building_map));
    console.log(JSON.stringify(road_map));
  });

})();


app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
  console.log(count);
});
