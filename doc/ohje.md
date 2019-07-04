# Käyttö
Avaa verkkosivu ja pelaa.

# Asentaminen
Lataa lähdekoodi ja suorita
```
$ npm install
```

Seuraavaksi sinun tulee antaa joko ympäristömuuttujana tai `.env`-nimisessä
tiedostossa `JWT_SECRET` (jälkimmäinen muodossa `JWT_SECRET=`...), jolle voit 
antaa haluamasi arvon, jota ei kuulu paljastaa.

Tämän jälkeen palvelimen voi käynnistää
```
$ npm start
```

Portti on oletuksena `5000`, mutta sen voi muuttaa ympäristömuuttujalla `PORT`.
