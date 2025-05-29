"use strict"

//Om du inte har en token så skickas du till logga in-sidan.
if(!localStorage.getItem("user_token")) {
    window.location.href = "/index.html";
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("user_token");
        window.location.href = "/index.html";
    });
}