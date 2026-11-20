<!-- Template de pull request : la checklist ci-dessous est la référence unique du projet. -->

## Summary
<!-- Décrire brièvement les changements et le contexte -->

## Verification
<!-- Indiquer les commandes ou vérifications exécutées -->

## Checklist de pull request
- [ ] L'issue concernée est liée (`Closes #<numéro>` dans la description)
- [ ] `npx vitest run` passe (nouveaux tests inclus dans la couverture)
- [ ] `npm run lint` : 0 erreur / 0 avertissement
- [ ] `npm run build` : OK
- [ ] Les textes visibles sont traduits (fr et en)
- [ ] Les nouvelles sources exportées sont documentées (JSDoc)
- [ ] La branche est à jour de `main`
