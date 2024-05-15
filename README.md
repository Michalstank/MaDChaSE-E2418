# MaDChaSE

Linken til github pga det skal være en del av hoved reporten: https://github.com/Michalstank/MaDChaSE-E2418

Dette er hoved repo for bacheloroppgaven skrevet for [NTNU](https://www.ntnu.no/) i sammearbeid med [Nordic Semiconductors](https://www.nordicsemi.com/).

DAJ SUMMARY PROJECKTY TAK NA 1 AKAPIT

## Requirements
- En Router / Access Point med Wi-Fi
- Mulighet for å sjekke IP av enheter koblet til Routeren / Access Point
- Minst 2 Noder (RPI + nRF52833)
- Minst NodeJS v18.13.0
- Node pakkene: socketio, express.

## Server Oppsett

Dette section forteller hvordan serveren skal settes opp.

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

## Flag Oversikt

| Flag | Funksjon |
|------|----------|
|-p    |          |
|-j    |          |
|-d    |          |
|-f    |          |
|-r    |          |
|-s    |          |

### Flagg '-p' Kode
```

```
### Flagg '-j' Kode
```

```
### Flagg '-d' Kode
```

```
### Flagg '-f' Kode
```

```
### Flagg '-r' Kode
```

```
### Flagg '-s' Kode
```

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

