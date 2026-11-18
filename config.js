/* =====================================================================
   CONFIGURAÇÕES DO ÁLBUM  —  este é o arquivo que você edita.

   Abra com o Bloco de Notas (ou VS Code), troque o que está entre
   aspas "assim", salve e atualize a página no navegador (F5).

   Atenção: mantenha as aspas, as vírgulas no fim das linhas e não
   apague as chaves { } e colchetes [ ].
   ===================================================================== */

window.CONFIG = {

  /* ----- Quem e quando ----- */
  noivos: { nome1: "Duda", nome2: "Mateus" },
  data: "18 de novembro de 2026",          // aparece na capa, na página de rosto e no título da aba

  /* ----- Textos ----- */
  textos: {
    apresenta:    "Duda Cruz Videomaker apresenta",   // página de rosto (dentro da capa)
    capaFrase:    "Uma história para sempre",         // pequena frase dourada na capa
    dedicatoria:  "Cada página, um pedaço desse dia.",// frase pequena na página de rosto
    botaoAbrir:   "Abrir Álbum ↗",
    botaoVoltar:  "‹ Voltar",
    botaoSeguir:  "Seguir ›",
    dicaMusica:   "♪ ♫ ♪",                            // aparece embaixo do botão de abrir ("" = nada)
    cartaTitulo:  "Com carinho",                      // última página
    assinatura:   "Duda Cruz | @byduda.cruz",
    botaoRever:   "Rever álbum",
    botaoCompartilhar: "Compartilhar"
  },

  /* ----- Mensagem da última página (cada linha entre aspas é um parágrafo) ----- */
  mensagem: [
    "Que este álbum seja uma lembrança especial de um dos dias mais importantes da história de vocês.",
    "Obrigada pela confiança no meu trabalho e por me permitirem eternizar um pedacinho dessa história. 🤍"
  ],

  /* ----- Como as páginas são montadas ----- */
  album: {
    videoACada: 4,        // a cada quantas fotos entra 1 vídeo (0 = vídeos só no final)
    /* Modelos de página, usados em sequência e repetidos:
       "solo" = 1 foto grande · "duo" = 2 · "trio" = 1 grande + 2 pequenas · "quad" = 4 */
    modelos: ["trio", "solo", "duo", "quad", "trio", "duo"],
    folhasAoAbrir: 6      // quantas folhas "passam" na animação de abrir o álbum
  },

  /* ----- Música e sons ----- */
  musica: {
    volume: 0.55,                 // de 0 (mudo) a 1 (máximo) — vale para a música da pasta assets/musica
    usarTrilhaGerada: true        // se a pasta de música estiver vazia, toca uma trilha suave criada pela página
  },
  sons: { virarPagina: true },    // som suave de papel ao virar a página (respeita o botão de música)

  /* ----- Demonstração -----
     true  = se as pastas de fotos e vídeos estiverem vazias, mostra exemplos da internet.
     false = nada de exemplo (use quando for entregar de verdade). */
  mostrarDemo: true
};
