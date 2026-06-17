export type UIBannerClickAction = "link" | "referral_modal";

export const REFERRAL_MODAL_ACTION_LINK = "action:referral_modal";
export const REFERRAL_MODAL_ACTION_LINK_LEGACY = "action:referal_modal";

export const normalizeBannerClickAction = (value: unknown): UIBannerClickAction => {
  return String(value ?? "").trim() === "referral_modal" ? "referral_modal" : "link";
};

export const isReferralModalAction = (value: unknown): boolean => {
  return normalizeBannerClickAction(value) === "referral_modal";
};

export const isReferralModalLinkUrl = (value: unknown): boolean => {
  const v = String(value ?? "").trim().toLowerCase();
  return v === REFERRAL_MODAL_ACTION_LINK || v === REFERRAL_MODAL_ACTION_LINK_LEGACY;
};

export const isBannerReferralTarget = (item: {
  click_action?: string | null;
  link_url?: string | null;
}): boolean => {
  return isReferralModalAction(item.click_action) || isReferralModalLinkUrl(item.link_url);
};
