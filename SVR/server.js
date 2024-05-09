let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

const { timeEnd } = require('console');
let fs = require('fs');

const line_end = "\r\n";

let first_node = true;

function node( unique_id, network_id, mode){
    this.connection_id = 0;
    this.node_unique_id = unique_id
    this.node_network_id = network_id
    this.node_mode = mode
}

function node_data(random_id, new_id, new_mode){
    this.node_unique_id = random_id
    this.node_network_id = `RPI_NODE_${new_id}`
    this.node_mode = new_mode
}

//Port at which the server will be hosted
const server_port = 3000

let current_initiator_id;
let current_reflector_id;

//"Lists" of connected nodes to the networks
let node_connection_key_map = new Map();
let node_list_map           = new Map();

//boolean to keep track if measurment is allowed
let node_meas_start = false;

//Amount of nodes that were processed and added to the server
let node_cnt = 0;

let wait_meas           = false
let node_pair_id        = 0
let node_pair_array     = []

/*
    Uses the map of connected nodes and generates all avaible combinations of nodes

    Resets the primary variables used to keep track of them
*/
function generate_node_pair_array(){
    node_pair_array = [];
    node_pair_id = 0;

    for(let key1 of Array.from(node_list_map.keys())){
        for(let key2 of Array.from(node_list_map.keys())){
            if(key1 != key2){
                node_pair_array.push([key1, key2])
            }
        }
    }
}

//Send File When Connected aka the webpage
app.get('/', function(req, res){
    //Add a check to verify if it a computer
    res.sendFile('C:/Users/Michal/Desktop/MaDChaSE-main/server/main.html');
});

//Whenever someone connects this gets executed
io.on('connection', function(socket){
    //Inform Console that new user connected
    console.log('A user connected');

    //Increase count of nodes added to the server
    node_cnt++;

    /*
        * ON    - SVR_LIST_REQUEST
        * FROM  - WEB
        * TO    - WEB

        - Transmit Entire Nodelist of connected nodes
    */
    socket.on('SVR_LIST_REQUEST', (data) => {
        io.emit('WEB_LIST_RECIEVE', Array.from(node_list_map.values()));
    })

    /*
        * ON    - SVR_NODE_REFLASH
        * FROM  - WEB
        * TO    - RPI

        - Transmit message for nodes causing them to restart and reflash the nrf
    */
    socket.on('SVR_NODE_REFLASH', (data) => {
        io.emit('RPI_NODE_REFLASH', 0);
        node_meas_start = false;
        console.log("Resetting the network");
    })
    
    /*
        * ON    - SVR_MEAS_START
        * FROM  - WEB
        * TO    - 

        - Recieve message for the server to start the distance measurement program
    */
    socket.on('SVR_MEAS_START', (data) => {
        node_meas_start = true;
        console.log("Measurement Started")
        generate_node_pair_array();
        console.log(node_pair_array);
    })

    /*
        * ON    - SVR_MEAS_STOP
        * FROM  - WEB
        * TO    - 

        - Recieve message for the server to stop the distance measurement program
    */
    socket.on('SVR_MEAS_STOP', (data) => {
        node_meas_start = false;
        io.emit('RPI_NODE_RESET', 0);
        console.log("Measurement Stopped");
    })

    /*
        * ON    - SVR_NODE_INIT
        * FROM  - RPI
        * TO    - RPI

        * data - node_unique_id

        - Handle Node connection to the node network
        ! Doesn't Trigger on webpage connection
    */
    socket.on("SVR_NODE_INIT", function(data){
        //Initialize Node if it was not detected
        console.log("New Node Initialization")
        
        //Send New data to the node
        io.emit('RPI_NODE_DATA', new node_data(data, node_cnt, 'O'))
        io.emit('WEB_NODE_DATA', new node_data(data, node_cnt, 'O'))

        let new_node = new node(data,`RPI_NODE_${node_cnt}`, 'O')
        new_node.connection_id      = socket.id;

        node_connection_key_map.set ( socket.id,                 new_node.node_network_id);
        node_list_map.set           ( new_node.node_network_id,  new_node);   
        
        if(node_pair_array.length > 1){
            generate_node_pair_array();
        }
        
    })

    /*
        * ON    - SVR_DATA_CONTENT
        * FROM  - RPI
        * TO    - FILE

        - Processes JSON data send from the rpi to the server
    */
    socket.on('SVR_DATA_CONTENT',function(data){
        const time = new Date()

        let json_data = JSON.parse(data)

        if(json_data['quality'] == 0){
            node_pair_id+=1
            wait_meas = false
        }

        if(node_pair_id >= node_pair_array.length){
            node_pair_id = 0
        }

        const csv_header = [`Initiator`,`Reflector`,`Time_local`,`i_local`,`q_local`,`i_remote`,`q_remote`,`hopping_sequence`,
        `sinr_local`,`sinr_remote`,`ifft_mm`,`phase_slope_mm`,`rssi_openspace_mm`,`best_mm`,`highprec_mm`,
        `link_loss_dB`,`duration_us`,`rssi_local_dB`,`rssi_remote_dB`,`txpwr_local_dB`,`txpwr_remote_dB`,`quality`]

        const csv_line_start = [current_initiator_id, current_reflector_id, `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}:${time.getMilliseconds()}`];

        let csvContent = csv_line_start + ','

        //TODO: REWORK TO SINGLE LINE
        for(let type in json_data){
            csvContent += `${String(json_data[type]).replace(/,/g,';')}` + ','
        }

        csvContent += line_end

        console.log("New Measurement:");
        console.log(csvContent);

        fs.stat('csvdata/measdata.csv', (err, stat) => {
            //If error = null it means that the file was oppened
            if(err == null){
                fs.appendFile('csvdata/measdata.csv', csvContent , (err) => {
                    if (err) throw err;
                })

            //If error != null then it meas that such a file does not exits and needs to be created
            } else {
                fs.writeFile('csvdata/measdata.csv', csv_header.join(',') + line_end + csvContent, (err) => {
                    if (err) throw err;
                    console.log("New Measurement file created.\n");
                })
            }
        })
    })

    /*
        * ON    - disconnect
        * FROM  - 
        * TO    - WEB

        - On disconnect remove the disconnected node from the system
        At the same time regenerate the measurement pair array and restart the system
    */
    socket.on('disconnect', (data) => {
        console.log('A user disconnected');

        let node_data = node_connection_key_map.get(socket.id)

        io.emit('WEB_NODE_REMOVE', node_list_map.get(node_data));

        node_list_map.delete(node_data);

        node_connection_key_map.delete(socket.id)

        if(node_data == current_initiator_id || node_data == current_reflector_id){
            generate_node_pair_array();
            node_pair_id = 0;
        }
    });
});

