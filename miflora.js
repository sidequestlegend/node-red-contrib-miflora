const miflora = require('miflora');
module.exports = function(RED) {
    function MifloraNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        const opts = {
            duration: 60000,
            ignoreUnknown: true,
            addresses: [config.mac]
        };
        miflora.discover(opts)
            .then(devices => node.device = devices[0]);
        const getSensorValues = (msg) => {
            if(node.device) {
                msg = msg || {};
                node.device.queryFirmwareInfo()
                    .then(() => node.device.querySensorValues())
                    .then(res => {
                        msg.payload = res;
                        node.send(msg);
                    })
            }
        };
        node.on('input', msg => getSensorValues(msg));
        if(config.interval) {
            setInterval(()=>getSensorValues(), config.interval);
        }
    }
    RED.nodes.registerType("miflora",MifloraNode);
 }


//
// const http = require('http');
// const cors = require('cors');
// const express = require('express');
// const PGClient = require('pg').Client;
//
// class Grow {
//     constructor() {
//         const opts = {
//             duration: 60000,
//             ignoreUnknown: true,
//             addresses: ['c4:7c:8d:66:23:b5']
//         };
//         this.thermo = 'http://192.168.0.28?m=1';
//         this.light = 'http://192.168.0.34?m=1';
//         this.db_info = {
//             user: 'postgres',
//             host: 'localhost',
//             password: 'ajfgakgfkhjekjfef387528642rwhfwt',
//             database: 'grow',
//             port: 5432
//         };
//         this.setupConnection();
//         miflora.discover(opts)
//             .then(devices => this.device = devices[0])
//             .then(() => this.mainLoop());
//         let app = express();
//         let server = http.createServer(app);
//         app.use(cors({ origin: true}));
//         app.use(express.static(__dirname+'/GrowView/dist/GrowView/'));
//         server.listen(48000);
//         app.get('/data_logs/:start_date/:end_date', (req,res)=> {
//             this.db.query({
//                 text: 'SELECT * FROM data_logs WHERE created BETWEEN $1 AND $2',
//                 values: [req.params.start_date,req.params.end_date],
//             })
//                 .then(dbres=>{
//                     res.send(JSON.stringify(dbres.rows));
//                 })
//                 .catch(error => {
//                     res.send(JSON.stringify([]));
//                     console.log(error);
//                 })
//         });
//     }
//
//     setupConnection() {
//         this.db = new PGClient(this.db_info);
//         this.db.connect();
//         this.db.on('error', er => {
//             console.error('An idle client has experienced an error', er.stack);
//             this.setupConnection();
//         });
//     }
//
//     get_http(url) {
//         return new Promise(resolve => {
//             http.get(url, (resp) => {
//                 let data = '';
//                 resp.on('data', (chunk) => {
//                     data += chunk;
//                 });
//                 resp.on('end', () => {
//                     resolve(data);
//                 });
//             }).on("error", (err) => {
//                 console.log("Error: " + err.message);
//             });
//         });
//     }
//
//     mainLoop() {
//         this.getData();
//         setInterval(() => {
//             this.getData();
//         }, 300 * 1000);
//     }
//
//     getData() {
//         if (!this.device) return;
//         let fw, sensors, light, thermo, record = {};
//         this.device.queryFirmwareInfo()
//             .then(() => this.device.querySensorValues())
//             .then(res => sensors = res)
//             .then(() => this.get_http(this.light))
//             .then(res => light = res)
//             .then(() => this.get_http(this.thermo))
//             .then(res => thermo = res)
//             .then(() => {
//                 record.thermo_on = !!~thermo.indexOf('>ON</div></td></tr></table>');
//                 record.light_on = !!~light.indexOf('>ON</div></td></tr></table>');
//                 const thermo_values = thermo.split(/\{[a-z]\}/).filter(d => d).map(d => parseFloat(d)).filter(d => !Number.isNaN(d));
//                 record.thermo_temp = thermo_values[0] || 0;
//                 record.thermo_humidity = thermo_values[1] || 0;
//                 record.plant_one_battery = sensors.firmwareInfo ? sensors.firmwareInfo.battery : 0;
//                 record.plant_one_temperature = sensors.sensorValues ? sensors.sensorValues.temperature : 0;
//                 record.plant_one_lux = sensors.sensorValues ? sensors.sensorValues.lux : 0;
//                 record.plant_one_moisture = sensors.sensorValues ? sensors.sensorValues.moisture : 0;
//                 record.plant_one_fertility = sensors.sensorValues ? sensors.sensorValues.fertility : 0;
//             })
//             .then(() => this.db.query({
//                 text: 'INSERT INTO data_logs(thermo_on,light_on,thermo_temp,thermo_humidity,plant_one_battery,plant_one_temperature,plant_one_lux,plant_one_moisture,plant_one_fertility) VALUES' +
//                     '($1,$2,$3,$4,$5,$6,$7,$8,$9)',
//                 values: [record.thermo_on, record.light_on, record.thermo_temp, record.thermo_humidity, record.plant_one_battery,
//                     record.plant_one_temperature, record.plant_one_lux, record.plant_one_moisture, record.plant_one_fertility],
//             })
//                 .catch(error => {
//                     console.log(error);
//                 }));
// //      .then(() => console.log(sensors,light,thermo));
//     }
// }
//
// module.exports = new Grow();
//
//
