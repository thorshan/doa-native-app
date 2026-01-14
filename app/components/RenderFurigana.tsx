import { WORD_OVERRIDES } from "@/constants/japaneseRules";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/* ================= TYPES ================= */

interface RelatedKanji {
  character: string;
  onyomi?: string[];
  kunyomi?: string[];
}

interface RenderFuriganaProps {
  text?: string;
  relatedKanji?: RelatedKanji[];
  textColor?: string;
  furiganaColor?: string;
}

/* ================= HELPERS ================= */

const isKanji = (ch: string) => /[\u4e00-\u9faf]/.test(ch);
const isKatakana = (ch: string) => /[\u30A0-\u30FF]/.test(ch);
const isNumber = (ch: string) => /[0-9０-９一二三四五六七八九十]/.test(ch);

const toHiragana = (str = "") =>
  str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );

const normalizeKunyomi = (str = "") =>
  str.replace(/-.+$/, "").replace(/[^\u3040-\u309F]/g, "");

/* ================= COMPONENT ================= */

const RenderFurigana: React.FC<RenderFuriganaProps> = ({
  text,
  relatedKanji,
  textColor = "#000",
  furiganaColor = "#3b82f6",
}) => {
  if (!text || !relatedKanji?.length) {
    return <Text style={{ color: textColor }}>{text}</Text>;
  }

  const elements: React.ReactNode[] = [];
  let remaining = text;

  const words = Object.keys(WORD_OVERRIDES).sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    let matched = false;

    const charIndex = text.length - remaining.length;
    const prevChar = text[charIndex - 1] || "";
    const nextChar = text[charIndex + 1] || "";

    /* ===== WORD OVERRIDES ===== */
    for (const word of words) {
      if (remaining.startsWith(word)) {
        const override = WORD_OVERRIDES[word];
        const reading = Array.isArray(override) ? override[0] : override;
        elements.push(
          <KanjiBlock
            key={elements.length}
            kanji={word}
            reading={reading}
            textColor={textColor}
            furiganaColor={furiganaColor}
          />
        );
        remaining = remaining.slice(word.length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    /* ===== SINGLE KANJI ===== */
    const kanjiMatch = relatedKanji.find((k) => k.character === remaining[0]);

    if (kanjiMatch) {
      let reading = "";

      if (kanjiMatch.character === "時" && isNumber(prevChar)) {
        reading = "じ";
      } else if (kanjiMatch.character === "分" && isNumber(prevChar)) {
        reading = ["1", "3", "4", "6", "8"].includes(prevChar)
          ? "ぷん"
          : "ふん";
      } else if (kanjiMatch.character === "人") {
        if (isNumber(prevChar)) {
          if (prevChar === "1") reading = "ひとり";
          else if (prevChar === "2") reading = "ふたり";
          else reading = "にん";
        } else if (isKanji(prevChar) || isKatakana(prevChar)) {
          reading = "じん";
        } else {
          reading = "ひと";
        }
      } else {
        const isCompound =
          (prevChar && isKanji(prevChar)) || (nextChar && isKanji(nextChar));

        reading = isCompound
          ? toHiragana(kanjiMatch.onyomi?.[0] || "")
          : normalizeKunyomi(kanjiMatch.kunyomi?.[0] || "");
      }

      if (!reading) {
        reading =
          normalizeKunyomi(kanjiMatch.kunyomi?.[0]) ||
          toHiragana(kanjiMatch.onyomi?.[0]) ||
          "";
      }

      elements.push(
        <KanjiBlock
          key={elements.length}
          kanji={kanjiMatch.character}
          reading={reading}
          textColor={textColor}
          furiganaColor={furiganaColor}
        />
      );

      remaining = remaining.slice(1);
      continue;
    }

    /* ===== NORMAL TEXT ===== */
    elements.push(
      <Text key={elements.length} style={{ color: textColor }}>
        {remaining[0]}
      </Text>
    );
    remaining = remaining.slice(1);
  }

  return <View style={styles.row}>{elements}</View>;
};

/* ================= KANJI BLOCK ================= */

const KanjiBlock = ({
  kanji,
  reading,
  textColor,
  furiganaColor,
}: {
  kanji: string;
  reading: string;
  textColor: string;
  furiganaColor: string;
}) => (
  <View style={styles.kanjiContainer}>
    <Text style={[styles.furigana, { color: furiganaColor }]}>{reading}</Text>
    <Text style={[styles.kanji, { color: textColor }]}>{kanji}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  kanjiContainer: {
    alignItems: "center",
    marginHorizontal: 1,
  },
  furigana: {
    fontSize: 10,
    lineHeight: 12,
  },
  kanji: {
    fontSize: 16,
    lineHeight: 20,
  },
});

export default RenderFurigana;
