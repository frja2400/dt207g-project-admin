"use strict"

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

window.onload = init;

//Anropar funktion vid laddning av sida
function init() {

    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }
}

//Funktion för att validera mail.
function isValidEmail(email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
}

//Rensar formulär
function clearForm(form) {
    form.reset();
}

//Logga in användare
async function loginUser(e) {
    e.preventDefault();

    let emailInput = document.getElementById("email").value;
    let passwordInput = document.getElementById("password").value;
    const loginMessageDiv = document.getElementById("loginMessage");

    loginMessageDiv.innerHTML = "";

    //Samla felmeddelanden i en array
    const errors = [];

    //Validering för inmatning
    if (!emailInput.trim() || !isValidEmail(emailInput)) {
        errors.push("Du måste fylla i en giltig emailadress.");
    } 

    if (!passwordInput) {
        errors.push("Du måste fylla i ett lösenord.");
    } else if (passwordInput.length < 7) {
        errors.push("Lösenord måste vara minst 7 tecken.");
    }

    //Om det finns valideringfel, visa dessa och avsluta inloggningen
    if (errors.length > 0) {
        errors.forEach(error => {
            displayError(error, loginMessageDiv);
        });
        return;
    }

    //Om validering är godkänd, fortsätt med inloggning.
    let user = {
        email: emailInput,
        password: passwordInput
    }

    try {
        const response = await fetch("https://dt207g-project-restapi.onrender.com/api/users/login", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (response.ok) {
            //Spara min token i localStorage(min server skickar tillbaka svaret i "response" i JSON)
            localStorage.setItem("user_token", data.token);
            clearForm(loginForm);
            window.location.href = "/dashboard.html";
        } else {
            //Om något går fel med inloggningen, visa ett generellt felmeddelande
            displayError("Felaktig email eller lösenord.", loginMessageDiv);
        }
    } catch (error) {
        console.log("Fel vid inloggning", error);
        displayError("Fel vid inloggning, vänligen försök igen senare.", loginMessageDiv);
    }
}


async function registerUser(e) {
    e.preventDefault();

    let emailInput = document.getElementById("email").value;
    let passwordInput = document.getElementById("password").value;
    const registerMessageDiv = document.getElementById("registerMessage");

    registerMessageDiv.innerHTML = "";

    //Samla felmeddelanden i en array
    const errors = [];

    //Validering för inmatning
    if (!emailInput.trim() || !isValidEmail(emailInput)) {
        errors.push("Du måste fylla i en giltig emailadress.");
    } 

    if (!passwordInput) {
        errors.push("Du måste fylla i ett lösenord.");
    } else if (passwordInput.length < 7) {
        errors.push("Lösenord måste vara minst 7 tecken.");
    }

    //Om det finns valideringfel, visa dessa och avsluta inloggningen
    if (errors.length > 0) {
        errors.forEach(error => {
            displayError(error, registerMessageDiv);
        });
        return;
    }

    //Om validering är godkänd, fortsätt med inloggning.
    let user = {
        email: emailInput,
        password: passwordInput
    }

    try {
        const response = await fetch("https://dt207g-project-restapi.onrender.com/api/users/register", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (response.ok) {
            registerMessageDiv.innerHTML = "<p class='success'>Administrationskonto registrerad! <a href='index.html'>Logga in här</a></p>";
            clearForm(registerForm);
        } else {
            //Om något går fel med registrering, visa ett generellt felmeddelande
            displayError("Det gick inte att registrera administrationskontot.", registerMessageDiv);
        }
    } catch (error) {
        console.log("Fel vid registrering", error);
        displayError("Fel vid registrering, vänligen försök igen senare.", registerMessageDiv);
    }
}


//Funktion för att visa felmeddelande (parametrar meddelanden och elementet)
function displayError(error, container) {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = error;
    errorMessage.classList.add("error");
    container.appendChild(errorMessage);
}

