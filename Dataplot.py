#This code is based on the following tutorial:
#https://youtu.be/XDv6T4a0RNc?si=RAKcbphPNVuq-0IF

import numpy as np 
import matplotlib.pyplot as plt
import statistics as st

#List with measurements 
distance = [1,1,1,1,2,3,3,3,3,3,5] 
#Number of bins for the plot 
#bins = [0.7 ,0.8, 0.9, 1.0, 1.1, 1.2, 1.3]

plt.hist(distance,bins=5, edgecolor='black')

#Plotting the vertical median line 
median = st.median(distance)
color = '#FF5349'
plt.axvline(median,color=color, label = 'Median')

#Captions 
plt.title('Node 1 til Node 2:')
plt.xlabel("millimeter")
plt.ylabel("Antall målinger")

#Plot layout
plt.legend()
plt.tight_layout() 
