# RelayBridge — handoff da sessão

Atualizado em: 2026-09-04

## Objetivo atual

Evoluir o cenário existente de suporte do AX-400 com uma chamada ao vivo inspirada no Teams. A chamada deve:

- ter roteiro sincronizado em inglês e japonês;
- permitir alternar a perspectiva entre técnico, engenheiro e cliente;
- trocar o áudio para inglês ou japonês no mesmo ponto da chamada quando a perspectiva mudar;
- deixar preparada uma interface clara para receber os arquivos reais de áudio dos dois idiomas.

## Estado

- [x] Repositório e experiência existente mapeados.
- [x] Escopo técnico e visual definido.
- [ ] Manifesto bilíngue da chamada e contrato dos arquivos de áudio.
- [ ] Interface de chamada, controles e troca de perspectiva.
- [ ] Roteiro sincronizado em inglês e japonês.
- [ ] Testes e build de produção.
- [ ] Publicação e revisão final.

## Decisões

- A chamada será parte do mesmo caso “AX-400 pressure alert”, aberta a partir da conversa.
- O idioma ouvido acompanha automaticamente a perspectiva ativa: Emma e Daniel ouvem inglês; Kenji ouve japonês.
- A reprodução mantém o instante atual ao trocar de idioma, evitando reiniciar a chamada.
- Enquanto os MP3 finais não estiverem presentes, a interface funciona em modo de demonstração silenciosa, com timeline e roteiro sincronizados.

## Arquivos esperados para áudio

- `public/audio/ax400-support-call.en.mp3`
- `public/audio/ax400-support-call.ja.mp3`

Os dois arquivos devem ter a mesma duração e falas alinhadas no tempo. O contrato final ficará documentado ao lado do manifesto da chamada.

## Próximos passos

1. Criar o modelo de dados da chamada e o adaptador de áudio bilíngue.
2. Implementar a interface e as interações.
3. Cobrir o novo fluxo com testes e validar o build.
4. Atualizar este handoff com o resultado e os commits.