/*
    * ON    - node_meas_start
    * FROM  - 
    * TO    - RPI

    - Start the process of selecting Initiator and reflector
*/
setInterval(() => {
    if(node_meas_start == true && node_pair_array.length > 1 && wait_meas == false){
        io.emit('RPI_NODE_RESET',0)
        
        if(current_initiator_id != undefined && current_reflector_id != undefined){
            node_list_map.get(current_initiator_id).node_mode = 'O'
            node_list_map.get(current_reflector_id).node_mode = 'O'
        }

        let node_pair = node_pair_array[node_pair_id]

        node_list_map.get(node_pair[0]).node_mode = 'I'
        node_list_map.get(node_pair[1]).node_mode = 'R'

        io.emit('RPI_ROLE_UPDATE', node_list_map.get(node_pair[0]))
        io.emit('RPI_ROLE_UPDATE', node_list_map.get(node_pair[1]))
    
        wait_meas = true

        current_initiator_id = node_pair[0]
        current_reflector_id = node_pair[1]
    }
}, 2000)

/*
    * ON    - 
    * FROM  - 
    * TO    - RPI

    - Sends the request for data to the initiator
*/
setInterval(() => {
    if(node_list_map.size > 1 && current_initiator_id != undefined && current_reflector_id != undefined && node_meas_start == true){
        io.emit('RPI_DATA_REQUEST', node_list_map.get(current_initiator_id))
        io.emit('RPI_DATA_REQUEST', node_list_map.get(current_reflector_id))
    }
}, 1000);

// Start the Server at port 3000
http.listen(server_port, function(){
   console.log('listening on port: ' + server_port);
});
