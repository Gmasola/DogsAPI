# Prova pratica - Junior Backend Developer

### Descrizione
L'app che ho sviluppato può essere utilizzata per gestione di un canile virtuale. L'applicazione permette all'utente configurato di visualizzare i cani disponibili, adottarli e lasciarli in custodia.
L'API è accessibile solo tramite autenticazione basata su bearer token. 

Per questa API ho previsto i seguenti endpoint:
- '/dogs' restituisce tutti i cani disponibili per l'adozione.
- '/dog/:id' restituisce le informazioni del singolo cane disponibile, adottato o messo in custodia.
- '/statics' restituisce le statistiche del numero di cani disponibili.
- '/dog/adopt/:id' cambia lo stato del cane in "adottato".
- '/dog/custody/in' inserisce un cane in custodia.
- '/dog/custody/out/:id' rilascio dalla custodia del cane specificato.

Il token sarà recuperabile autenticandosi sulla route di /login con le credenziali impostate sul file .env . Per testare gli endpoint su swagger, una volta recuperato il token, questo andrà inserito tramite la funzione authorize in altro a destra     

### Istruzioni
1 compilare il file .env come segue:
 DB_STRING=stringa di connessione a mongodb
 PORT= porta di esecuzione dell' API
 USER= user per autenticazione  /login
 PASSWORD= password per autenticazione su route /login
 JWT_SECRET_KEY=JWT SECRET KEY

2 eseguire il comando npm install per installare le dipendenze

3 compilare eseguendo il comando tsc

3 Eseguire Node app.js sul percorso di compilazione /dist




