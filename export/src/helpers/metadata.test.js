const { prepare } = require('./metadata')

test('replace bibliography in YAML metadata', () => {
  expect(prepare(`---
title: Stylo
bibliography: foo.bib
subtitle: A user friendly text editor for humanities scholars.
authors:
  - forname: Marcello
    surname: Vitali-Rosati
    orcid: 0000-0001-6424-3229
---
`, {id: 'abcd1234', replaceBibliography: true})).toBe(`---
authors:
  - forname: Marcello
    orcid: 0000-0001-6424-3229
    surname: Vitali-Rosati
bibliography: abcd1234.bib
subtitle: A user friendly text editor for humanities scholars.
title: Stylo
title_f: untitled
---`
  )
})

test('year/month/day are derived from date', () => {
  expect(prepare(`---
title: Stylo
date: '2021-02-25'
---
`, {id: 'abcd1234'})).toBe(`---
date: 2021/02/25
day: '25'
month: '02'
title: Stylo
title_f: untitled
year: '2021'
---`
  )

  expect(prepare(`---
title_f: Stylo
date: '2021/02/25'
---
`, {id: 'abcd1234'})).toBe(`---
date: 2021/02/25
day: '25'
month: '02'
title: Stylo
title_f: Stylo
year: '2021'
---`
  )
})

test('replace XYZ_f fields by non-formatted XYZ field', () => {
  expect(prepare(`---
title_f: "**Stylo**"
subtitle_f: "T'as pas _froid_ aux yeux ?"
keywords:
- lang: fr
  list_f:
    - "**Tomme de Savoie**"
    - Comté
---`, {id: 'abcd1234'})).toBe(`---
keywords:
  - lang: fr
    list: Tomme de Savoie, Comté
    list_f: '**Tomme de Savoie**, Comté'
subtitle: T'as pas froid aux yeux ?
subtitle_f: T'as pas _froid_ aux yeux ?
title: Stylo
title_f: '**Stylo**'
---`)
})
