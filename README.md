# Massive Distributed Channel Sounding Equipment 

Dette er repositoriet for bacheloroppgaven "MaDChaSE", i forbindelse med studieretningen elektronikk og sensorsystemer ved [NTNU](https://www.ntnu.no/). Med støtte fra [Nordic Semiconductor](https://www.nordicsemi.com/), ble prosjektet gjennomført for å utvikle et konseptbevis for et system som muliggjør massiv distribuering av noder i stand til å gjennomføre [kanalmåling](https://www.bluetooth.com/specifications/specs/channel-sounding-cr-pr/). Oppgaven ble avgrenset til håndteringen av hundrevis av noder på et nettverk. Dette inkluderer arbeid som: 

- Prototyping av noder.
- Distribuering av fastvare. 
- Verktøy for oppkobling av nye noder til et WiFi-nettverk.
- Kanalmålingsorkestrering og datainnsamling. 

Alle relevante filer inkludert dette databladet finnes under følgende link: https://github.com/Michalstank/MaDChaSE-E2418

## Innholdsfortegnelse
1. [Systemarkitektur](#systemarkitektur)
2. [Requirements](#Requirements)
   1. [Hardware](#hardware)
   2. [Software](#software)
   3. [nRF Libraries](#nrf-libraries) 
4. [Guide for oppsett](#guide-for-oppsett)
    1. [Hardware Oppsett](#Hardware-Oppsett)
    3. [Server Oppsett](#Server-Oppsett)
    4. [Distribusjon av fastvare](#distribusjon-av-fastvare)
    5. [RPI Oppsett](#RPI-Oppsett)
5. [Bash Script](#bashscript)
    1. [Flagg Oversikt](#flagg-oversikt)
    2. [Flagg Kode](#flagg-kode)
  
# Systemarkitektur
Det utviklede systemet baserer seg på noder i form av [nRF52833 Dk.]( https://www.nordicsemi.com/Products/Development-hardware/nRF52833-DK) og [RPI 3B+](https://www.raspberrypi.com/products/raspberry-pi-3-model-b-plus/). nRF-enheten gjennomfører kanalmålinger, mens RPI 3B+ står for nettverkskommunikasjon og distribuerer fastvare nødvendig for målingene. En server brukes som mellomleddet mellom nodene og brukergrensesnittet. Serveren kommuniserer med nodene over et WiFi-nettverk og står for kanalmålingsorkestrering og samhandling. Brukergrensesnittet er i form av en nettside. 
![image](https://github.com/shakerhoudini/VHDL/blob/9421bcb0c60f7aab8808be60aede336b4b58db95/blok_diag.png)

# Requirements
## Hardware 
- En Router / Access Point med Wi-Fi
- nRF52833 Dk.
- Raspberry Pi 3B+ (Eller tilsvarende modell som støtter Rasbian v11.9)
- Micro SD kort
- Power Supply for RPI 
- USB-A til Micro-USB-B kabel

## Software 
- Minst versjon av NodeJS v18.13.0
- Node pakkene: socketio, express.
- Mulighet for å sjekke IP av enheter koblet til Routeren / Access Point

## nRF Libraries
- <zephyr/kernel.h>
- <zephyr/gpio.h>
- <zephyr/uart.h>
- [libnrf_dm.a](https://github.com/nrfconnect/sdk-nrfxlib/blob/main/nrf_dm/lib/nrf52833/hard-float/libnrf_dm.a)

# Guide for oppsett
## Hardware oppsett
RPI 3B+ og nRF52833 Dk. som utgjør nodene, kommuniserer med hverandre ved hjelp av UART-protokollen. For å muliggjøre kommunikasjonen, kobl nRF-en til en av USB-A portene på RPI. For å forsyne noden med strøm kobl RPI til strømforsyning. Dette kreves ikke enda, det gjennomføres underveis RPI oppsettet.

Det ble også utviklet en innkapsling til nodene som kan 3D-printes. De tilhørende filene finnes [her.](https://github.com/Michalstank/MaDChaSE-E2418/tree/48b5f4ba134b89f2b8a7d6ff9e974852505d02e9/Extras)
![image](https://github.com/shakerhoudini/VHDL/blob/395771d89b2dca0d43f5f726d94a6666bfbc4f7c/Nodes.png)

## Server oppsett

Denne delen har som formål å vise de nødvendige stegene for å sette opp serveren. 

1. Last ned [Server Files](https://github.com/Michalstank/MaDChaSE-E2418/tree/main/SVR).
2. Utpakk filene og bestem hvilken algoritme du ønsker å bruke (list eller rng.).
3. Start 'Node.js Command Prompt'
4. Start serveren ved å skrive inn følgende kommando:
```bash
node server_file_name.js
```
5. Om det forekommer en feil, dobbelsjekk at alle filene er i samme mappe.
6. For å logge på brukergrensesnittet, finn først IP-en til datamaskinen der serveren skal 'hostes' og legg til dens port på følgende form: IP:PORT. For å nå brukergrensesnittet skriv deretter den sammensatte IP-en og porten inn i nettleseren.
```bash
192.168.10.187:3000 or localhost:3000
```
7. For at nodene skal være i stand til å koble seg opp til serveren din, endr client.py filen. Definer IP'en du tidligere fant på linje 119:
```python
sio.connect('http://IP:PORT', retry = True); example: sio.connect('http://192.168.2.12:3000', retry = True) 
```

## Distribusjon av fastvare

Nodene i prosjektet henter programvaren sin fra et gitt [Github Repo.](https://github.com/Michalstank/MaDChaSE-E2418-Fastvare) Om du har lyst å endre hvilket repo fastvaren lastes ned fra, endr linken i flagg ['-d'](#flagg--d-kode) i bash scriptet til ønsket repo.<br/> HUSK: linken som erstattes skal være til et 'raw' format av filen på github. Dette gir deg muligheten til å teste ut din egen fastvare på nodene. 

## RPI Oppsett

Denne delen forklarer trinnvis hvordan nodene skal settes opp og programmeres. For hver node i systemet gjennomfør følgende oppstartsprosedyre:

1. Last ned filene: [Bash Script](https://github.com/Michalstank/MaDChaSE-E2418/blob/main/RPI/node_system.sh), [Raspberry Pi Imager](https://downloads.raspberrypi.org/imager/imager_latest.exe) og [RPI Image](https://downloads.raspberrypi.com/raspios_oldstable_full_armhf/images/raspios_oldstable_full_armhf-2024-03-12/2024-03-12-raspios-bullseye-armhf-full.img.xz).
3. Flash RPI SD kortet ved bruk av Raspberry Pi Imager, bildet nedenfor viser anbefalt konfigurasjon. (Huske å legge til Wi-Fi login og passord til nettverket du ønsker at nodene skal kobles på):<br />
   ![image](https://github.com/Michalstank/MaDChaSE-E2418/assets/31627253/1cca488a-f8cd-445a-be60-3683ddc801fe)

5. Legg inn SD-kortet i RPI og kobl enheten til strøm. Deretter logg på Router / Access Point for å hente dens IP-adresse.
6. Send over bash script-filen ved bruk av:
```bash
scp PATH_TO_BASH_SCRIPT rpi_navn@rpi_ip:/home/rpi_navn/
```
6. Kobl deg opp til noden ved hjelp av SSH-protokollen: <br /> Hint: Dette steget kan unngås dersom du kobler opp din RPI til en skjerm og tastatur. Etter oppkoblingen åpn opp terminalen og følg steg 7.
```bash
shh rpi_navn@rpi_ip 
```
7. Gjør Bash scriptet til en executable:
```bash
chmod u+x bash_script_navn.sh
```
8. Nå er det mulig å kjøre Bash scriptet dersom man er i samme directory som den:
```bash
./bash_script_navn.sh
```
9. Bash scriptet kan nå også konfigureres til å kjøre ved systemstart. Dette gjøres ved å legge dens 'path' til rc.local filen:
```bash
sudo nano /etc/rc.local
```
10. Dersom du har fulgt stegene skal oppsettet ligne på det nedenfor:
```bash
#Kommentar og default kode over...
./home/rpi_navn/bash_script_navn.sh
```

# Bash Script
Nodenes fastvare oppdateres ved hjelp av et Bash script. Det anvendes for å laste ned bibliotekene, filene og verktøyene som brukes på RPI-en.
## Flagg Oversikt

| Flag | Funksjon |
|------|----------|
|`-p`  | Installerer nødvendige Python-bibliotek systemet benytter. |
|`-d`  | Laster ned de nye filene for noden: Client.py og Zephyr.hex (Fastvare for nFR). |
|`-f`  | Installer JLink på RPI og lager et eget directory for den. |
|`-j`  | Installerer fastvare til nRF-en ved hejlp av HEX-filer via. JLink. |
|`-r`  | Sletter gammelt directory laget for JLink. |
|`-s`  | Starter klient-delen etter prosessering av tidligere flagg. |

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
			expect "J-Link>"	{ send "loadfile /home/e2418/zephyr.hex\r"}
			expect "J-Link>"	{ send "r\r"		}
			expect "J-Link>"	{ send "g\r"		}
			expect "J-Link>"	{ send "exit\r"		}
		EOF

		#Return the the previous directory after done with flashing
		cd ..
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

# Anerkjennelser
- Vi vil rette en spesiell takk til vår eksterne veileder [Carsten Wulf](https://www.ntnu.no/ansatte/carstenw), for teknisk assistanse og verdifulle tilbakemeldinger underveis i prosjektgjennomføringen. Vi setter pris på [eksempelkoden](https://github.com/wulffern/nrfdmiq/tree/main) vi fikk mulighet til å ta i bruk.
- Vi vil også takke vår prosessveileder [Arne Midjo](https://www.ntnu.no/ansatte/arne.midjo) for råd og støtte gjennom hele prosjektet.
