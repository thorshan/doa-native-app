// constants/Avatars.ts

export const AVATAR_LIST = [
  { id: 1, name: "Ramen", img: require("../assets/avatars/001-ramen.png") },
  { id: 2, name: "Woman", img: require("../assets/avatars/002-woman.png") },
  { id: 3, name: "Daruma", img: require("../assets/avatars/003-daruma.png") },
  { id: 4, name: "Man", img: require("../assets/avatars/004-man.png") },
  { id: 5, name: "Samurai", img: require("../assets/avatars/005-samurai.png") },
  { id: 6, name: "Fan", img: require("../assets/avatars/006-fan.png") },
  { id: 7, name: "Man 1", img: require("../assets/avatars/007-man-1.png") },
  { id: 8, name: "Classic Avatar", img: require("../assets/avatars/008-avatar.png") },
  { id: 9, name: "Man 2", img: require("../assets/avatars/009-man-2.png") },
  { id: 10, name: "Samurai 1", img: require("../assets/avatars/010-samurai-1.png") },
  { id: 11, name: "Samurai 2", img: require("../assets/avatars/011-samurai-2.png") },
  { id: 12, name: "Man 3", img: require("../assets/avatars/012-man-3.png") },
  { id: 13, name: "Maneki Neko", img: require("../assets/avatars/013-maneki-neko.png") },
  { id: 14, name: "Sushi", img: require("../assets/avatars/014-sushi.png") },
  { id: 15, name: "Ninja", img: require("../assets/avatars/015-ninja.png") },
  { id: 16, name: "Ninja 1", img: require("../assets/avatars/016-ninja-1.png") },
  { id: 17, name: "Ninja 2", img: require("../assets/avatars/017-ninja-2.png") },
  { id: 18, name: "Tea", img: require("../assets/avatars/018-tea.png") },
  { id: 19, name: "Shiba Inu", img: require("../assets/avatars/019-shiba-inu.png") },
  { id: 20, name: "Mount Fuji", img: require("../assets/avatars/020-mount-fuji.png") },
  { id: 21, name: "Torii Gate", img: require("../assets/avatars/021-tori.png") },
];

export const getAvatarSource = (id: any) => {
  const numericId = Number(id);
  const avatar = AVATAR_LIST.find((a) => a.id === numericId);
  return avatar ? avatar.img : AVATAR_LIST[0].img;
};