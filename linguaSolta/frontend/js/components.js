/* ==========================================================
   COMPONENTES DO SITE
   Responsável apenas por carregar Header e Footer
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await carregarHeader();

    await carregarFooter();

    requestAnimationFrame(() => {

        ativarMenuAtual();

        ativarHamburger();

        if (typeof iniciarAnimacoes === "function") {

            iniciarAnimacoes();

        }

    });

});


/* ==========================================================
   HEADER
========================================================== */

async function carregarHeader() {

    const header = document.getElementById("header");

    if (!header) return;

    try {

        const response = await fetch("./components/header.html");

        if (!response.ok) {
            throw new Error("Erro ao carregar header.");
        }

        header.innerHTML = await response.text();

    } catch (erro) {

        console.error("Erro ao carregar Header:", erro);

    }

}


/* ==========================================================
   FOOTER
========================================================== */

async function carregarFooter() {

    const footer = document.getElementById("footer");

    if (!footer) return;

    try {

        const response = await fetch("./components/footer.html");

        if (!response.ok) {
            throw new Error("Erro ao carregar footer.");
        }

        footer.innerHTML = await response.text();

    } catch (erro) {

        console.error("Erro ao carregar Footer:", erro);

    }

}