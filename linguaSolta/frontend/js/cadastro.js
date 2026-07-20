/* ==========================================
   CADASTRO - INSTITUTO LÍNGUA SOLTA
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const steps = document.querySelectorAll(".form-step");
    const nextButtons = document.querySelectorAll(".next");
    const prevButtons = document.querySelectorAll(".prev");
    const progressBar = document.querySelector(".progress-bar");
    const stepTitles = document.querySelectorAll(".steps span");
    const form = document.getElementById("cadastroForm");

    let currentStep = 0;

    /* ==============================
       MOSTRAR ETAPA
    ============================== */

    function showStep(index) {

        steps.forEach((step, i) => {
            step.classList.toggle("active", i === index);
        });

        stepTitles.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });

        progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    /* ==============================
       VALIDAR ETAPA
    ============================== */

    function validateStep(step) {

        let valid = true;

        const requiredFields = step.querySelectorAll("[required]");

        requiredFields.forEach(field => {

            field.classList.remove("error");

            if (field.type === "checkbox") {

                if (!field.checked) {
                    valid = false;
                }

            } else {

                if (!field.value.trim()) {
                    field.classList.add("error");
                    valid = false;
                }

            }

        });

        if (!valid) {
            step.querySelector(".error")?.focus();
        }

        return valid;

    }

    /* ==============================
       PRÓXIMO
    ============================== */

    nextButtons.forEach(button => {

        button.addEventListener("click", () => {

            if (!validateStep(steps[currentStep])) {
                return;
            }

            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }

        });

    });

    /* ==============================
       VOLTAR
    ============================== */

    prevButtons.forEach(button => {

        button.addEventListener("click", () => {

            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }

        });

    });

    /* ==============================
       ENVIO
    ============================== */

    /* ==============================
   ENVIO
============================== */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!validateStep(steps[currentStep])) {
        return;
    }

    const dados = Object.fromEntries(
        new FormData(form).entries()
    );

    const msg = document.getElementById("formMessage");
    const submitButton = form.querySelector("button[type='submit']");

    submitButton.classList.add("loading");
    submitButton.textContent = "Enviando...";

    try {

        const resposta = await fetch("/api/associados", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        });

        //const resultado = await resposta.json();

        //if (!resposta.ok) {

           // throw new Error(resultado.erro || "Erro ao realizar cadastro.");

       // }


       const texto = await resposta.text();

console.log("STATUS:", resposta.status);
console.log("RESPOSTA:", texto);

let resultado = {};

try {
    resultado = JSON.parse(texto);
} catch {}

if (!resposta.ok) {
    throw new Error(resultado.erro || texto || "Erro ao realizar cadastro.");
}



        msg.className = "form-message success";

        msg.innerHTML = `
            ✔ Cadastro realizado com sucesso!
            <br><br>
            Seja bem-vindo(a) ao Instituto Língua Solta.
        `;

        form.reset();

        currentStep = 0;

        showStep(currentStep);

    }

    catch (erro) {

        msg.className = "form-message error";

        msg.textContent = erro.message;

    }

    finally {

        submitButton.classList.remove("loading");

        submitButton.textContent = "Finalizar Cadastro";

    }

});

  

    /* ==============================
       INICIAR
    ============================== */

    showStep(currentStep);

});