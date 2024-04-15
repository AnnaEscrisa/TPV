import * as p from "./productes.js";

//----------------- VARIABLES ----------------
let begudes = document.getElementById("begudes");
let menjar = document.getElementById("menjar");
let productes = Object.values(p.productes);
let calcInput = ""; //possible input de calculadora
const calcHTML = document.getElementById("calculadoraPantalla");//input de calculadora mostrat per pantalla
let preuTotal = 0;
const preuHTML = document.getElementById("preu"); //preu mostrat per pantalla
let dinersDonats = 0 //valor dels diners donats pel client
const dinersDonatsHTML = document.getElementById("dinersDonats"); //quantitat diners donats mostrada per pantalla
let productesSeleccionats = []; //! OJO si no posem opcio d'esborrar productes seleccionats
const productesHTML = document.getElementById("comanda"); //llista productes mostrats per pantalla
let permisSeleccionarProductes = true;
let permisSeleccionarDiners = false;
const dinersCaixa = document.querySelectorAll(".quantitat");//diferents divises de la caixa
let canvi;
const canviHTML = document.getElementById("quantitatCanvi"); //quantitat del canvi mostrada per pantalla
const canviMonedes = document.getElementById("monedes"); //diners necessaris pel canvi mostrats per pantalla
const facturaComandeHTML = document.getElementById("comandes");//factura
const facturaPreusHTML = document.getElementById("preus");

console.log(facturaPreusHTML)
//----------------- canvis DOM  ----------------

//es crea imatge per cada producte amb atributs
productes.forEach((item, index) => {

    let imatge = document.createElement("img");
    let paragraf = document.createElement("p");
    let noms = Object.keys(p.productes);
    paragraf.innerHTML = noms[index];
    Object.assign(imatge, {
        src: `img/productes/${item.nom}.png`,
        alt: noms[index]
    })

    //s'inserta a seccio adient
    if (item.tipus == "beguda") {
        begudes.appendChild(imatge);
        begudes.appendChild(paragraf);
    } else {
        menjar.appendChild(imatge);
        menjar.appendChild(paragraf);
    }
})

/* ---- EventListeners ----*/
document.querySelector("[value=borrar]").addEventListener("click", esborrar);

document.querySelectorAll(".calc")
    .forEach(item => {
        item.addEventListener(
            "click", calculadora)
    }
    );

document.querySelectorAll("#principal img").forEach(item => {
    item.addEventListener("click", seleccionarProducte);
});

document.querySelector("[value=cobrar]").addEventListener("click", cobrar);

document.querySelectorAll(".bitllets")
    .forEach(item => {
        item.addEventListener(
            "click", seleccionarDiners)
    }
    );

document.querySelector("[value=canvi]").addEventListener("click", donarCanvi)

document.querySelector("[value=novaComanda]").addEventListener("click", novaComanda)


//----------------- Funcions ----------------

function subtotalHTML(element) {
    element.innerHTML = `Subtotal: ${preuTotal.toFixed(2)} €`
}

function restablirHTML(element) {
    element.innerHTML = " ";
}

function amagarSeccio(id) {
    document.getElementById(id).setAttribute("hidden", "");
}

function mostrarSeccio(id) {
    document.getElementById(id).removeAttribute("hidden");
}

function actualitzarCaixa() {
    let divisa;
    for (let index = 0; index < dinersCaixa.length; index++) {
        divisa = dinersCaixa[index].getAttribute("data-diners");
        dinersCaixa[index].innerHTML = p.diners[divisa].quantitat;
    }
}

//mostrar valors de calculadora i afegir a subtotal
function calculadora() {

    if (this.innerHTML != "Enter") {
        calcInput += this.innerHTML;
        calcHTML.innerHTML = calcInput;

        //comprova que calcInput tingui valor abans d'afegir amb Enter
    } else if (calcInput) {

        preuTotal += (eval(calcInput));
        subtotalHTML(preuHTML);
        productesHTML.innerHTML += `<p class='p-2 prod'>&nbsp</p><p class="p-2 preu">${eval(calcInput)}€</p>`;
        //restaura els valors originals
        calcInput = "";
        calcHTML.innerHTML = "&nbsp";
    }
}

function esborrar(){
    calcInput = calcInput.slice(0, -1);
    calcHTML.innerHTML = calcInput;
}

