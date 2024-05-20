/*
	* USE EXTENSION "BETTER COMMENTS by Aaron Bond" FOR BETTER READABILITY
	
	Ref:

	Normal Comment
	//Crossed off Comment (if in multiline comment)
	!RED ERROR LIKE COMMENT
	TODO: TODO ITEM
	* BRIGH COMMENT
	? QUESTION COMMENT ?
*/

#include <zephyr/kernel.h>

#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/uart.h>

#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>

#include "nrf_dm.h"
#include "uart_com.h"

/*
	Struct used to keep data about the UART Configuration
*/
const struct uart_config uart_cnf = {
	.baudrate = 115200,
	.parity = UART_CFG_PARITY_NONE,
	.stop_bits = UART_CFG_STOP_BITS_1,
	.data_bits = UART_CFG_DATA_BITS_8,
	.flow_ctrl = UART_CFG_FLOW_CTRL_NONE
};

typedef enum {
    INITIATOR,
    REFLECTOR,
    NONE
} NODE_TYPE;

bool node_update_role = false;
bool run_meas = false;

NODE_TYPE node_mode = NONE;

void update_role();

int main(void)
{
	//Check If Ready
	if(!device_is_ready(uart_dev)){
		return 10;
	}

	//Check if Configuration Avaible on the Card
	int err = uart_configure(uart_dev, &uart_cnf);

	//If Error Code Match Return Error Code
	if(err == -ENOSYS){
		return -ENOSYS;
	}

	uart_init();

	// * Main Loop

	while(1){

		//Configures and enables the Recieve for UART
		uart_rx_enable(uart_dev, uart_data, sizeof(char)*uart_buffer_size,0);

		//If 4th character in the buffer is not the end of string execute processing of command
		if(uart_data[3] != '\0'){	
			node_update_role = true;	
			uart_rx_disable(uart_dev);
		}

		//Execute code to update role
		update_role();
		
		/*
			Code to execute when the system is set to Initiator Mode
		*/
		if(node_mode == INITIATOR && run_meas){
			
			uart_reset_raport();

			uint32_t nrf_timeout_us 		= 0.5e6;

			nrf_dm_status_t status = nrf_dm_proc_execute(nrf_timeout_us);

			float uart_dis 					= 0;
			uint32_t uart_dur 				= 0;
			uint8_t hopping_seq[NRF_DM_CHANNEL_MAP_LEN];


			/*
				If distance was measured successfully the system will calculate distances
				The distances will be calculated using both the simplified less accurate nrf_dm_calc
				as well as the high precission algorithm nrf_dm_high_precision_calc
			*/
			if(status == NRF_DM_STATUS_SUCCESS){

				nrf_dm_populate_report(&uart_dm_report);

				nrf_dm_calc(&uart_dm_report);

				uart_dur = nrf_dm_get_duration_us(&uart_dm_config);

				uart_dis = nrf_dm_high_precision_calc(&uart_dm_report);

				nrf_dm_get_hopping_sequence(&uart_dm_config, hopping_seq);
			} else {
				//If Distance Measurement failed set quality to 100
				uart_dm_report.quality = 100;
			}

			//Quality 100 = Failed measurement therefore the system will transmit anything but Quality = 100
			if(uart_dm_report.quality != 100){
				//Translate Measured Data to JSON format and transmit it over UART
				uart_nrf_dm_report_to_json(&uart_dm_report, uart_dis, uart_dur, hopping_seq);
			}

			run_meas = false;

		/*
			Code to execute when the node is set to reflector mode
			Primarly focuses on the configuration of the nrf into reflector mode
		*/
		} else if(node_mode == REFLECTOR && run_meas){

			nrf_dm_status_t status = nrf_dm_configure(&uart_dm_config);

			uint32_t dm_timeout = 1e6;

			status = nrf_dm_proc_execute(dm_timeout);

			run_meas = false;
		}
	}
	return 0;
}

/*
	@brief Code to execute once a command from rpi has been recieved. @brief
	@note Proccesses how to configure the nrf based on the recived command.
*/
void update_role(){
	if(node_update_role){

		nrf_dm_role_t current_role;

		//Read Content of USART Transmmited string and compare if it is one of recognised command
		if(        !strncmp(uart_data,"Init.",4)){
			//Set seed necesary for the distance measurement system
			uart_dm_config.rng_seed 	= 0x44ddaafa;

			//Change Mode of node to initiator and change the configuration of dm config
			node_mode = INITIATOR;

			//Update the distance measurement config
			uart_dm_config 				= NRF_DM_DEFAULT_CONFIG;
			uart_dm_config.role			= NRF_DM_ROLE_INITIATOR;

			current_role 				= NRF_DM_ROLE_INITIATOR;

			//Stop the measurement
			run_meas = false;

			//Check if configuration of dm lib was succesful
			nrf_dm_configure(&uart_dm_config);

		//Same functionality as first if case
		} else if (!strncmp(uart_data,"Refl.",4)){
			uart_dm_config.rng_seed 	= 0x44ddaafa;

			node_mode = REFLECTOR;

			uart_dm_config 				= NRF_DM_DEFAULT_CONFIG;
			uart_dm_config.role			= NRF_DM_ROLE_REFLECTOR;

			current_role 				= NRF_DM_ROLE_REFLECTOR;

			run_meas = false;

			nrf_dm_configure(&uart_dm_config);
		//Same functionality as first if case
		} else if (!strncmp(uart_data,"None.",4)){
			uart_dm_config.rng_seed 	= 0;

			node_mode = NONE;

			uart_dm_config 				= NRF_DM_DEFAULT_CONFIG;
			uart_dm_config.role			= NRF_DM_ROLE_NONE;

			current_role 				= NRF_DM_ROLE_NONE;

			nrf_dm_configure(&uart_dm_config);

			run_meas = false;
		
		//
		} else if (!strncmp(uart_data, "Meas.", 4)){
			run_meas = true;
			current_role = uart_dm_config.role;
			uart_put_string("CMeas Start.");
			//If the command does not match any of the predetermined print "Wrong Comamnd" back to the server
		}else {	
			uart_put_string("Cwrng_cmd.");
		}

		//Double check if the mode has updated successfully.
		//If correct print out confirmation to the server.
		if(uart_dm_config.role == current_role){
			uart_put_string("CConf.");
		} else {
			uart_put_string("Cwrng.");
		}

		node_update_role = false;

		//Reset Input String
		memset(uart_data, '\0' , sizeof(uart_data));
	}
}