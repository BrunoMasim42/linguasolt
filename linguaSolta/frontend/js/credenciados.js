const API = "/api/credenciados";

const lista = document.getElementById("lista-credenciados");
const pesquisa = document.getElementById("pesquisa");
const cidade = document.getElementById("cidade");

let credenciados = [];

/* ==========================
   CARREGA TODOS
========================== */

async function carregarCredenciados(){

    try{

        const response = await fetch(API);

        credenciados = await response.json();

        preencherMunicipios();

        renderizar(credenciados);

    }catch(e){

        console.error(e);

        lista.innerHTML = `
            <div class="erro">
                Não foi possível carregar os credenciados.
            </div>
        `;

    }

}

/* ==========================
   MUNICÍPIOS
========================== */

function preencherMunicipios(){

    const municipios = [...new Set(
        credenciados.map(c=>c.municipio).filter(Boolean)
    )];

    municipios.sort();

    municipios.forEach(m=>{

        cidade.innerHTML += `
            <option value="${m}">
                ${m}
            </option>
        `;

    });

}

/* ==========================
   RENDERIZA
========================== */

function renderizar(listaCredenciados){

    if(listaCredenciados.length===0){

        lista.innerHTML=`
            <h3>Nenhum credenciado encontrado.</h3>
        `;

        return;

    }

    lista.innerHTML="";

    listaCredenciados.forEach(c=>{

        lista.innerHTML+=`

        <div class="card-credenciado">

            <img
                src="${c.imagem}"
                alt="${c.nome}"
            >

            <div class="card-body">

                <h3>${c.nome}</h3>

                <h4>${c.cargo}</h4>

                <p>

                    ${c.historico}

                </p>

                <a
                    href="#"
                    class="btn-perfil"
                    onclick="abrirPerfil(${c.id})"
                >

                    Ver Perfil

                </a>

            </div>

        </div>

        `;

    });

}

/* ==========================
   PESQUISA
========================== */

pesquisa.addEventListener("keyup",filtrar);

cidade.addEventListener("change",filtrar);

function filtrar(){

    let texto=pesquisa.value.toLowerCase();

    let municipio=cidade.value;

    let resultado=credenciados.filter(c=>{

        let okTexto=

            c.nome.toLowerCase().includes(texto) ||

            c.cargo.toLowerCase().includes(texto) ||

            c.historico.toLowerCase().includes(texto);

        let okCidade=

            municipio==="" ||

            c.municipio===municipio;

        return okTexto && okCidade;

    });

    renderizar(resultado);

}

/* ==========================
   MODAL
========================== */

async function abrirPerfil(id){

    try{

        const response=await fetch(API+"/"+id);

        const c=await response.json();

        document.getElementById("perfilImagem").src=c.imagem;

        document.getElementById("perfilNome").innerHTML=c.nome;

        document.getElementById("perfilCargo").innerHTML=c.cargo;

        document.getElementById("perfilCidade").innerHTML=c.municipio;

        document.getElementById("perfilBiografia").innerHTML=c.biografia;

        configurarContato("perfilWhatsapp",
            c.whatsapp ?
            "https://wa.me/"+c.whatsapp.replace(/\D/g,"")
            :null);

        configurarContato("perfilInstagram",c.instagram);

        configurarContato("perfilFacebook",c.facebook);

        configurarContato("perfilEmail",
            c.email ?
            "mailto:"+c.email
            :null);

        document
            .getElementById("modalCredenciado")
            .classList.remove("hidden");

    }catch(e){

        console.error(e);

    }

}

/* ==========================
   LINKS
========================== */

function configurarContato(id,link){

    const elemento=document.getElementById(id);

    if(!elemento) return;

    if(link){

        elemento.href=link;

        elemento.classList.remove("hidden");

    }else{

        elemento.classList.add("hidden");

    }

}

/* ==========================
   FECHAR
========================== */

document
.getElementById("fecharModal")
.addEventListener("click",()=>{

    document
    .getElementById("modalCredenciado")
    .classList.add("hidden");

});

window.onclick=function(e){

    const modal=document.getElementById("modalCredenciado");

    if(e.target===modal){

        modal.classList.add("hidden");

    }

}

/* ==========================
   INICIAR
========================== */

carregarCredenciados();