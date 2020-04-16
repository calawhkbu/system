export default function fixAccessControlledCards(cards: any[], original: any[]) {
  // fix layout
  switch (cards.length) {
    case 0:
      break
    case 1: {
      const card = cards[0]
      const oldLayouts = card.layouts
      const lgLayout = { ...(oldLayouts.lg || oldLayouts.md || {}) } as any
      lgLayout.w = 12
      lgLayout.h = 25
      const smLayout = { ...(oldLayouts.sm || oldLayouts.xs || {}) } as any
      smLayout.w = 4
      smLayout.h = 12
      card.layouts = {
        lg: lgLayout,
        md: lgLayout,
        sm: smLayout,
        xs: smLayout,
      }
      break
    }
    case 2:
      const card1 = cards[0]
      const card2 = cards[1]
      const card1OldLayouts = card1.layouts
      const card2OldLayouts = card2.layouts
      const card1LgLayout = {
        ...(card1OldLayouts.lg || card1OldLayouts.md || {}),
      } as any
      const card2LgLayout = {
        ...(card2OldLayouts.lg || card2OldLayouts.md || {}),
      } as any
      if (card1LgLayout.w <= 6 && card2LgLayout.w <= 6) {
        card1LgLayout.x = 0
        card2LgLayout.x = 6
        card1LgLayout.w = card2LgLayout.w = 6
        card1LgLayout.h = card2LgLayout.h = 16
      } else {
        card1LgLayout.w = card2LgLayout.w = 12
        card1LgLayout.h = card2LgLayout.h = 13
      }
      const card1SmLayout = {
        ...(card1OldLayouts.sm || card1OldLayouts.xs || {}),
      } as any
      const card2SmLayout = {
        ...(card2OldLayouts.sm || card2OldLayouts.xs || {}),
      } as any
      card1SmLayout.w = card2SmLayout.w = 4
      card1SmLayout.h = card2SmLayout.h = 8
      card1.layouts = {
        lg: card1LgLayout,
        md: card1LgLayout,
        sm: card1SmLayout,
        xs: card1SmLayout,
      }
      card2.layouts = {
        lg: card2LgLayout,
        md: card2LgLayout,
        sm: card2SmLayout,
        xs: card2SmLayout,
      }
      break
    default: {
      for (const card of cards) {
        const oldLayouts = card.layouts
        const lgLayout = { ...(oldLayouts.lg || oldLayouts.md || {}) } as any
        lgLayout.w = 12
        lgLayout.h = 13
        const smLayout = { ...(oldLayouts.sm || oldLayouts.xs || {}) } as any
        smLayout.w = 4
        smLayout.h = 8
        card.layouts = {
          lg: lgLayout,
          md: lgLayout,
          sm: smLayout,
          xs: smLayout,
        }
      }
      break
    }
  }

  // fix __FE_showMonth
  const cardId = original[0].cardId
  if (original.reduce((re, c) => re && c.cardId === cardId, true)) {
    // all using same cards
    if (original.find(c => c.params.filters && c.params.filters.__FE_showMonth)) {
      // have a card with __FE_showMonth
      for (const card of cards) {
        if (!card.params.filters) card.params.filters = {}
        card.params.filters.__FE_showMonth = true
      }
    }
  }
}