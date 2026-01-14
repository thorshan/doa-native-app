// utils/getAvatarUrl.ts
import { AVATAR_LIST } from "../constants/Avatars";

/**
 * Resolves an avatar source from either a numeric ID or a fallback.
 * This is used across Settings and Profile screens.
 */
export const getAvatarSource = (input: any) => {
  // 1. If the input is a number (or string number like "5")
  const avatarId = Number(input);
  
  if (!isNaN(avatarId) && avatarId > 0) {
    const avatar = AVATAR_LIST.find((a) => a.id === avatarId);
    return avatar ? avatar.img : AVATAR_LIST[0].img;
  }

  // 2. If the input is an object from your old backend logic { image: "..." }
  if (typeof input === 'object' && input?.image) {
    const nestedId = Number(input.image);
    const avatar = AVATAR_LIST.find((a) => a.id === nestedId);
    return avatar ? avatar.img : AVATAR_LIST[0].img;
  }

  // 3. Fallback to the first avatar (001-ramen.png)
  return AVATAR_LIST[0].img;
};