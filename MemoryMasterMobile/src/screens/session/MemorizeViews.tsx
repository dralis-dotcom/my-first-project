import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AbstractImage, Face, PlayingCard } from '../../components/Art';
import { Content, grouped, WORD_COLUMN } from '../../engine';
import { colors, fonts, radius } from '../../theme';

export function DeckPager({
  index,
  count,
  onChange,
}: {
  index: number;
  count: number;
  onChange: (i: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <View style={s.pager}>
      <Pressable onPress={() => onChange(Math.max(0, index - 1))} hitSlop={10} disabled={index === 0}>
        <Ionicons name="chevron-back-circle" size={30} color={index === 0 ? colors.faint : colors.gold} />
      </Pressable>
      <Text style={s.pagerText}>
        Deck {index + 1} of {count}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(count - 1, index + 1))}
        hitSlop={10}
        disabled={index === count - 1}
      >
        <Ionicons
          name="chevron-forward-circle"
          size={30}
          color={index === count - 1 ? colors.faint : colors.gold}
        />
      </Pressable>
    </View>
  );
}

export function MemorizeView({ content, digitGroup }: { content: Content; digitGroup: number }) {
  const [deck, setDeck] = useState(0);

  switch (content.kind) {
    case 'digits':
    case 'binary': {
      const group = content.kind === 'binary' ? 3 : digitGroup;
      return (
        <View>
          {content.rows.map((row, i) => (
            <View key={i} style={s.digitRow}>
              <Text style={s.rowNo}>{i + 1}</Text>
              <Text style={[s.digits, content.kind === 'binary' && { fontSize: 12.5 }]}>
                {grouped(row, group)}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    case 'words':
      return (
        <View>
          {content.words.map((w, i) => (
            <View key={i}>
              {i % WORD_COLUMN === 0 && content.words.length > WORD_COLUMN ? (
                <Text style={s.columnLabel}>Column {i / WORD_COLUMN + 1}</Text>
              ) : null}
              <View style={s.wordRow}>
                <Text style={s.rowNo}>{i + 1}</Text>
                <Text style={s.word}>{w}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    case 'names':
      return (
        <View style={s.grid}>
          {content.people.map((p, i) => (
            <View key={i} style={s.person}>
              <Face photo={p.photo} size={104} />
              <Text style={s.first}>{p.first}</Text>
              <Text style={s.last}>{p.last}</Text>
            </View>
          ))}
        </View>
      );
    case 'dates':
      return (
        <View>
          {content.events.map((e, i) => (
            <View key={i} style={s.dateRow}>
              <Text style={s.year}>{e.year}</Text>
              <Text style={s.eventText}>{e.text}</Text>
            </View>
          ))}
        </View>
      );
    case 'images':
      return (
        <View>
          {content.rows.map((row, i) => (
            <View key={i} style={s.imageRow}>
              <Text style={s.rowNo}>{i + 1}</Text>
              <View style={s.imageStrip}>
                {row.map((seed) => (
                  <AbstractImage key={seed} seed={seed} size={52} />
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    case 'cards': {
      const cards = content.decks[deck];
      return (
        <View>
          <DeckPager index={deck} count={content.decks.length} onChange={setDeck} />
          <Text style={s.hint}>Read from left to right, top to bottom.</Text>
          <View style={s.cardGrid}>
            {cards.map((c, i) => (
              <View key={c.id} style={{ alignItems: 'center' }}>
                <PlayingCard card={c} width={40} />
                <Text style={s.cardNo}>{i + 1}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    default:
      return null;
  }
}

export const s = StyleSheet.create({
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pagerText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  digitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowNo: { width: 30, color: colors.faint, fontSize: 12, fontFamily: fonts.mono },
  digits: { color: colors.text, fontFamily: fonts.mono, fontSize: 16.5, letterSpacing: 0.5, flex: 1 },
  columnLabel: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 6,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  word: { color: colors.text, fontSize: 19, fontFamily: fonts.serif },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  person: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 16,
  },
  first: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 10 },
  last: { color: colors.gold, fontSize: 15, marginTop: 2 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  year: { color: colors.gold, fontFamily: fonts.mono, fontSize: 18, fontWeight: '700', width: 56 },
  eventText: { color: colors.text, fontSize: 15.5, lineHeight: 21, flex: 1 },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  imageStrip: { flexDirection: 'row', gap: 6, flex: 1 },
  hint: { color: colors.muted, fontSize: 13, marginBottom: 12 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, rowGap: 8 },
  cardNo: { color: colors.faint, fontSize: 9.5, marginTop: 2 },
});
