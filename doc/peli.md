# avaruussota
**avaruussota** on verkossa pelattava moninpeliräiskintä.

Kun olet löytänyt pelipalvelimen, pelaaminen onnistuu avaamalla
sen verkkosivu nykyaikaisessa verkkoselaimessa, myös mobiilissa.

# Liittyminen
Sivun avatessa ensimmäinen näkemäsi asia on ikkuna, joka antaa sinun
määritellä nimimerkkisi (rajoitetaan 20 merkkiin). Jos et syötä
nimimerkkiä, sinulle annetaan satunnainen luku nimeksi.

Nimen syöttämisen jälkeen voit valita aluksellesi parannuksen. Vaihtoehdot
ovat:

* *None* (ei mitään)
* *Coilgun* (käämitykki): luotisi lentävät nopeammin
* *Rapid Fire* (sarjatuli): pystyt ampumaan useammin
* *Shields* (suojat): korkeammat suojat aluksessa
* *Agile* (ketterä): alus hieman hitaampi mutta kääntyy ketterämmin
* *Meteoroid* (meteoroidi): planeettaan törmäämisestä 
  saatavat vauriot puolittuvat
* *Turboheal* (pikalataus): aluksen suojat latautuvat nopeammin
* *Absorber* (imaisija): suojat palautuvat hieman, kun ammut toista pelaajaa

Voit myös asettaa ikkunan avulla suurennustason. 100% näyttää koko näkökentän,
mutta asiat saattavat näyttää liian pieniltä. Asetusten asettamisen jälkeen
paina `play` liittyäksesi peliin.

# Pelaaminen
Pelin liittyessäsi aloitat luultavasti jonkin planeetan pinnalta. Planeetalla
ollessasi et voi kääntyä, joten sinun tulee nousta sen pinnalta, jotta voit
kulkea pelikentällä.

Vasemmassa ylänurkassa näkyy aluksen suojat osoittava palkki ja pelissä
olevien pelaajien lukumäärä. Pisteesi näkyvät ylhäällä keskellä ja yläoikealla
on paikalla olevien pelaajien keskinen taulukko, joka näyttää eniten pisteitä
keränneet pelaajat. Myös lisäyksesi näkyvät ylävasemmalla.

Tarkoituksenasi on ampua ja tuhota toisia aluksia, joka onnistuu pääosin
ampumalla luoteja niitä kohti. Kun alus on saanut tarpeeksi osumaa, se
tuhoutuu ja viimeksi osunut saa pisteen. Luodeilla on enimmäismatka, jonka
kuljettuaan ne katoavat, ja ne voivat osua vain yhteen alukseen kerrallaan.

Voit myös törmätä toisiin aluksiin. Saat myös pisteen, jos pusket toista
alusta sekä tuhoat sen, ja pidät oman aluksesi ehjänä.

Pelikentällä liikkuminen saattaa vaatia hieman totuttelua. Aluksesi ei
hidastu itsekseen, joten jarrua tulee käyttää sen hidastamiseen.

Kenttää pitkin on ripoteltu useita planeettoja, joiden painovoima imee
aluksia ja luotia puoleensa. Planeettaan osuminen vahingoittaa alusta, mutta
jarruttamalla ja laskeutumalla oikeinpäin voit laskeutua planeetan pinnalle.
Planeetan pinnalla ollessasi suojasi palautuvat hitaasti, kunnes nouset.
Sillä vaurioituneet alukset päästävät savua ja kulkevat hitaammin kuin
ehjät alukset, suojien lataamisesta on hyötyä.

Pelikentän ulkoreunalla on sen raja, joka työntää pelaajia takaisin sen
sisäpuolelle. Sen rajaaman alueen koko riippuu pelaajien lukumäärästä, joten
pelikenttä kasvaa kokoa pelaajamäärän mukaan.

# Ohjaaminen
Ohjaamiseen on useita eri tapoja. Työpöytäpelaajia varten on saatavilla
vain näppäimistöä käyttävä ohjausasettelu:

