import matplotlib.pyplot as plt

#In format of H: cnt
meas_cnt = {
    19: 1,
    20: 9,
    21: 19,
    22: 15,
    23: 17,
    0 : 5,
    1 : 15,
    2 : 12,
    3 : 10,
    4 : 10,
    5 : 16,
    6 : 19,
    7 : 17,
    8 : 35,
    9 : 14,
    10: 19,
    11: 22,
    12: 11
}

plt_cnt = []
for index in meas_cnt:
    plt_cnt.append(meas_cnt.get(index))

plt.bar(range(len(meas_cnt)), plt_cnt, color='#1f77b4', edgecolor = 'black')
plt.xticks(range(len(meas_cnt)),meas_cnt)

plt.title('Antall målinger per time')
plt.ylabel('Antall Målinger')
plt.xlabel('Klokkeslett')
plt.tight_layout()

###############################################################################

import matplotlib.pyplot as plt

#In format of H: cnt
meas_cnt = {
    17: 3,
    18: 3,
    19: 0,
    20: 9,
    21: 4,
    22: 7,
    23: 10,
    0: 5,
    1: 4,
    2: 8,
    3: 7
}

plt_cnt = []
for index in meas_cnt:
    plt_cnt.append(meas_cnt.get(index))

plt.bar(range(len(meas_cnt)), plt_cnt, color='#1f77b4', edgecolor = 'black')
plt.xticks(range(len(meas_cnt)),meas_cnt)

plt.title('Antall målinger per time')
plt.ylabel('Antall Målinger')
plt.xlabel('Klokkeslett')
plt.tight_layout()

###############################################################################

import matplotlib.pyplot as plt

#In format of H: cnt
meas_cnt = {19: 4,
            20: 4,
            21: 3,
            22: 4,
            23: 6,
            0: 3,
            1: 0,
            2: 0,
            3: 1,
            4: 4,
            5 : 3,
           }

plt_cnt = []
for index in meas_cnt:
    plt_cnt.append(meas_cnt.get(index))

plt.bar(range(len(meas_cnt)), plt_cnt, color='#1f77b4', edgecolor = 'black')
plt.xticks(range(len(meas_cnt)),meas_cnt)

plt.title('Antall målinger per time')
plt.ylabel('Antall Målinger')
plt.xlabel('Klokkeslett')
plt.tight_layout()

###############################################################################

import matplotlib.pyplot as plt

#In format of H: cnt
meas_cnt = {
    18: 6,
    19: 6,
    20: 4,
    21: 10,
    22: 9,
    23: 10,
    0: 7,
    1: 6,
    2: 6,
    3: 6,
    4: 5,
    5: 7,
    6: 8,
    7: 7,
    8: 10,
    9: 7,
    10: 4,
    11: 4
}

plt_cnt = []
for index in meas_cnt:
    plt_cnt.append(meas_cnt.get(index))

plt.bar(range(len(meas_cnt)), plt_cnt, color='#1f77b4', edgecolor = 'black')
plt.xticks(range(len(meas_cnt)),meas_cnt)

plt.title('Antall målinger per time')
plt.ylabel('Antall Målinger')
plt.xlabel('Klokkeslett')
plt.tight_layout()

###############################################################################

import matplotlib.pyplot as plt
import numpy as np

nodes = ['Node 1','Node 2','Node 3','Node 4']
#       Red      , Blue   , Yellow , Green

node_pair_cnt = [
    np.array([0, 22, 0, 34]), # Node 2 
    np.array([2, 0,  3, 4]), # Node 3
    np.array([6, 28, 0, 40]), # Node 4
    np.array([4, 8,  0, 0])  # Node 5
]

plt.title("Reflektor fordeling med tilhørende Noder")
plt.ylabel("Antall målinger")

plt.bar(nodes,node_pair_cnt[0],color='#621258')
plt.bar(nodes,node_pair_cnt[1],color='#B62B65',bottom=node_pair_cnt[0])
plt.bar(nodes,node_pair_cnt[2],color='#ED6863',bottom=node_pair_cnt[0]+node_pair_cnt[1])
plt.bar(nodes,node_pair_cnt[3],color='#FFA574',bottom=node_pair_cnt[0]+node_pair_cnt[1]+node_pair_cnt[2])

plt.legend(["Node 1", "Node 2", "Node 3", "Node 4"])

plt.show()

###############################################################################

import matplotlib.pyplot as plt
import numpy as np

nodes = ['Node 1','Node 2','Node 3','Node 4']
#       Red      , Blue   , Yellow , Green

node_pair_cnt = [
    np.array([0,  44, 1, 41]), # Node 1 
    np.array([3,  0,  4, 18]), # Node 2
    np.array([34, 29, 0, 60]), # Node 3
    np.array([6,  25, 0, 0])   # Node 4
]

plt.title("Reflektor fordeling med tilhørende Noder")
plt.ylabel("Antall målinger")

plt.bar(nodes,node_pair_cnt[0],color='#621258')
plt.bar(nodes,node_pair_cnt[1],color='#B62B65',bottom=node_pair_cnt[0])
plt.bar(nodes,node_pair_cnt[2],color='#ED6863',bottom=node_pair_cnt[0]+node_pair_cnt[1])
plt.bar(nodes,node_pair_cnt[3],color='#FFA574',bottom=node_pair_cnt[0]+node_pair_cnt[1]+node_pair_cnt[2])

plt.legend(["Node 1", "Node 2", "Node 3", "Node 4"])

plt.show()

###############################################################################

import numpy as np 
import matplotlib.pyplot as plt
import statistics as st

#List with measurements 
distance =[
1454,
1454
]
#Number of bins for the plot 
#bins = [0.7 ,0.8, 0.9, 1.0, 1.1, 1.2, 1.3]

plt.hist(distance,len(distance)+2, edgecolor='black')

#Plotting the vertical median line 
median = st.median(distance)
color = '#FF5349'
plt.axvline(median,color=color, label = 'Median')

#Captions 
plt.title('Node 4 til Node 5:')
plt.xlabel("Meter")
plt.ylabel("Antall målinger")

#Plot layout
plt.legend()
plt.tight_layout()