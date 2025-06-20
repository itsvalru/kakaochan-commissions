import type { CommissionDraft } from '@/lib/types/commission';

export function calculateTotalPrice(draft: CommissionDraft): number {
  let total = draft.base_price;

  // Extra characters (1st is included)
  if (draft.character_count > 1) {
    const extra = draft.character_count - 1;
    total += extra * draft.extra_character_price;
  }

  // Addons
  draft.addons?.forEach((addon) => {
    if (addon.type === 'boolean' && addon.value === true && addon.price) {
      total += addon.price;
    }
    if (addon.type === 'input' && addon.value && addon.price) {
      total += addon.price;
    }
    if (addon.type === 'list' && Array.isArray(addon.value) && addon.price) {
      total += addon.value.length * addon.price;
    }
  });

  // Stream privacy fee
  if (draft.allow_streaming === false) {
    total += total * 0.25;
  }

  return parseFloat(total.toFixed(2));
}
