# Innhold: 

I denne mappen finnes følgende filer:

- main.html = Brukergrensesnittet.
- server_list.js eller server_rng.js = to varianter av koden for serveren.
- node_test.html = Simulator

## Hvorfor to varianter av serveren ? 

I prosjektet ble det utviklet to forskjellige algoritmer for orkestrering av kanalmålingsprosedyren: 
- Rng = Randomisert
- List = Listebasert

Den randomiserte algoritmen tildeller rollene i prosedyren på et randomisert vis. Under testing fører dette til en ujevn distribuering av par på nodenettverket. 

