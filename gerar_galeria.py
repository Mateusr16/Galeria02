#!/usr/bin/env python3
"""
Lê as pastas dentro de "assets" e grava a lista de arquivos em assets/js/galeria.js.
Use pelo duplo clique em atualizar-galeria.bat (ou: python gerar_galeria.py).

  assets/capa/     -> 1 imagem para a janelinha da capa do álbum (opcional)
  assets/fotos/    -> fotos (pode organizar em subpastas; a ordem é a dos nomes)
  assets/video/    -> vídeos (tocam mudos dentro das páginas)
  assets/musica/   -> 1 música
"""
import json
import os
import re
import sys
from datetime import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, "assets")
SAIDA = os.path.join(ASSETS, "js", "galeria.js")

IMG = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}
VID = {".mp4", ".webm", ".mov", ".m4v"}
AUD = {".mp3", ".m4a", ".ogg", ".wav", ".aac"}


def natural(s):
    """Ordem natural: foto2 vem antes de foto10."""
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]


def listar(pasta, exts, recursivo=False):
    """Lista arquivos (caminho relativo à pasta, com /) na ordem natural."""
    if not os.path.isdir(pasta):
        return []
    achados = []
    if recursivo:
        for raiz, dirs, arqs in os.walk(pasta):
            dirs[:] = [d for d in dirs if not d.startswith(".")]
            for f in arqs:
                if not f.startswith(".") and os.path.splitext(f)[1].lower() in exts:
                    rel = os.path.relpath(os.path.join(raiz, f), pasta).replace(os.sep, "/")
                    achados.append(rel)
    else:
        for f in os.listdir(pasta):
            if (os.path.isfile(os.path.join(pasta, f)) and not f.startswith(".")
                    and os.path.splitext(f)[1].lower() in exts):
                achados.append(f)
    return sorted(achados, key=natural)


def main():
    avisos = []
    fotos = listar(os.path.join(ASSETS, "fotos"), IMG, recursivo=True)
    videos = listar(os.path.join(ASSETS, "video"), VID, recursivo=True)
    musica = listar(os.path.join(ASSETS, "musica"), AUD)
    capa = listar(os.path.join(ASSETS, "capa"), IMG)

    if len(musica) > 1:
        avisos.append(f"Há {len(musica)} músicas; será usada '{musica[0]}'.")
    if len(capa) > 1:
        avisos.append(f"Há {len(capa)} imagens em capa; será usada '{capa[0]}'.")
    if len(fotos) + len(videos) > 300:
        avisos.append("Muitos arquivos: álbuns com mais de 300 itens podem ficar pesados.")

    dados = {
        "fotos": fotos,
        "videos": videos,
        "musica": musica[0] if musica else None,
        "capa": capa[0] if capa else None,
    }

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write("/* ARQUIVO GERADO AUTOMATICAMENTE — não edite à mão.\n")
        f.write("   Rode \"atualizar-galeria.bat\" (duplo clique) para atualizar esta lista.\n")
        f.write(f"   Última atualização: {datetime.now():%d/%m/%Y %H:%M} */\n")
        f.write("window.GALERIA = " + json.dumps(dados, ensure_ascii=False, indent=1) + ";\n")

    paginas = max(1, -(-(len(fotos) + len(videos)) // 2))
    print("Álbum atualizado!\n")
    print(f"  Fotos: {len(fotos)}" + ("" if fotos else "  (nenhuma)"))
    print(f"  Vídeos: {len(videos)}" + ("" if videos else "  (nenhum)"))
    if not fotos and not videos:
        print("  -> Sem fotos e vídeos, a página mostra exemplos da internet.")
    print(f"  Música: {dados['musica'] or 'nenhuma (usará a trilha gerada)'}")
    print(f"  Capa: {dados['capa'] or 'nenhuma (usará a primeira foto)'}")
    for a in avisos:
        print("  ATENÇÃO:", a)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Algo deu errado:", e)
        sys.exit(1)
