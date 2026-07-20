const API = `${window.location.origin}/api/associados`;

const tbody = document.getElementById("listaAssociados");

async function carregarAssociados() {

    try {

        const resposta = await fetch(API);

        if (!resposta.ok) {

            throw new Error("Erro ao carregar associados.");

        }

        const associados = await resposta.json();

        if (!associados.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Nenhum associado cadastrado.
                    </td>
                </tr>
            `;

            return;

        }

        tbody.innerHTML = associados.map(associado => `

            <tr>

                <td>${associado.nome ?? ""}</td>

                <td>${associado.email ?? ""}</td>

                <td>${associado.cidade ?? ""}</td>

                <td>${associado.telefone ?? ""}</td>

                <td>

                    <button
                        class="btn visualizar"
                        data-id="${associado.id}">

                        Visualizar

                    </button>

                </td>

            </tr>

        `).join("");

    }

    catch (erro) {

        console.error(erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Erro ao carregar associados.
                </td>
            </tr>
        `;

    }

}

document.addEventListener("DOMContentLoaded", () => {

    carregarAssociados();

});