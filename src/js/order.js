"use strict";

//Om du inte har en token så skickas du till logga in-sidan.
if (!localStorage.getItem("user_token")) {
    window.location.href = "/index.html";
}

//Hämta element
const orderEl = document.getElementById("orderContainer");

document.addEventListener('DOMContentLoaded', () => {
    getData();
});

//Visa laddningsmeddelande
function showLoadingMessage() {
    const orderEl = document.getElementById("orderContainer");
    orderEl.innerHTML = `<h3>Laddar beställningar...</h3>`;
}

//Asynkron funktion som hämtar beställningar från mitt API.
async function getData() {
    showLoadingMessage();

    const headers = {};
    const token = localStorage.getItem("user_token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    try {
        const response = await fetch("https://dt207g-project-restapi.onrender.com/api/order", {
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

//Skriv ut beställningar på skärmen
function renderData(orders) {
    orderEl.innerHTML = '';

    if (orders.length === 0) {
        orderEl.innerHTML = '<p>Inga beställningar hittades.</p>';
        return;
    }

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order');

        //Formatera datum
        const date = new Date(order.createdAt).toLocaleString('sv-SE');

        //Skapa HTML för varje beställning
        const itemsHTML = order.items.map(item => {
            const name = item.menuItem?.name || "Okänd rätt";
            const price = item.menuItem?.price || 0;
            return `<li>${name} x ${item.quantity} - ${price * item.quantity} kr</li>`;
        }).join('');

        orderDiv.innerHTML = `
            <h3>Beställning av: ${order.customerName}</h3>
            <p><strong>Telefon:</strong> ${order.phoneNumber}</p>
            <p><strong>Adress:</strong> ${order.address.street}, ${order.address.postalCode} ${order.address.city}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Totalpris:</strong> ${order.totalPrice} kr</p>
            <p><strong>Skapad:</strong> ${date}</p>
            <ul>${itemsHTML}</ul>
        `;

        //RADERA-knapp
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'RADERA';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.addEventListener('click', () => deleteOrder(order._id));
        orderDiv.appendChild(deleteBtn);

        //ÄNDRA-knapp
        const editBtn = document.createElement('button');
        editBtn.textContent = 'ÄNDRA';
        editBtn.classList.add('editBtn');
        editBtn.addEventListener('click', () => updateOrder(order));
        orderDiv.appendChild(editBtn);

        orderEl.appendChild(orderDiv);
    });
}

//Funktion som raderar beställningar och skriver ut uppdaterad data. 
async function deleteOrder(orderId) {

    const confirmDelete = confirm(`Är du säker på att du vill radera beställningen?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`https://dt207g-project-restapi.onrender.com/api/order/${orderId}`, {
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
        errorMessageEl.textContent = "Kunde inte radera beställningen. Ladda om sidan och prova igen";
    }
}