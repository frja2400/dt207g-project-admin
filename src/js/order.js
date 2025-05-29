"use strict"

//Hämtar varukorg från localStorage och element som ska visa beställningar.
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderList = document.getElementById('orderList');

    function renderCart() {
        orderList.innerHTML = '';

        if (cart.length === 0) {
            orderList.innerHTML = '<p>Varukorgen är tom.</p>';
            return;
        }

        //Loopar igenom och bygger HTML med namn, antal, +/- knappar, pris, totalpris och ta bort-knapp
        cart.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('orderItem');
            div.dataset.id = item._id;
            div.innerHTML = `
                <h3>${item.name}</h3>
                <p>
                    Antal:
                    <button class="decreaseBtn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="increaseBtn">+</button>
                </p>
                <p>Pris/st: ${item.price} kr</p>
                <p>Total: <span class="itemTotal">${item.price * item.quantity}</span> kr</p>
                <button class="removeBtn">TA BORT</button>
                <hr>
            `;
            orderList.appendChild(div);
        });

        updateTotal();
    }

    //Räknar ut totalbelopp och skriver ut det på skärmen.
    function updateTotal() {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let totalDiv = document.getElementById('totalDiv');

        if (!totalDiv) {
            totalDiv = document.createElement('div');
            totalDiv.id = 'totalDiv';
            orderList.appendChild(totalDiv);
        }

        totalDiv.innerHTML = `<h3>Totalt att betala: ${total} kr</h3>`;
    }

    //Uppdaterar skärmen med antal och totalsumma vid ändringar.
    function updateOrderDisplay(orderItemDiv, item) {
        orderItemDiv.querySelector('.quantity').textContent = item.quantity;
        orderItemDiv.querySelector('.itemTotal').textContent = item.price * item.quantity;
    }

    //Lyssnar på klick på hela orderList.
    orderList.addEventListener('click', (e) => {
        const target = e.target;
        const orderItemDiv = target.closest('.orderItem');
        if (!orderItemDiv) return;

        const id = orderItemDiv.dataset.id;
        const itemIndex = cart.findIndex(item => item._id === id);
        if (itemIndex === -1) return;

        //Om användar klickar på + ökar antalet, vid - minskar antalet, vid 0 tas varan bort.
        if (target.classList.contains('increaseBtn')) {
            cart[itemIndex].quantity++;
            updateOrderDisplay(orderItemDiv, cart[itemIndex]);
        } else if (target.classList.contains('decreaseBtn')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
                updateOrderDisplay(orderItemDiv, cart[itemIndex]);
            } else {
                cart.splice(itemIndex, 1);
                orderItemDiv.remove();
            }
        } else if (target.classList.contains('removeBtn')) {
            cart.splice(itemIndex, 1);
            orderItemDiv.remove();
        } else {
            return; //Om annat element klickades, gör inget
        }

        //Spara ändringar i localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateTotal();

        //Om varukorgen är tom, visa meddelande
        if (cart.length === 0) {
            orderList.innerHTML = '<p>Varukorgen är tom.</p>';
        }
    });

    renderCart();
});

//Hämta formulär-element samt element för meddelanden.
const form = document.getElementById("orderForm");
const messageEl = document.getElementById("message");

//Addera händelselyssnare på formulär
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    //Rensa tidigare meddelande samt klass
    messageEl.textContent = "";
    messageEl.className = "";

    //Hämta värden från formuläret
    const customerName = document.getElementById("name").value.trim();
    const phoneNumber = document.getElementById("number").value.trim();
    const street = document.getElementById("street").value.trim();
    const postalCode = document.getElementById("postalcode").value.trim();
    const city = document.getElementById("city").value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    //Kontrollera obligatoriska fält
    if (!customerName || !phoneNumber || !street || !postalCode || !city) {
        messageEl.textContent = "Alla fält måste fyllas i.";
        messageEl.className = "error-message";
        return;
    }

    //Hämta varukorg från localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    //Kontrollera att varukogen inte är tom.
    if (cart.length === 0) {
        messageEl.textContent = "Varukorgen är tom. Du måste lägga till minst en vara.";
        messageEl.className = "error-message";
        return;
    }

    //Bygg items-array enligt schemastruktur för beställningar.
    const items = cart.map(item => ({
        menuItem: item._id,
        quantity: item.quantity
    }));

    //Räkna ut totalpris
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    //Bygg orderobjekt
    const newOrder = {
        customerName,
        phoneNumber,
        address: {
            street,
            postalCode,
            city
        },
        items,
        totalPrice
    };

    try {
        const response = await fetch("https://dt207g-project-restapi.onrender.com/api/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newOrder)
        });

        if (!response.ok) throw new Error("Kunde inte skicka beställningen.");

        //Töm formulär och varukorg
        form.reset();
        localStorage.removeItem("cart");
        document.getElementById("orderList").innerHTML = "<p>Varukorgen är tom.</p>";

        //Visa bekräftelse
        messageEl.textContent = `Tack för din beställning!`;
        messageEl.className = "success-message";
    } catch (err) {
        console.error("Fel vid beställning:", err);
        messageEl.textContent = "Ett fel uppstod vid beställningen. Försök igen.";
        messageEl.className = "error-message";
    }
});