* W: kiihdytys
* S: jarru
* A: kääntyminen vasempaan
* D: kääntyminen oikeaan
* Q: käytä lisäys
* Space: ammu luoti
* Z: suurennustason säätäminen

Myös hiirtä voi käyttää aluksen kääntämiseen. Hiiren vasen painike ampuu
luoteja ja oikea painike käyttää lisäyksen. Kiihdyttäminen ja jarruttaminen
vaativat kuitenkin näppäimistön käyttöä.

Mobiilipelaajille on saatavilla kosketusnäytöllä olevat ohjaimet ruudun
alareunassa. Vasemmassa alanurkassa olevalla ohjaussauvalla voi kääntää
alusta sekä kiihdyttää; aluksen kiihdyttimet ovat päällä niin pitkään kuin
sauvaa pidetään sen ulkoreunassa, punaisen alueen sisällä. Oikeasta
alanurkasta löytää napit ampumiseen, jarruttamiseen sekä lisäyksen
käyttämiseen. Suurennustason muuttaminen ei onnistu mobiilissa kesken pelin.

# Lisäykset
Toisinaan lisäyksiä ilmestyy pelikentälle. Ne näyttävät hohtavilta vihreiltä
palloilta, joita voidaan kerätä joko lentämällä päin tai osumalla niihin
luodilla. Saamasi lisäys on satunnainen ja arvotaan keräessä. Lisäyksiä on
kahta päätyyppiä:
    
* kertakäyttöinen "item": sinulla voi olla vain yksi kertakäyttöinen lisäys
  kerrallaan, ja se käytetään joko painamalla Q-näppäintä, hiiren oikealla
  painikkeella tai USE-hipaisunapilla. lisäys näytetään vasemmassa ylänurkassa.
* väliaikainen: tämänkaltaiset lisäykset aktivoituvat välittömästi, ja niillä
  on jokin hyödyllinen väliaikainen vaikutus. vasemmassa ylänurkassa oleva
  luettelo näyttää vaikutukset ja niiden jäljellä olevat ajat.

Lisäykset ovat:

* kertakäyttöiset:
  * *laser* (laseri): ampuu nopeasti kulkevan laserisäteen, joka kulkee
    useankin aluksen läpi ja tuottaa merkittävästi vahinkoa. onnistunut
    käyttö vaatii kuitenkin tähtäämistä.
  * *bomb* (pommi): ampuu luoteja koko aluksen ympärille.
  * *mine* (miina): pudottaa paikallaan pysyvän miinan, joka pysyy pelikentällä
    kahden minuutin ajan. liian läheltä kulkevat alukset räjäyttävät miinan,
    jolloin kaikki lähellä olevat alukset saavat huomattavaa vahinkoa.
  * *reheal* (palautus): palauttaa aluksen suojat takaisin välittömästi.
  * *spread* (laaja tuli): ampuu röykkiön lyhyen kantaman luoteja; voi
    aiheuttaa tuhoa lähietäisyydeltä.
  * *[orion](
https://en.wikipedia.org/wiki/Project_Orion_(nuclear_propulsion))*: 
    kiihdyttää aluksen maksiminopeuteen ja ampuu lyhyen ja heikon
    luotisuman aluksen taakse.
  * *knockout* (törmäys): ampuu hitaan ja lyhytkantoisen ammuksen, joka
    osuessaan alukseen tönäisee tätä rajusti.
* väliaikaiset:
  * *rubber ship* (kumialus): planeettoihin tai aluksiintörmäämisestä ei
    saa vahinkoa. kestää 30 sekuntia.
  * *regen* (elpyminen): suojat palautuvat hitaasti. kestää 10 sekuntia.
  * *overdrive* (ylinopeus): aluksen kiihtyvyys ja tulitusnopeus ovat
    huomattavasti nopeampia. kestää 10 sekuntia.
