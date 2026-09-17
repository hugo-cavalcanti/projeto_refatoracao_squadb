# Portfolio Squad B Refatorado

Projeto da Avaliacao do 1o Ciclo de Processos de Qualidade & Chat com IA. A Squad B foi escolhida por possuir oito paginas, portfolio de projetos, servicos, habilidades, depoimentos, case de sucesso, imagens e icones SVG.

## Estrutura

```text
projeto-refatorado/
├── assets/
│   ├── img/
│   └── svg/
├── src/
│   ├── *.html
│   ├── styles/
│   └── scripts/chat.js
├── docs/
├── .gitignore
└── README.md
```

## Refatoracoes realizadas

- Separacao de HTML, estilos, scripts, imagens e SVGs.
- Inclusao de `charset`, `viewport`, titulos e rotas locais validas.
- Correcao de links com `#` ou ancora inexistente para paginas reais.
- Uso de `main` em `sobre.html` e melhoria de textos alternativos das imagens.
- Rotas de imagens e icones atualizadas para `../assets/`.
- Widget de chat reutilizavel em todas as paginas, com botao flutuante, modal responsivo, foco, `aria-label`, historico da sessao e estado de digitacao.
- Integracao opcional com Google Gemini usando `fetch` e `async/await`.
- Fallback local para demonstracao sem chave de API.
- CSS do chat isolado em arquivo proprio para reduzir acoplamento aos estilos originais.

A refatoracao preserva a proposta visual original. Os estilos legados de cada pagina permanecem separados para que a comparacao antes/depois seja rastreavel; o novo componente comum fica em `src/styles/chat.css`.

## Como executar

1. Abra `projeto-refatorado` no VS Code.
2. Instale a extensao **Live Server**.
3. Clique com o botao direito em `src/home.html` e escolha **Open with Live Server**.
4. Navegue pelas paginas usando o menu.

Tambem e possivel abrir `src/home.html` diretamente no navegador, mas o Live Server e recomendado para testar as rotas locais.

## Como testar o chat

1. Abra qualquer pagina pelo Live Server.
2. Clique no botao `?` no canto inferior direito.
3. Envie perguntas como `Quais servicos voces oferecem?`, `Quais projetos existem?` ou `Quais skills a squad possui?`.
4. Sem configuracao adicional, o chat responde pelo mock local.

### Gemini opcional para demonstracao local

Nao coloque uma chave em HTML, CSS, JavaScript versionado ou README. No console do navegador, configure temporariamente:

```js
localStorage.setItem('gemini_api_key', 'SUA_CHAVE_LOCAL')
```

Recarregue a pagina e envie uma pergunta. Para remover a chave:

```js
localStorage.removeItem('gemini_api_key')
```

Em producao, a chave deve ficar em um backend/proxy seguro. Expor a chave diretamente no frontend permite que qualquer visitante a copie.

## Validacoes executadas

```powershell
node --check .\src\scripts\chat.js
```

A checagem de referencias locais confirma que os oito HTMLs apontam para arquivos existentes em `assets`, `styles` e `scripts`.

## Roteiro de commits atomicos

Execute dentro do repositorio Git, revisando cada diff antes do commit:

```powershell
git add projeto-refatorado assets src docs .gitignore
git commit -m "chore: remove squads and structure project"

git add projeto-refatorado/src/*.html projeto-refatorado/assets
git commit -m "refactor: semantic html and asset paths"

git add projeto-refatorado/src/styles
 git commit -m "style: standardize css and responsive layout"

git add projeto-refatorado/src/styles/chat.css projeto-refatorado/src/*.html
 git commit -m "feat: add chatbot interface"

git add projeto-refatorado/src/scripts/chat.js
 git commit -m "feat: integrate optional gemini chat"

git add projeto-refatorado/README.md projeto-refatorado/docs
 git commit -m "docs: document refactoring and ai chat"
```

Os comandos acima representam o roteiro solicitado. Como a pasta original foi preservada para comparacao, a remocao das outras squads deve ser feita somente quando o professor exigir uma copia limpa:

```powershell
Get-ChildItem .\squads -Directory | Where-Object Name -ne 'squad-B' | Remove-Item -Recurse -Force
```

## Antes e depois resumido

| Area | Antes | Depois |
|---|---|---|
| Estrutura | HTML, CSS, imagens e SVG misturados | `src`, `assets`, `docs` e arquivos de configuracao |
| Navegacao | Links `#` e ancora `#Sobre` inexistente | Rotas reais entre paginas |
| Responsividade | Viewport ausente em varias paginas e larguras rigidas | Viewport em todas as paginas; chat com dimensoes responsivas |
| Acessibilidade | Imagens sem descricao e icones sem nome | `alt`, `aria-label`, `aria-current` e `aria-live` |
| IA | Nenhum componente | Chat mock local e Gemini opcional via `fetch` |

## Roteiro de apresentacao, 2 minutos

**0:00-0:20**: Apresente a Squad B e explique a escolha: oito paginas e recursos suficientes para demonstrar organizacao, qualidade e integracao.

**0:20-0:50**: Mostre a estrutura nova. Explique a separacao entre `src`, `assets` e `docs`, destacando que os caminhos relativos foram atualizados sem alterar a finalidade visual.

**0:50-1:20**: Demonstre as correcoes de qualidade: viewport, navegacao sem links mortos, HTML semantico em pontos centrais, textos alternativos e nomes acessiveis nos controles.

**1:20-1:50**: Abra o chat. Mostre uma pergunta respondida pelo fallback local, o estado de digitacao e explique que a chave Gemini fica configuravel localmente e nunca deve ser publicada no frontend.

**1:50-2:00**: Finalize com os seis commits atomicos e a validacao com `node --check`, reforcando que cada etapa pode ser auditada por seu diff.
