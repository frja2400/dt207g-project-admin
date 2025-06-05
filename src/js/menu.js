"use strict";

//Om du inte har en token så skickas du till logga in-sidan.
if (!localStorage.getItem("user_token")) {
    window.location.href = "/index.html";
}

const form = document.getElementById("menuItemForm");
const messageEl = document.getElementById("message");
const errorMessageEl = document.getElementById("errorMessage");
const menuEl = document.getElementById("menuContainer");
const cancelBtn = document.getElementById("cancelBtn");

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

    const headers = {};
    const token = localStorage.getItem("user_token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    try {
        const response = await fetch("https://dt207g-project-restapi.onrender.com/api/menu", {
            headers
        });
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

            //Ändra-knapp
            const editButton = document.createElement('button');
            editButton.textContent = 'UPPDATERA';
            editButton.classList.add('editBtn');
            editButton.addEventListener('click', () => populateFormForEdit(menuItem));
            row.appendChild(editButton);

            section.appendChild(row);
        });

        //Lägg till varje sektion
        menuEl.appendChild(section);
    }
}

//Funktion som raderar menyobjekt och skriver ut uppdaterad data. 
async function deleteMenuItem(menuItem) {

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

//Händelselyssnare på formulär för att addera nytt menyobjekt.
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    //Samla formulärdata
    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value.trim();
    const description = document.getElementById("description").value.trim();
    const veganValue = document.getElementById("vegan").value;

    //Konvertera "Ja"/"Nej" till boolean
    const isVegan = veganValue === "Ja";

    //Kontrollera obligatoriska fält
    if (!name || !category || !price || veganValue === "") {
        messageEl.textContent = "Alla obligatoriska fält måste fyllas i.";
        return;
    }

    const newMenuItem = {
        name,
        category,
        price: Number(price),
        description,
        isVegan
    };

    //Bestämmer om det är PUT eller POST med en ternär operator.
    const url = currentEditId
        ? `https://dt207g-project-restapi.onrender.com/api/menu/${currentEditId}`
        : "https://dt207g-project-restapi.onrender.com/api/menu";

    const method = currentEditId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("user_token")}`
            },
            body: JSON.stringify(newMenuItem)
        });

        if (!response.ok) throw new Error("Fel vid sparande.");

        form.reset();
        messageEl.textContent = "";
        messageEl.className = "";

        currentEditId = null;
        cancelBtn.style.display = "none";

        getData();
    } catch (error) {
        console.error("Fel vid POST:", error);
        messageEl.textContent = "Kunde inte spara maträtten. Ladda om sidan och prova igen.";
        messageEl.className = "error-message";
    }
});


//Funktioner för att ändra menyobjekt
let currentEditId = null;

function populateFormForEdit(menuItem) {
    document.getElementById("name").value = menuItem.name;
    document.getElementById("category").value = menuItem.category;
    document.getElementById("price").value = menuItem.price;
    document.getElementById("description").value = menuItem.description;
    document.getElementById("vegan").value = menuItem.isVegan ? "Ja" : "Nej";

    currentEditId = menuItem._id;

    cancelBtn.style.display = "inline-block";

    messageEl.textContent = `Du redigerar: "${menuItem.name}"`;

    //Scrolla automatiskt högst upp.
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


//Funktion som avbryter ändring av menyobjekt.
cancelBtn.addEventListener("click", () => {
    form.reset();
    currentEditId = null;
    messageEl.textContent = "";
    cancelBtn.style.display = "none";
});
