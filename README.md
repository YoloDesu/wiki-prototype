# RelayBridge Demo

Demo web client-side de tradução simultânea para suporte industrial. A experiência simula uma conversa entre técnico, engenheiro e cliente com localização inglês/japonês para mensagens, voz, imagem e documentos PDF.

## Executar

Requer Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Comandos úteis:

- `npm run build`: gera o build de produção.
- `npm test`: valida o build, a renderização e os artefatos da demo.
- `npm run generate:pdfs`: recria os boletins técnicos em inglês e japonês.

## Conteúdo simulado

- O roteiro, as traduções e as respostas rápidas ficam em `app/page.tsx`.
- O player de voz é visual; um arquivo real pode ser conectado posteriormente pelo modelo de anexo já previsto.
- Os PDFs finais são servidos por `public/demo-files/` e suas cópias de entrega ficam em `output/pdf/`.
- Não há backend, autenticação, upload, persistência ou chamadas a serviços de IA.
