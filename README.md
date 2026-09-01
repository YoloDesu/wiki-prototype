# RelayBridge Demo

Demo web client-side de tradução simultânea para suporte industrial. A experiência simula uma conversa entre técnico, engenheiro e cliente com localização inglês/japonês para mensagens, voz, imagem e documentos PDF.

## Executar

Requer Node.js `>=22.13.0`.

```bash
npm install
npm start
```

Comandos úteis:

- `npm start`: abre a aplicação local em modo de desenvolvimento.
- `npm run build`: gera o build de produção.
- `npm run preview`: executa o build de produção após `npm run build`.
- `npm test`: valida o build, a renderização e os artefatos da demo.
- `npm run generate:pdfs`: recria os boletins técnicos em inglês e japonês.

## Conteúdo simulado

- O roteiro, as traduções e as respostas rápidas ficam em `app/page.tsx`.
- O player de voz é visual; um arquivo real pode ser conectado posteriormente pelo modelo de anexo já previsto.
- Os PDFs finais são servidos por `public/demo-files/` e suas cópias de entrega ficam em `output/pdf/`.
- Não há backend, autenticação, conexão com ChatGPT, upload, persistência ou chamadas a serviços de IA.
