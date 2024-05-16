# Massive Distributed Channel Sounding Equipment 

Dette er repositoriet for bacheloroppgaven "MaDChaSE", i forbindelse med studieretningen elektronikk og sensorsystemer ved [NTNU](https://www.ntnu.no/). Med støtte fra [Nordic Semiconductor](https://www.nordicsemi.com/), ble prosjektet gjennomført for å utvikle et konseptbevis for et system som muliggjør massiv distribuering av noder i stand til å gjennomføre [kanalmåling](https://www.bluetooth.com/specifications/specs/channel-sounding-cr-pr/). Oppgaven ble avgrenset til håndteringen av hundrevis av noder på et nettverk. Dette inkluderer arbeid som: 

- Prototyping av noder.
- Distribuering av fastvare. 
- Verktøy for oppkobling av nye noder til et WiFi-nettverk.
- Kanalmålingsorkestrering og datainnsamling. 

## Table of contents
1. [Oppsett](#Oppsett)
    1. [Requirements](#Requirements)
    2. [Server Oppsett](#Server-Oppsett)
    3. [RPI Oppsett](#RPI-Oppsett)
2. Bashscript
    1. [Flagg Oversikt](#flagg-oversikt)
    2. [Flagg Kode](#flagg-kode)
  
## Systemarkitektur
Det utviklede systemet baserer seg på noder i form av nRF52833 Dk. og RPI 3B+. nRF-enheten gjennomfører kanalmålinger, mens RPI 3B+ står for nettverkskommunikasjon og distribuerer fastvare nødvendig for målingene. En server brukes som mellomleddet mellom nodene og brukergrensesnittet. Serveren kommuniserer med nodene over et WiFi-nettverk og står for kanalmålingsorkestrering og samhandling. Brukergrensesnittet er i form av en nettside. 
![image](https://github.com/shakerhoudini/VHDL/blob/9421bcb0c60f7aab8808be60aede336b4b58db95/blok_diag.png)

## Hardware Requirements
For å sette opp systemet kreves det følgende hardware:
- En Router / Access Point med Wi-Fi
- nRF52833 Dk.
- Raspberry Pi 3B+ (Eller tilsvarende modell som støtter---)
- Micro SD kort


## Software Requirements
- Mulighet for å sjekke IP av enheter koblet til Routeren / Access Point
- Minst NodeJS v18.13.0
- Node pakkene: socketio, express.

# Guide for oppsett

## Server Oppsett

Denne delen har som formål å vise de nødvendige stegene for å sette opp serveren. 

1. Last ned [Server Files](https://github.com/Michalstank/MaDChaSE-E2418/tree/main/SVR).
2. Unpakk filene og bestem hvilket algoritme du onsker å bruke.
3. Start 'NodeJS Command Prompt'
4. Start serveren ved å skrive følgende kommando:
```bash
node server_file_name.js
```
5. Om det blir feil dobbelsjek at alle filene er i samme mappe.
6. Man kan logge på brukergrensesnittet ved å ta IP til pc'en der serveren er hosted og attach port til den (IP:PORT):
```
192.168.10.187:3000 or localhost:3000
```

## RPI Oppsett

Dette section fokuserer på forklaring av hvordan nodene skal settes opp og programeres

1. Last ned følgende filer: [Bashscript](), [Raspberry Pi Imager](https://downloads.raspberrypi.org/imager/imager_latest.exe) og [RPI Image](https://downloads.raspberrypi.com/raspios_oldstable_full_armhf/images/raspios_oldstable_full_armhf-2024-03-12/2024-03-12-raspios-bullseye-armhf-full.img.xz).
3. Flash RPI SD kortet ved bruk av Raspberry Pi Imager, bildet nede viser anbefal konfigurasjon (Huske på å legge til Wi-Fi passord og login til nettverket du onsker at nodene skal kobles på): 
4. Kobl opp RPI til strøm og deretter logg på Router / Access Point for å hente IP adressen til den.
5. Send over bashscript filen ved bruk av:
```bash
scp PATH_TO_BASHSCRIPT rpi_navn@rpi_ip:/home/rpi_navn/
```
6. Kobl til noden ved bruk av:
```bash
shh rpi_navn@rpi_ip 
```
7. Gjør Bashscript til en executable:
```bash
chmod u+x bashscript_name.sh
```
8. Nå det er mulig å kjøre Bashscript dersom man er i samme directory som den:
```bash
./bashscript_name.sh
```
9. Bashscript nå kan også bli konfigurert for å kjøre ved system start, det gjøres ved å legge path til den i rc.local fila: TEST IF POSSIBLE
```bash
sudo nano /etc/rc.local
```

## Flagg Oversikt

| Flag | Funksjon |
|------|----------|
|`-p`  |          |
|`-j`  |          |
|`-d`  |          |
|`-f`  |          |
|`-r`  |          |
|`-s`  |          |

## Flagg Kode
### Flagg '-p' Kode
```bash
		p) 
			#Install needed python packages
			sudo pip install python-socketio

			sudo pip install "python-socketio[client]"

			sudo pip install pyserial
		;;
```
### Flagg '-j' Kode
```bash
#Install JLink
		j) 
			#Remove Old JLink Folder
			sudo rm -r JLINK_DATA

			#Download JLink Package
			sudo wget --post-data 'accept_license_agreement=accepted&non_emb_ctr=confirmed&submit=Download+software' https://www.segger.com/downloads/jlink/JLink_Linux_arm.tgz

			#Create Unpack Directory
			sudo mkdir JLINK_DATA

			#Unpack JLink into Its New Directory
			sudo tar -xf JLink_Linux_arm.tgz -C ./JLINK_DATA --strip-components=1

			#Delete JLink Package
			sudo rm JLink_Linux_arm.tgz
		;;
```
### Flagg '-d' Kode
```bash
#Download new client and hex file
		d)
			#Remove Old Files
			sudo rm client.py
			sudo rm zephyr.hex

			#Download python client code
			wget --no-check-certificate "https://raw.githubusercontent.com/Michalstank/TEST-DOWNLOAD-REPO/main/client.py"

			#Download hexfile code
			wget --no-check-certificate "https://raw.githubusercontent.com/Michalstank/TEST-DOWNLOAD-REPO/main/zephyr.hex"
		;;
```
### Flagg '-f' Kode
```bash
#Flash Using JLink
		f)	
			#Download Expect and Install Expect, Needed For Flashing/Dealing with JLink
			sudo apt-get -y install expect

			#Move To JLink Directory
			cd JLINK_DATA

			#Start Expect and run JLink Flashing Process
			expect <<-EOF
				set timeout -1
				spawn sudo ./JLinkExe
				expect "J-Link>" 	{ send "connect\r" 	}
				expect "Device>"	{ send "nrf52833\r"	}
				expect "TIF>" 		{ send "S\r" 		}
				expect "Speed>"		{ send "\r" 		}
				expect "J-Link>"	{ send "loadfile /home/e2418/BashTest/zephyr.hex\r"}
				expect "J-Link>"	{ send "r\r"		}
				expect "J-Link>"	{ send "g\r"		}
				expect "J-Link>"	{ send "exit\r"		}
			EOF

			#Return the the previous directory after done with flashing
			cd ..
		;;
```
### Flagg '-r' Kode
```bash
#Remove JLink folder post install
		r)
			sudo rm -r JLINK_DATA
		;;
```
### Flagg '-s' Kode
```bash
#Run the server
		s) 
			python client.py
			flag_p=$OPTARG
		;;
```

[//] <> -------------------------------------------------------------------------------------------------------------------------------

# TEST

## mindre Test

### Minst Test

line

Image:

![image](https://github.com/Michalstank/MaDChaSE-E2418/assets/31627253/acef1b54-d0af-4a08-932f-2081fa88ebae)


| table test | info |
|------------|------|
|test Test   | info |

Code:
```js
  let test = 1
```

```bash
  cd /home/
```


Linken til github pga det skal være en del av hoved reporten: https://github.com/Michalstank/MaDChaSE-E2418
