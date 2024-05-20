let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let fs = require('fs');

const line_end = "\r\n";

function node( unique_id, network_id, mode){
    this.connection_id = 0;
    this.node_unique_id = unique_id
    this.node_network_id = network_id
    this.node_mode = mode
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

let webside_mode = false;

//Send website file when connected by browser
app.get('/', (req, res) => {
    if(webside_mode == false){
        res.sendFile('C:/Users/micha/Desktop/main.html');
    } else {
        res.sendFile('C:/Users/micha/Desktop/node_test.html');
    }
});

app.get(`/download_csv`,(req,res)=>{
    fs.stat('csvdata/measdata.csv', (err, stat) => {
        //If error = null it means that the file was oppened
        if(err == null){
            res.download("csvdata/measdata.csv")
        //If error != null then it meas that such a file does not exits and needs to be created
        } else {
            res.status(300).send('File Does Not Exits')
        }
    })
})

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
    socket.on('SVR_LIST_REQUEST', () => {
        io.emit('WEB_LIST_RECIEVE', Array.from(node_list_map.values()));
    })

    /*
        * ON    - SVR_NODE_REFLASH
        * FROM  - WEB
        * TO    - RPI

        - Transmit message for nodes causing them to restart and reflash the nrf
    */
    socket.on('SVR_NODE_REFLASH', () => {
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
    socket.on('SVR_MEAS_START', () => {
        node_meas_start = true;
        console.log("Measurement Started")
    })

    /*
        * ON    - SVR_MEAS_STOP
        * FROM  - WEB
        * TO    - 

        - Recieve message for the server to stop the distance measurement program
    */
    socket.on('SVR_MEAS_STOP', () => {
        node_meas_start = false;
        io.emit('RPI_NODE_RESET', 0);
        console.log("Measurement Stopped");
    })

    /*
        * ON    - SVR_NODE_RESTART
        * FROM  - WEB
        * TO    - RPI

        - Transmit message to a node causing them to restart henceforth redownload client and hexfile -> flash nrf
    */
    socket.on('SVR_NODE_RESTART',(data) => {
        io.emit('SVR_NODE_RESTART', data);
        console.log(`Restarting: ${data}`);
    })
    
    /*
        * ON    - SVR_NODE_MSG
        * FROM  - WEB
        * TO    - RPI
    
        - Transmit message to a node
    */
    socket.on('SVR_NODE_MSG', (data) => {
        console.log(`MSG For Node: ${data}`);
    })

    /*
        * ON    - SVR_NODE_INIT
        * FROM  - RPI
        * TO    - RPI

        * data - node_unique_id

        - Handle Node connection to the node network
        ! Doesn't trigger on webpage connection
    */
    socket.on("SVR_NODE_INIT", function(data){
        let new_node = new node(data,`RPI_NODE_${node_cnt}`, 'O')
        
        new_node.connection_id      = socket.id;

        //Send New data to the node
        io.emit('RPI_NODE_DATA', new_node)
        io.emit('WEB_NODE_DATA', new_node)

        node_connection_key_map.set ( socket.id                 , new_node.node_network_id);
        node_list_map.set           ( new_node.node_network_id  , new_node);   

        console.log("New Node Initialization")    
    })

    /*
        * ON    - SVR_DATA_CONTENT
        * FROM  - RPI
        * TO    - FILE

        - Processes JSON data send from the rpi to the server
    */
    socket.on('SVR_DATA_CONTENT',function(data){
        const time = new Date()

        let csv_header = [`Initiator`,`Reflector`,`Time_local`,`i_local`,`q_local`,`i_remote`,`q_remote`,`hopping_sequence`,
        `sinr_local`,`sinr_remote`,`ifft_mm`,`phase_slope_mm`,`rssi_openspace_mm`,`best_mm`,`highprec_mm`,
        `link_loss_dB`,`duration_us`,`rssi_local_dB`,`rssi_remote_dB`,`txpwr_local_dB`,`txpwr_remote_dB`,`quality`]

        while(data[0] != '{'){
            data = data.slice(1);
        }

        let json_data = JSON.parse(data)

        //Processed Measurement into csv string
        let csvContent = `${current_initiator_id},${current_reflector_id},${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}:${time.getMilliseconds()},[${json_data['i_local']}],[${json_data['q_local']}],[${json_data['i_remote']}],[${json_data['q_remote']}],[${json_data['hopping_sequence']}],[${json_data['sinr_local']}],[${json_data['sinr_remote']}],${json_data['ifft_mm']},${json_data['phase_slope_mm']},${json_data['rssi_openspace_mm']},${json_data['best_mm']},${json_data['highprec_mm']},${json_data['link_loss_dB']},${json_data['duration_us']},${json_data['rssi_local_dB']},${json_data['rssi_remote_dB']},${json_data['txpwr_local_dB']},${json_data['txpwr_remote_dB']},${json_data['quality']}`
        
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
    */
    socket.on('disconnect', () => {
        let node_data = node_connection_key_map.get(socket.id)

        io.emit('WEB_NODE_REMOVE', node_list_map.get(node_data));

        node_list_map.delete(node_data);

        node_connection_key_map.delete(socket.id)

        console.log('A user disconnected');
    });
});

/*
    * ON    - node_meas_start
    * FROM  - 
    * TO    - RPI

    - Start the process of selecting Initiator and reflector
*/
setInterval(() => {
    if(node_meas_start == true){
        let node_count = node_list_map.size;
        let node_keys = Array.from(node_list_map.keys())

        if(node_count > 1){
            let id_1 = node_keys[Math.floor(Math.random() * node_count)]
            let id_2 = node_keys[Math.floor(Math.random() * node_count)]
        
            if(id_1 != id_2){
                if(current_initiator_id != undefined){
                    node_list_map.get(current_initiator_id).node_mode = 'O'
                    node_list_map.get(current_reflector_id).node_mode = 'O'
                }
                
                // RESET ALL NODES
                io.emit('RPI_NODE_RESET', 0)

                // ID_1 = Initiator, ID_2 = Reflector
                node_list_map.get(id_1).node_mode = 'I'
                node_list_map.get(id_2).node_mode = 'R'
                
                io.emit('RPI_ROLE_UPDATE', node_list_map.get(id_1))
                io.emit('RPI_ROLE_UPDATE', node_list_map.get(id_2))

                current_initiator_id = id_1
                current_reflector_id = id_2
            }
        }
    }
}, 30000)

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
