import fs from 'node:fs';

const ARQUIVO = 'cr7.json';
const atual = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));

async function atualizarStats() {
  try {
    const res = await fetch('https://www.messivsronaldo.app/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      console.log('Site indisponível no momento:', res.status);
      return;
    }

    const html = await res.text();
    let novos = { ...atual };

    // Tenta extrair dos dados estruturados da página
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (nextDataMatch) {
      const textoJson = nextDataMatch[1];
      const golsMatch = textoJson.match(/"ronaldo"[^}]*?"goals"\s*:\s*(\d+)/i);
      const assistMatch = textoJson.match(/"ronaldo"[^}]*?"assists"\s*:\s*(\d+)/i);
      const titulosMatch = textoJson.match(/"ronaldo"[^}]*?"trophies"\s*:\s*(\d+)/i);

      if (golsMatch) novos.gols = Math.max(atual.gols, Number(golsMatch[1]));
      if (assistMatch) novos.assistencias = Math.max(atual.assistencias, Number(assistMatch[1]));
      if (titulosMatch) novos.titulos = Math.max(atual.titulos, Number(titulosMatch[1]));
    }

    if (
      novos.gols !== atual.gols ||
      novos.assistencias !== atual.assistencias ||
      novos.titulos !== atual.titulos
    ) {
      fs.writeFileSync(ARQUIVO, JSON.stringify(novos, null, 2) + '\n');
      console.log('Atualizado:', novos);
    } else {
      console.log('Nenhuma alteração nos números.');
    }
  } catch (erro) {
    console.log('Falha na consulta, mantendo valores atuais:', erro.message);
  }
}

atualizarStats();
