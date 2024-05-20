# Innhold: 

I denne mappen finnes følgende elementer:

- main.html = Brukergrensesnittet.
- server_list.js eller server_rng.js = to varianter av koden for serveren.
- node_test.html = Simulator
- csvmeas = mappen der målingene lagres

## Hvorfor to varianter av serveren ? 

I prosjektet ble det utviklet to forskjellige algoritmer for orkestrering av kanalmålingsprosedyren: 
- Rng = Randomisert
- List = Listebasert

Den randomiserte algoritmen er den første som ble implementert. Den tildeller rollene i prosedyren på et randomisert vis. Den fører til en ujevn distribusjon av nodepar. Liste-algoritmen skaper en liste med alle de mulige nodeparene og deretter itererer gjennom den. En slik tilnærming sikkrer en lik distribuering av nodepar. 
