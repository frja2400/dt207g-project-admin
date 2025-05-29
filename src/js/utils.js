"use strict";

//Om du inte har en token så skickas du till logga in-sidan.
export function requireAuth() {
    if (!localStorage.getItem("user_token")) {
        window.location.href = "index.html";
    }
}