import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AbstractImage, Face, PlayingCard } from '../../components/Art';
import { Answers, Content, FULL_DECK, WORD_COLUMN } from '../../engine';
import { colors, fonts, radius } from '../../theme';
import { DeckPager, s as ms } from './MemorizeViews';

const deckOrder = new Map(FULL_DECK.map((c, i) => [c.id, i]));

export function RecallView({
  content,
  answers,
  setAnswers,
}: {
  content: Content;
  answers: Answers;
  setAnswers: (fn: (a: Answers) => Answers) => void;
}) {
  const [deck, setDeck] = useState(0);

  switch (content.kind) {
    case 'digits':
    case 'binary': {
      const allowed = content.kind === 'binary' ? /[^01]/g : /\D/g;
      return (
        <View>
          {content.rows.map((row, i) => (
            <View key={i} style={r.inputRow}>
              <Text style={ms.rowNo}>{i + 1}</Text>
              <TextInput
                style={[r.input, r.mono, content.kind === 'binary' && { fontSize: 13, letterSpacing: 1 }]}
                value={answers.rows?.[i] ?? ''}
                onChangeText={(t) =>
                  setAnswers((a) => {
                    const rows = (a.rows ?? content.rows.map(() => '')).slice();
                    rows[i] = t.replace(allowed, '').slice(0, row.length);
                    return { ...a, rows };
                  })
                }
                keyboardType="number-pad"
                maxLength={row.length}
                placeholder={`${row.length} digits`}
                placeholderTextColor={colors.faint}
              />
            </View>
          ))}
        </View>
      );
    }
    case 'spoken':
      return (
        <View>
          <Text style={ms.hint}>Type the digits in the order you heard them.</Text>
          <TextInput
            style={[r.input, r.mono, { minHeight: 150, textAlignVertical: 'top', fontSize: 20 }]}
            value={answers.text ?? ''}
            onChangeText={(t) => setAnswers((a) => ({ ...a, text: t.replace(/\D/g, '') }))}
            keyboardType="number-pad"
            multiline
            autoFocus
            placeholder="Start typing…"
            placeholderTextColor={colors.faint}
          />
        </View>
      );
    case 'words':
      return (
        <View>
          {content.words.map((_, i) => (
            <View key={i}>
              {i % WORD_COLUMN === 0 && content.words.length > WORD_COLUMN ? (
                <Text style={ms.columnLabel}>Column {i / WORD_COLUMN + 1}</Text>
              ) : null}
              <View style={r.inputRow}>
                <Text style={ms.rowNo}>{i + 1}</Text>
                <TextInput
                  style={r.input}
                  value={answers.words?.[i] ?? ''}
                  onChangeText={(t) =>
                    setAnswers((a) => {
                      const words = (a.words ?? content.words.map(() => '')).slice();
                      words[i] = t;
                      return { ...a, words };
                    })
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="word"
                  placeholderTextColor={colors.faint}
                />
              </View>
            </View>
          ))}
        </View>
      );
    case 'names': {
      const setName = (i: number, field: 'first' | 'last', t: string) =>
        setAnswers((a) => {
          const names = (a.names ?? content.people.map(() => ({ first: '', last: '' }))).slice();
          names[i] = { ...names[i], [field]: t };
          return { ...a, names };
        });
      return (
        <View>
          {content.recallOrder.map((i) => (
            <View key={i} style={r.nameRow}>
              <Face photo={content.people[i].photo} size={84} />
              <View style={{ flex: 1, gap: 8 }}>
                <TextInput
                  style={r.input}
                  value={answers.names?.[i]?.first ?? ''}
                  onChangeText={(t) => setName(i, 'first', t)}
                  autoCorrect={false}
                  placeholder="First name"
                  placeholderTextColor={colors.faint}
                />
                <TextInput
                  style={r.input}
                  value={answers.names?.[i]?.last ?? ''}
                  onChangeText={(t) => setName(i, 'last', t)}
                  autoCorrect={false}
                  placeholder="Family name"
                  placeholderTextColor={colors.faint}
                />
              </View>
            </View>
          ))}
        </View>
      );
    }
    case 'dates':
      return (
        <View>
          {content.recallOrder.map((i) => (
            <View key={i} style={r.dateRow}>
              <TextInput
                style={[r.input, r.mono, { width: 84, flex: 0, textAlign: 'center' }]}
                value={answers.years?.[i] ?? ''}
                onChangeText={(t) =>
                  setAnswers((a) => {
                    const years = (a.years ?? content.events.map(() => '')).slice();
                    years[i] = t.replace(/\D/g, '').slice(0, 4);
                    return { ...a, years };
                  })
                }
                keyboardType="number-pad"
                maxLength={4}
                placeholder="year"
                placeholderTextColor={colors.faint}
              />
              <Text style={ms.eventText}>{content.events[i].text}</Text>
            </View>
          ))}
        </View>
      );
    case 'images':
      return (
        <View>
          <Text style={ms.hint}>Tap the shapes in each row in their original order.</Text>
          {content.shuffled.map((row, i) => {
            const picked = answers.imageOrder?.[i] ?? [];
            const setRow = (next: number[]) =>
              setAnswers((a) => {
                const imageOrder = (a.imageOrder ?? content.rows.map(() => [])).slice();
                imageOrder[i] = next;
                return { ...a, imageOrder };
              });
            return (
              <View key={i} style={ms.imageRow}>
                <Text style={ms.rowNo}>{i + 1}</Text>
                <View style={ms.imageStrip}>
                  {row.map((seed) => {
                    const pos = picked.indexOf(seed);
                    return (
                      <Pressable
                        key={seed}
                        onPress={() =>
                          setRow(pos >= 0 ? picked.filter((x) => x !== seed) : [...picked, seed])
                        }
                      >
                        <AbstractImage seed={seed} size={50} />
                        {pos >= 0 ? (
                          <View style={r.badge}>
                            <Text style={r.badgeText}>{pos + 1}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      );
    case 'cards': {
      const cards = content.decks[deck];
      const picked = answers.decks?.[deck] ?? [];
      const setDeckAnswer = (next: string[]) =>
        setAnswers((a) => {
          const decks = (a.decks ?? content.decks.map(() => [])).slice();
          decks[deck] = next;
          return { ...a, decks };
        });
      const sorted = cards.slice().sort((a, b) => deckOrder.get(a.id)! - deckOrder.get(b.id)!);
      return (
        <View>
          <DeckPager index={deck} count={content.decks.length} onChange={setDeck} />
          <View style={r.tray}>
            <View style={r.trayHead}>
              <Text style={r.trayTitle}>
                Your order · {picked.length}/{cards.length}
              </Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Pressable onPress={() => setDeckAnswer(picked.slice(0, -1))} hitSlop={8}>
                  <Text style={r.link}>Undo</Text>
                </Pressable>
                <Pressable onPress={() => setDeckAnswer([])} hitSlop={8}>
                  <Text style={r.link}>Clear</Text>
                </Pressable>
              </View>
            </View>
            {picked.length === 0 ? (
              <Text style={ms.hint}>Tap the cards below in the order you memorised them.</Text>
            ) : (
              <View style={[ms.cardGrid, { gap: 4, rowGap: 4 }]}>
                {picked.map((id) => {
                  const c = cards.find((x) => x.id === id)!;
                  return <PlayingCard key={id} card={c} width={30} />;
                })}
              </View>
            )}
          </View>
          <View style={[ms.cardGrid, { marginTop: 16 }]}>
            {sorted.map((c) => {
              const used = picked.includes(c.id);
              return (
                <Pressable key={c.id} disabled={used} onPress={() => setDeckAnswer([...picked, c.id])}>
                  <PlayingCard card={c} width={40} dim={used} />
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }
    default:
      return null;
  }
}

const r = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mono: { fontFamily: fonts.mono, letterSpacing: 2 },
  nameRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
  },
  dateRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.bg, fontWeight: '800', fontSize: 12 },
  tray: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    minHeight: 86,
  },
  trayHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  trayTitle: { color: colors.text, fontWeight: '700', fontSize: 13.5 },
  link: { color: colors.gold, fontWeight: '700', fontSize: 13.5 },
});
