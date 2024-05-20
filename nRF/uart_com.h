#pragma once

#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/uart.h>

#include <string.h>

#include "nrf_dm.h"

#define uart_buffer_size 20

//Uart Device and configuration, as well as distance measruerement report
const struct device* uart_dev = DEVICE_DT_GET(DT_NODELABEL(uart0));

static nrf_dm_config_t uart_dm_config;
static nrf_dm_report_t uart_dm_report;

static void uart_cb(const struct device*, struct uart_event*, void*);

//Function Prototypes
int     uart_put_char(uint8_t);
void    uart_put_string(char*);
void    uart_dist_to_json(char*, float);
void    uart_int_to_json(char*, int);

void    uart_init();
void    uart_uninit();

void    uart_tones_to_json(char*, float*, uint32_t);
void    uart_sinr_to_json(char*, nrf_dm_sinr_indicator_t*, uint32_t);
void    uart_uint8array_to_json(char*, uint8_t*, uint32_t);
void    uart_nrf_dm_report_to_json(nrf_dm_report_t*, float, int32_t, uint8_t*);

void    uart_reset_raport(void);

//Temporary data buffer for Rx input
static uint8_t uart_data[uart_buffer_size] = {'\0'};

/*
	Enables all interrapts for UART device
	Allows the communication with the RPI
*/
void uart_init(void){
	uart_irq_rx_enable(&uart_dev);
	uart_irq_tx_enable(&uart_dev);
	uart_irq_err_enable(&uart_dev);
}

/*
	Initializes all of the components of the uart
	Allows the communication with the RPI
*/
void uart_uninit(void){
	uart_irq_rx_disable(&uart_dev);
	uart_irq_tx_disable(&uart_dev);
	uart_irq_err_disable(&uart_dev);
}

//Transmit String
void uart_put_string(char* string){
	while(*string != '\0'){
		if(uart_put_char(*string)){
			*string++;
		}
	}
}

//Transmit Char
int uart_put_char(uint8_t ch){
	return !uart_tx(uart_dev, &ch, sizeof(ch), 0);
}

//Transmit Distance Data Over Uart In Form Of JSON File
void uart_dist_to_json(char *str, float f){
	int d = ((int)1000*f);
	uart_put_string("\"");
	uart_put_string(str);
	uart_put_string("\" : ");

	char val[5];

	itoa(d, val, 10);

	uart_put_string(val);
}

//Transmit Int Data Over Uart In Form Of JSON File
void uart_int_to_json(char *str, int d){
	uart_put_string("\"");
	uart_put_string(str);
	uart_put_string("\" : ");
  	
	char val[5];

	itoa(d, val, 10);

	uart_put_string(val);
}

//Transmit Tones Data Over Uart In Form Of JSON File
void uart_tones_to_json(char* str, float *arr, uint32_t len){
	uart_put_string("\"");
	uart_put_string(str);
	uart_put_string("\":[");

	for(uint32_t i = 0; i < len; i++){
		int f = ((int)32*arr[i]);

		char val[5];

		itoa(f, val, 10);

		uart_put_string(val);

		if((i+1) < len){
			uart_put_string(",");
		}
	}

	uart_put_string("]");
}

//Transmit Array Data Over Uart In Form Of JSON File
void uart_uint8array_to_json(char * str, uint8_t *array,uint32_t length){

  uart_put_string("\"");
  uart_put_string(str);
  uart_put_string("\":[");
  for (uint32_t i = 0; i < length; i++)
  {
	char val[3];

	itoa(array[i], val, 10);

	uart_put_string(val);

    if ((i + 1) < length)
    {
      uart_put_string(",");
    }
  }
  uart_put_string("]");
}

//Transmit SINR Data Over Uart In Form Of JSON File
void uart_sinr_to_json(char * str, nrf_dm_sinr_indicator_t *array,uint32_t length){

  uart_put_string("\"");
  uart_put_string(str);
  uart_put_string("\":[");
  for (uint32_t i = 0; i < length; i++)
  {

	char val[5];

	itoa(array[i], val, 10);

	uart_put_string(val);

    if ((i + 1) < length)
    {
      uart_put_string(",");
    }
  }
  uart_put_string("]");
}

