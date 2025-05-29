"use strict";

//Om du inte har en token så skickas du till logga in-sidan.
if (!localStorage.getItem("user_token")) {
    window.location.href = "/index.html";
}

document.addEventListener('DOMContentLoaded', () => {
    getData();
});

//Visa laddningsmeddelande
function showLoadingMessage() {
    const menuEl = document.getElementById("menuContainer");
    menuEl.innerHTML = `<h3>Laddar menyn...</h3>`;
}

//Asynkron funktion som hämtar menydata från mitt API.
async function getData() {
    showLoadingMessage();
    try {
        const response = await fetch("https://dt207g-project-restapi.onrender.com/api/menu");
        if (!response.ok) throw new Error("Nätverksfel");

        const data = await response.json();
        console.table(data);
        renderData(data);
    } catch (error) {
        console.error("Fel vid hämtning:", error);
    } finally {
        console.log("Förfrågan avslutad.");
    }
}

//Skriv ut menydata på skärmen
function renderData(data) {
    const menuEl = document.getElementById("menuContainer");
    menuEl.innerHTML = '';

    //Skapa kategoribehållare
    const categories = {
        Pizza: [],
        Pasta: [],
        Dryck: []
    };

    // Sortera menyobjekt in i kategorier
    data.forEach(item => {
        const cat = item.category?.toLowerCase();
        if (cat === "pizza") categories.Pizza.push(item);
        else if (cat === "pasta") categories.Pasta.push(item);
        else if (cat === "dryck") categories.Dryck.push(item);
    });

    //Rendera varje kategori
    for (const [category, items] of Object.entries(categories)) {
        const section = document.createElement('section');
        section.classList.add('menuSection');

        const heading = document.createElement('h2');
        heading.textContent = category;
        heading.classList.add('menuTitle');
        section.appendChild(heading);

        items.forEach(menuItem => {
            const row = document.createElement('div');
            row.classList.add('menuItem');

            const veganIcon = menuItem.isVegan ? 'Vegansk 🌱' : '';

            row.innerHTML = `
                <h3>${menuItem.name}</h3>
                <p>${menuItem.description}</p>
                <p><strong>Pris:</strong> ${menuItem.price} kr</p>
                <p class="vegan">${veganIcon}</p>
            `;

            //Radera-knapp
            const button = document.createElement('button');
            button.textContent = 'RADERA';
            button.classList.add('deleteBtn');
            button.addEventListener('click', () => deleteMenuItem(menuItem));
            row.appendChild(button);

            section.appendChild(row);
        });

        //Lägg till varje sektion
        menuEl.appendChild(section);
    }
}

//Funktion för att läsa cart från localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

//Funktion för att spara cart i localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

//Funktion som raderar menyobjekt och skriver ut uppdaterad data. 
async function deleteMenuItem(menuItem) {

    const errorMessageEl = document.getElementById('errorMessage');

    const confirmDelete = confirm(`Är du säker på att du vill radera "${menuItem.name}"?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`https://dt207g-project-restapi.onrender.com/api/menu/${menuItem._id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("user_token")}`
            }
        });

        if (!response.ok) throw new Error("Kunde inte radera posten");

        getData();
    } catch (error) {
        console.error("Fel vid radering:", error);
        //Skriver ut felmeddelande till användaren.
        errorMessageEl.textContent = "Kunde inte radera maträtt. Ladda om sidan och prova igen";
    }
}
