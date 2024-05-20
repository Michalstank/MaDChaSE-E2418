#!/bin/bash
while getopts "pjrdfs" arg; do
	case $arg in
		#Install needed python packages
		p) 
			#Install needed python packages
			sudo pip install python-socketio

			sudo pip install "python-socketio[client]"

			sudo pip install pyserial
		;;
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
		#Download new client and hex file
		d)
			#Remove Old Files
			sudo rm client.py
			sudo rm zephyr.hex

			#Download python client code
			wget --no-check-certificate "https://raw.githubusercontent.com/Michalstank/MaDChaSE-E2418-Fastvare/main/client.py"

			#Download hexfile code
			wget --no-check-certificate "https://raw.githubusercontent.com/Michalstank/MaDChaSE-E2418-Fastvare/main/zephyr.hex"
		;;
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
		#Remove JLink folder post install
		r)
			sudo rm -r JLINK_DATA
		;;
		#Run the server
		s) 
			python client.py
			flag_p=$OPTARG
		;;
	esac
done
