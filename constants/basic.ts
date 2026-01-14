export const GET_STARTED = [
  {
    tag: "Basic",
    description: [
      {
        _id: 1,
        title: "ပထမဦးစွာ",
        tag: "ဂျပန်ဘာသာစကားမှာ အဓိကထားလေ့လာရမည့်အရာများ",
        content: [
          {
            _id: 1,
            title: "Romaji",
            tag: "Ni Hon",
            description: "အသံထွက်လွယ်ကူစေရန်၊ ကွန်ပျူတာ စာရိုက်ရန်",
          },
          {
            _id: 2,
            title: "Hiragana",
            tag: "にほん",
            description: "သရ (၅)လုံး + ဗျည်း (၄၁)လုံး",
          },
          {
            _id: 3,
            title: "Katakana",
            tag: "ニホン",
            description:
              "မွေးစားစကားလုံးများ\n(Hiragana နှင့် အသံတူစကားလုံးကွဲ)",
          },
          {
            _id: 4,
            title: "Kanji",
            tag: "日本",
            description: "တရုတ် မွေးစားစကားလုံးများ",
          },
        ],
      },
      {
        _id: 2,
        title: "အခြေခံအသံထွက်များ",
        tag: "ဂျပန်ဘာသာစကား အခြေခံ အသံထွက်များ",
        content: [
          {
            _id: 1,
            title: "Hira | Kata",
            tag: "ひら | カタ",
            description: "အခြေခံအသံထွက်များ",
          },
          {
            _id: 2,
            title: "Dakuon",
            tag: "だくおん",
            description: "အသံပြင်း",
          },
          {
            _id: 3,
            title: "Handakuon",
            tag: "はんだくおん",
            description: "အသံပျော့",
          },
          {
            _id: 4,
            title: "Chouon",
            tag: "ちょうおん",
            description: "အသံရှည်/အသံစွဲ",
          },
          {
            _id: 5,
            title: "Hatsuon",
            tag: "はつおん",
            description: "[ん・ン]အသံပေါင်းခြင်း",
          },
          {
            _id: 6,
            title: "Sokuon",
            tag: "そくおん",
            description: "[っ・ッ]အသံပေါင်းခြင်း",
          },
          {
            _id: 7,
            title: "Youon",
            tag: "ようおん",
            description: "[や|ヤ・ゆ｜ユ・よ｜ヨ]အသံပေါင်းခြင်း",
          },
          {
            _id: 8,
            title: "Accent",
            tag: "アクセント",
            description: "အသံထွက်",
          },
          {
            _id: 9,
            title: "Intonation",
            tag: "イントネーション",
            description: "အသံနေအသံထား",
          },
        ],
      },
      {
        _id: 3,
        title: "Hiragana「ひらがな」",
        tag: "သရ (၅)လုံး နှင့် ဗျည်း (၄၁)လုံး",
        table: {
          rows: [
            {
              _id: 1,
              hira: ["あ", "い", "う", "え", "お"],
              romaji: ["a", "i", "u", "e", "o"],
            },
            {
              _id: 2,
              hira: ["か", "き", "く", "け", "こ"],
              romaji: ["Ka", "Ki", "Ku", "Ke", "Ko"],
            },
            {
              _id: 3,
              hira: ["さ", "し", "す", "せ", "そ"],
              romaji: ["Sa", "Shi", "Su", "Se", "So"],
            },
            {
              _id: 4,
              hira: ["た", "ち", "つ", "て", "と"],
              romaji: ["Ta", "Chi", "Tsu", "Te", "To"],
            },
            {
              _id: 5,
              hira: ["な", "に", "ぬ", "ね", "の"],
              romaji: ["Na", "Ni", "Nu", "Ne", "No"],
            },
            {
              _id: 6,
              hira: ["は", "ひ", "ふ", "へ", "ほ"],
              romaji: ["Ha", "Hi", "Hu", "He", "Ho"],
            },
            {
              _id: 7,
              hira: ["ま", "み", "む", "め", "も"],
              romaji: ["Ma", "Mi", "Mu", "Me", "Mo"],
            },
            {
              _id: 8,
              hira: ["や", "ゆ", "よ"],
              romaji: ["Ya", "Yu", "Yo"],
            },
            {
              _id: 9,
              hira: ["ら", "り", "る", "れ", "ろ"],
              romaji: ["Ra", "Ri", "Ru", "Re", "Ro"],
            },
            {
              _id: 10,
              hira: ["わ", "を"],
              romaji: ["Wa", "Wo"],
            },
            {
              _id: 11,
              hira: ["ん"],
              romaji: ["N"],
            },
          ],
        },
      },
      {
        _id: 4,
        title: "Katakana 「カタカナ」",
        tag: "အသံတူမွေးစားစကားလုံးများ",
        table: {
          rows: [
            {
              _id: 1,
              hira: ["ア", "イ", "ウ", "エ", "オ"],
              romaji: ["a", "i", "u", "e", "o"],
            },
            {
              _id: 2,
              hira: ["カ", "キ", "ク", "ケ", "コ"],
              romaji: ["Ka", "Ki", "Ku", "Ke", "Ko"],
            },
            {
              _id: 3,
              hira: ["サ", "シ", "ス", "セ", "ソ"],
              romaji: ["Sa", "Shi", "Su", "Se", "So"],
            },
            {
              _id: 4,
              hira: ["タ", "チ", "ツ", "テ", "ト"],
              romaji: ["Ta", "Chi", "Tsu", "Te", "To"],
            },
            {
              _id: 5,
              hira: ["ナ", "ニ", "ヌ", "ネ", "ノ"],
              romaji: ["Na", "Ni", "Nu", "Ne", "No"],
            },
            {
              _id: 6,
              hira: ["ハ", "ヒ", "フ", "ヘ", "ホ"],
              romaji: ["Ha", "Hi", "Hu", "He", "Ho"],
            },
            {
              _id: 7,
              hira: ["マ", "ミ", "ム", "メ", "モ"],
              romaji: ["Ma", "Mi", "Mu", "Me", "Mo"],
            },
            {
              _id: 8,
              hira: ["ヤ", "ユ", "ヨ"],
              romaji: ["Ya", "Yu", "Yo"],
            },
            {
              _id: 9,
              hira: ["ラ", "リ", "ル", "レ", "ロ"],
              romaji: ["Ra", "Ri", "Ru", "Re", "Ro"],
            },
            {
              _id: 10,
              hira: ["ワ", "ヲ"],
              romaji: ["Wa", "Wo"],
            },
            {
              _id: 11,
              hira: ["ン"],
              romaji: ["N"],
            },
          ],
        },
      },
      {
        _id: 5,
        title: "Dakuon「だくおん」",
        tag: "အသံပြင်း",
        table: {
          example: [
            {
              _id: 1,
              hiragana: "たまご",
              romaji: "ta ma go",
            },
            {
              _id: 2,
              hiragana: "ともだち",
              romaji: "to mo da chi",
            },
            {
              _id: 3,
              hiragana: "だいがく",
              romaji: "da i ga ku",
            },
            {
              _id: 4,
              hiragana: "たまご",
              romaji: "chi zu",
            },
            {
              _id: 5,
              hiragana: "かぎ",
              romaji: "ka gi",
            },
          ],
          rows: [
            {
              _id: 1,
              hira: ["が", "ぎ", "ぐ", "げ", "ご"],
              romaji: ["Ga", "Gi", "Gu", "Ge", "Go"],
            },
            {
              _id: 2,
              hira: ["ざ", "じ", "ず", "ぜ", "ぞ"],
              romaji: ["Za", "Ji", "Zu", "Ze", "Zo"],
            },
            {
              _id: 3,
              hira: ["だ", "ぢ", "づ", "で", "ど"],
              romaji: ["Da", "Dzi", "Dzu", "De", "Do"],
            },
            {
              _id: 4,
              hira: ["ば", "び", "ぶ", "べ", "ぼ"],
              romaji: ["Ba", "Bi", "Bu", "Be", "Bo"],
            },
            {
              _id: 5,
              hira: ["ガ", "ギ", "グ", "ゲ", "ゴ"],
              romaji: ["Ga", "Gi", "Gu", "Ge", "Go"],
            },
            {
              _id: 6,
              hira: ["ザ", "ジ", "ズ", "ゼ", "ゾ"],
              romaji: ["Za", "Ji", "Zu", "Ze", "Zo"],
            },
            {
              _id: 7,
              hira: ["ダ", "ヂ", "ヅ", "デ", "ド"],
              romaji: ["Da", "Dzi", "Dzu", "De", "Do"],
            },
            {
              _id: 8,
              hira: ["バ", "ビ", "ブ", "ベ", "ボ"],
              romaji: ["Ba", "Bi", "Bu", "Be", "Bo"],
            },
          ],
        },
      },
      {
        _id: 6,
        title: "Handakuon「はんだくおん」",
        tag: "အသံပျော့",
        table: {
          rows: [
            {
              _id: 1,
              hira: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
              romaji: ["Pa", "Pi", "Pu", "Pe", "Po"],
            },
            {
              _id: 2,
              hira: ["パ", "ピ", "プ", "ペ", "ポ"],
              romaji: ["Pa", "Pi", "Pu", "Pe", "Po"],
            },
          ],
        },
      },
      {
        _id: 7,
        title: "Youon「ようおん」",
        tag: "[や|ヤ・ゆ｜ユ・よ｜ヨ]အသံပေါင်းခြင်း",
        table: {
          example: [
            {
              _id: 1,
              hiragana: "ひゃく",
              romaji: "hya ku",
            },
            {
              _id: 2,
              hiragana: "じゅう",
              romaji: "jyuu",
            },
            {
              _id: 3,
              hiragana: "びょういん",
              romaji: "byou in",
            },
            {
              _id: 4,
              hiragana: "おちゃ",
              romaji: "o cha",
            },
            {
              _id: 5,
              hiragana: "りょこう",
              romaji: "ryo kou",
            },
          ],
          rows: [
            {
              _id: 1,
              hira: ["きゃ", "きゅ", "きょ"],
              romaji: ["Kya", "Kyu", "Kyo"],
            },
            {
              _id: 2,
              hira: ["しゃ", "しゅ", "しょ"],
              romaji: ["Sha", "Shu", "Sho"],
            },
            {
              _id: 3,
              hira: ["ちゃ", "ちゅ", "ちょ"],
              romaji: ["Cha", "Chu", "Cho"],
            },
            {
              _id: 4,
              hira: ["にゃ", "にゅ", "にょ"],
              romaji: ["Nya", "Nyu", "Nyo"],
            },
            {
              _id: 5,
              hira: ["ひゃ", "ひゅ", "ひょ"],
              romaji: ["Hya", "Hyu", "Hyo"],
            },
            {
              _id: 6,
              hira: ["みゃ", "みゅ", "みょ"],
              romaji: ["Mya", "Myu", "Myo"],
            },
            {
              _id: 7,
              hira: ["りゃ", "りゅ", "りょ"],
              romaji: ["Rya", "Ryu", "Ryo"],
            },
            {
              _id: 8,
              hira: ["ぎゃ", "ぎゅ", "ぎょ"],
              romaji: ["Gya", "Gyu", "Gyo"],
            },
            {
              _id: 9,
              hira: ["じゃ", "じゅ", "じょ"],
              romaji: ["Ja", "Ju", "Jo"],
            },
            {
              _id: 10,
              hira: ["びゃ", "びゅ", "びょ"],
              romaji: ["Bya", "Byu", "Byo"],
            },
            {
              _id: 11,
              hira: ["ぴゃ", "ぴゅ", "ぴょ"],
              romaji: ["Pya", "Pyu", "Pyo"],
            },
          ],
        },
      },
      {
        _id: 8,
        title: "Hatsuon「はつおん」",
        tag: "[ん・ン]အသံပေါင်းခြင်း",
        table: {
          example: [
            {
              _id: 1,
              hiragana: "うんどう",
              romaji: "un dou",
            },
            {
              _id: 2,
              hiragana: "せんろ",
              romaji: "sen ro",
            },
            {
              _id: 3,
              hiragana: "みんな",
              romaji: "min na",
            },
            {
              _id: 4,
              hiragana: "はんたい",
              romaji: "han tai",
            },
            {
              _id: 5,
              hiragana: "しんぶん",
              romaji: "shin bun",
            },
          ],
          rows: [
            {
              _id: 1,
              hira: ["みん", "りん", "いん"],
              romaji: ["min", "rin", "in"],
            },
            {
              _id: 2,
              hira: ["ヨン", "ゴン", "モン"],
              romaji: ["yon", "gon", "mon"],
            },
            {
              _id: 3,
              hira: ["シュン", "ミャン", "シャン"],
              romaji: ["shun", "myan", "shan"],
            },
          ],
        },
      },
      {
        _id: 9,
        title: "Sokuon「そくおん」",
        tag: "[っ・ッ]အသံပေါင်းခြင်း",
        content: [
          {
            _id: 1,
            title: "တူတဲ့ဗျည်း ၂ခုထပ်တဲ့အခါ  \n＊ [ -kk, -pp, -tt, -ss ]",
            tag: "ーっ",
            description:
              "にっき → ni kki \nいっぱい → i ppai \nおっと → o tto \nざっし → za sshi",
          },
        ],
      },
      {
        _id: 10,
        title: "Chouon「ちょうおん」",
        tag: "အသံရှည်/အသံစွဲ",
        content: [
          {
            _id: 1,
            title: "aa",
            tag: "ーぁ",
            description: "おかあさん → o kaa san",
          },
          {
            _id: 2,
            title: "ii",
            tag: "ーぃ",
            description: "おにいさん → o nii san",
          },
          {
            _id: 3,
            title: "ee",
            tag: "ーぇ",
            description: "おねえさん → o nee san",
          },
          {
            _id: 4,
            title: "o",
            tag: "ーぅ",
            description: "とおる → tou ru",
          },
          {
            _id: 5,
            title: "e",
            tag: "ーぃ",
            description: "へいや → hei ya",
          },
        ],
      },
      {
        _id: 11,
        title: "Accent & Intonation",
        tag: "အသံထွက်နှင့်အသံနေအသံထား",
        content: [
          {
            _id: 1,
            title: "Intonation",
            tag: "Normal →",
            description: "あした、ともだちと　おはなみをします。",
          },
          {
            _id: 2,
            title: "Intonation",
            tag: "Pitch \u2197",
            description: "ミラーさんも\u2197 いっしょに\u2197 いきませんか。",
          },
          {
            _id: 3,
            title: "Intonation",
            tag: "Pitch \u2198",
            description: "ああ\u2198、いいですね\u2198。",
          },
        ],
      },
    ],
  },
];
