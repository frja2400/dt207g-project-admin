"use strict"

import { requireAuth } from "./utils.js";
requireAuth();

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("user_token");
        window.location.href = "index.html";
    });
}