//agafa nom de producte seleccionat i afegeix nom i valor al HTML
function seleccionarProducte() {
    if (permisSeleccionarProductes == true) {
        //vuida calculadora
        calcInput = "";
        calcHTML.innerHTML = "&nbsp";

        let producte = this.alt;
        let productePreu = p.productes[producte].preu;
        preuTotal += productePreu;
        productesSeleccionats.push(producte);
        
        subtotalHTML(preuHTML);
        productesHTML.innerHTML += `<p class='p-2 prod'>${p.productes[producte].nom} </p> <p class="p-2 preu">${p.productes[producte].preu}€</p>`
    } else {
        alert("No es poden afegir productes. Torna a l'anterior pas per afegir-ne més")
    }
}

//comprova que comanda es positiva i obre seccio de cobrament
function cobrar() {
    if (preuTotal > 0) {
        //impedeix que s'afegeixin mes productes
        permisSeleccionarProductes = false;
        permisSeleccionarDiners = true;
        amagarSeccio("principal");
        mostrarSeccio("diners");
        subtotalHTML(document.querySelector("#diners h3"));

    } else {
        alert("No es pot cobrar la comanda. El valor es 0 o negatiu")
    }
}


//agafa divisa seleccionada i afegeix valor a dinersDonats
function seleccionarDiners() {
    //nomes afegeix bitllets si te permis (comanda tancada)
    if (permisSeleccionarDiners == true) {
        let divisa = p.diners[this.id];
        dinersDonats += parseFloat(divisa.valor);
        //arrodonim per evitar problemes de precisio amb decimals
        dinersDonats = Math.round(dinersDonats * 100) / 100;
        dinersDonatsHTML.innerHTML = "Efectiu: " + dinersDonats + "€";
        divisa.quantitat++;
        actualitzarCaixa();
    }
}

//calcula quantitat bitllets/monedes del canvi
function calcularMonedes() {

    for (let index = 0; index < p.diners.length; index++) {
        let divisa = p.diners[index];
        let divisaNecessaria; //booleà que indica si la divisa és necessaria pel canvi
        divisaNecessaria = parseInt(canvi / divisa.valor) > 0 ? true : false;

        //afegeix a canvi nomes si la divisa es necessaria i en tenim cap a la caixa
        while (divisa.quantitat != 0 && divisaNecessaria) {

            canviMonedes.innerHTML += `<img class="bitllets" src="img/diners/${(divisa.nom)}.png">`;
            canvi = (canvi - divisa.valor).toFixed(2);
            divisa.quantitat--;

            //recalculem necessarietat de divisa
            divisaNecessaria = parseInt(canvi / divisa.valor) > 0 ? true : false;
        }
    }
}

//calcula el canvi i obre seccio corresponent
function donarCanvi() {
    if (dinersDonats < preuTotal) {
        alert("Diners donats insuficients")
    } else {
        permisSeleccionarDiners = false;
        canvi = (dinersDonats - preuTotal).toFixed(2);
        canviHTML.innerHTML = "Canvi: " + canvi + " €";
        calcularMonedes();
        actualitzarCaixa();
        mostrarSeccio("canvi");
        amagarSeccio("diners");
        subtotalHTML(document.getElementById("import"));
        document.getElementById("pagat").innerHTML = "Efectiu: " + dinersDonats + "€"   
        crearFactura();
    }
}

// omplena factura
function crearFactura() {
    let comanda = document.getElementById("comanda").innerHTML;
    let preus = document.getElementById("resultats").innerHTML;
    console.log(comanda)
    facturaComandeHTML.innerHTML += comanda;
    facturaPreusHTML.innerHTML = preus;
}

//reestrableix variables
function novaComanda() {

    preuTotal = 0;
    dinersDonats = 0;
    canvi = 0;
    restablirHTML(canviHTML);
    restablirHTML(canviMonedes);
    restablirHTML(preuHTML);
    restablirHTML(productesHTML);
    restablirHTML(dinersDonatsHTML);
    restablirHTML(document.getElementById("factura"))

    permisSeleccionarProductes = true;
    mostrarSeccio("principal");
    amagarSeccio("canvi");
    amagarSeccio("diners");
}

/* Posibles millores futures

//tornar a pantalla de productes des de la de diners
function enrrere() {
    //permetre que s'afegeixin mes productes
    permisSeleccionarProductes = true;
    permisSeleccionarDiners = false;
    dinersDonats = 0;
   
    restablirHTML(dinersDonatsHTML);
    restablirHTML(canviMonedes);
    restablirHTML(canviHTML);
    amagarSeccio("diners");
    mostrarSeccio("principal");
}


//afegim diners donats per client a caixa
function afegirMonedes() {
    for (let index = 0; index < dinersEscollits.length; index++) {
        let divisa = dinersEscollits[index];
        divisa.quantitat++;
        console.log(divisa);
    }
}

*/