//Function To Compose Entire Measured/Important Data Into A JSON File And Transmit It Over Uart
void uart_nrf_dm_report_to_json(nrf_dm_report_t *dm_report,float distance,int32_t duration, uint8_t *hopping_sequence){
  uart_put_string("J{\n");

  //- Print tones
  uart_tones_to_json("i_local",&dm_report->iq_tones->i_local[0],80); uart_put_string(",\n");
  uart_tones_to_json("q_local",&dm_report->iq_tones->q_local[0],80); uart_put_string(",\n");
  uart_tones_to_json("i_remote",&dm_report->iq_tones->i_remote[0],80); uart_put_string(",\n");
  uart_tones_to_json("q_remote",&dm_report->iq_tones->q_remote[0],80); uart_put_string(",\n");
  uart_uint8array_to_json("hopping_sequence",hopping_sequence,NRF_DM_CHANNEL_MAP_LEN); uart_put_string(",\n");

  //- Print tone_sinr
  uart_sinr_to_json("sinr_local",&dm_report->tone_sinr_indicators.sinr_indicator_local[0],80); uart_put_string(",\n");
  uart_sinr_to_json("sinr_remote",&dm_report->tone_sinr_indicators.sinr_indicator_remote[0],80); uart_put_string(",\n");

  //- Print ranging mode
  //- Print distances
  uart_dist_to_json("ifft_mm",dm_report->distance_estimates.mcpd.ifft);
  uart_put_string(",\n");
  uart_dist_to_json("phase_slope_mm",dm_report->distance_estimates.mcpd.phase_slope);
  uart_put_string(",\n");
  uart_dist_to_json("rssi_openspace_mm",dm_report->distance_estimates.mcpd.rssi_openspace);
  uart_put_string(",\n");
  uart_dist_to_json("best_mm",dm_report->distance_estimates.mcpd.best);
  uart_put_string(",\n");
  uart_dist_to_json("highprec_mm",distance);
  uart_put_string(",\n");

  //- Status params
  uart_int_to_json("link_loss_dB",dm_report->link_loss); 
  uart_put_string(",\n");
  uart_int_to_json("duration_us",duration); 
  uart_put_string(",\n");
  uart_int_to_json("rssi_local_dB",dm_report->rssi_local); 
  uart_put_string(",\n");
  uart_int_to_json("rssi_remote_dB",dm_report->rssi_remote); 
  uart_put_string(",\n");
  uart_int_to_json("txpwr_local_dB",dm_report->txpwr_local); 
  uart_put_string(",\n");
  uart_int_to_json("txpwr_remote_dB",dm_report->txpwr_remote); 
  uart_put_string(",\n");
  uart_int_to_json("quality",dm_report->quality);
  uart_put_string("\n}\n\r");
}

void uart_reset_raport(void){
    uart_dm_report.link_loss 	= 0;
    uart_dm_report.rssi_local 	= 0;
    uart_dm_report.rssi_remote 	= 0;
    uart_dm_report.txpwr_local 	= 0;
    uart_dm_report.txpwr_remote = 0;
    uart_dm_report.quality 		= 100;
    uart_dm_report.distance_estimates.mcpd.ifft 				= 0;
    uart_dm_report.distance_estimates.mcpd.phase_slope 		    = 0;
    uart_dm_report.distance_estimates.mcpd.rssi_openspace 	    = 0;
    uart_dm_report.distance_estimates.mcpd.best 				= 0;

	for(int i=0;i<80;i++){
    	uart_dm_report.iq_tones->i_local[i] 	= 0;
    	uart_dm_report.iq_tones->q_local[i] 	= 0;
    	uart_dm_report.iq_tones->i_remote[i] = 0;
    	uart_dm_report.iq_tones->q_remote[i] = 0;
   	}

   	for(int i=0;i<80;i++){
   		uart_dm_report.tone_sinr_indicators.sinr_indicator_local[i] 	= 0;
   		uart_dm_report.tone_sinr_indicators.sinr_indicator_remote[i] = 0;
   	}
}