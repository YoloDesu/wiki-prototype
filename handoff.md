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
- [x] Manifesto bilíngue da chamada e contrato dos arquivos de áudio.
- [x] Interface de chamada, controles e troca de perspectiva.
- [x] Roteiro sincronizado em inglês e japonês.
- [x] Testes automatizados completos (5/5 passando).
- [x] Build de produção.
- [x] Lint sem erros.
- [ ] Publicação e revisão final (projeto privado criado; build de hospedagem validado).

## Decisões

- A chamada será parte do mesmo caso “AX-400 pressure alert”, aberta a partir da conversa.
- O idioma ouvido acompanha automaticamente a perspectiva ativa: Emma e Daniel ouvem inglês; Kenji ouve japonês.
- A reprodução mantém o instante atual ao trocar de idioma, evitando reiniciar a chamada.
- Enquanto os MP3 finais não estiverem presentes, a interface funciona em modo de demonstração silenciosa, com timeline e roteiro sincronizados.
- O roteiro pode ser visualizado em inglês, japonês ou nos dois idiomas, e baixado como `.txt`.
- A imagem de compartilhamento foi atualizada para representar a chamada com três participantes e áudio bilíngue.

## Arquivos esperados para áudio

- `public/audio/ax400-support-call.en.mp3`
- `public/audio/ax400-support-call.ja.mp3`

Os dois arquivos devem ter a mesma duração e falas alinhadas no tempo. O contrato final ficará documentado ao lado do manifesto da chamada.

## Próximos passos

1. Registrar os metadados e a configuração de publicação.
2. Empacotar e publicar a versão validada.
3. Fazer a revisão final do estado do repositório e deste handoff.

## Registro da sessão

- `dfc244f` — handoff inicial e escopo da chamada.
- `50575fe` — chamada bilíngue, script sincronizado e contrato dos MP3.
- Em andamento — metadados de compartilhamento e publicação privada.
