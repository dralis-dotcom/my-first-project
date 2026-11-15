import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AbstractImage, Face, PlayingCard } from '../../components/Art';
import { Answers, Content } from '../../engine';
import { colors, fonts } from '../../theme';
import { s as ms } from './MemorizeViews';

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function Chars({ expected, given }: { expected: string; given: string }) {
  return (
    <Text style={v.mono}>
      {expected.split('').map((ch, i) => {
        const g = given[i];
        const color = g === undefined ? colors.faint : g === ch ? colors.success : colors.danger;
        return (
          <Text key={i} style={{ color }}>
            {g === undefined ? '·' : g}
          </Text>
        );
      })}
    </Text>
  );
}

function Pair({ label, expected, given }: { label?: string; expected: string; given: string }) {
  const ok = same(expected, given);
  return (
    <View style={v.pair}>
      {label ? <Text style={ms.rowNo}>{label}</Text> : null}
      <Text style={v.expected}>{expected}</Text>
      <Text style={[v.given, { color: !given.trim() ? colors.faint : ok ? colors.success : colors.danger }]}>
        {given.trim() ? given : '—'}
      </Text>
    </View>
  );
}

/** Shows the right answer next to what the user gave, for every kind of session. */
export function ReviewView({ content, answers }: { content: Content; answers: Answers }) {
  switch (content.kind) {
    case 'digits':
    case 'binary':
      return (
        <View>
          {content.rows.map((row, i) => (
            <View key={i} style={v.block}>
              <Text style={ms.rowNo}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[v.mono, { color: colors.textSoft }]}>{row}</Text>
                <Chars expected={row} given={answers.rows?.[i] ?? ''} />
              </View>
            </View>
          ))}
        </View>
      );
    case 'spoken':
      return (
        <View style={v.block}>
          <View style={{ flex: 1 }}>
            <Text style={[v.mono, { color: colors.textSoft }]}>{content.digits}</Text>
            <Chars expected={content.digits} given={(answers.text ?? '').replace(/\D/g, '')} />
          </View>
        </View>
      );
    case 'words':
      return (
        <View>
          {content.words.map((w, i) => (
            <Pair key={i} label={`${i + 1}`} expected={w} given={answers.words?.[i] ?? ''} />
          ))}
        </View>
      );
    case 'names':
      return (
        <View>
          {content.people.map((p, i) => (
            <View key={i} style={[v.block, { alignItems: 'center', gap: 12 }]}>
              <Face photo={p.photo} size={56} />
              <View style={{ flex: 1 }}>
                <Pair expected={p.first} given={answers.names?.[i]?.first ?? ''} />
                <Pair expected={p.last} given={answers.names?.[i]?.last ?? ''} />
              </View>
            </View>
          ))}
        </View>
      );
    case 'dates':
      return (
        <View>
          {content.events.map((e, i) => (
            <View key={i} style={v.block}>
              <View style={{ flex: 1 }}>
                <Text style={[ms.eventText, { fontSize: 14 }]}>{e.text}</Text>
                <Pair expected={e.year} given={answers.years?.[i] ?? ''} />
              </View>
            </View>
          ))}
        </View>
      );
    case 'images':
      return (
        <View>
          {content.rows.map((row, i) => {
            const g = answers.imageOrder?.[i] ?? [];
            const ok = g.length === row.length && g.every((x, k) => x === row[k]);
            return (
              <View key={i} style={[v.block, { alignItems: 'center' }]}>
                <Text style={ms.rowNo}>{i + 1}</Text>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 5 }}>
                    {row.map((seed) => (
                      <AbstractImage key={seed} seed={seed} size={44} />
                    ))}
                  </View>
                  <Text
                    style={{
                      color: g.length === 0 ? colors.faint : ok ? colors.success : colors.danger,
                      fontSize: 13,
                      fontWeight: '700',
                    }}
                  >
                    {g.length === 0 ? 'Left empty' : ok ? 'Correct order' : 'Wrong order'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      );
    case 'cards':
      return (
        <View>
          {content.decks.map((deck, d) => (
            <View key={d} style={{ marginBottom: 18 }}>
              {content.decks.length > 1 ? <Text style={ms.columnLabel}>Deck {d + 1}</Text> : null}
              <View style={[ms.cardGrid, { gap: 5, rowGap: 5 }]}>
                {deck.map((c, i) => {
                  const g = answers.decks?.[d]?.[i];
                  return (
                    <PlayingCard
                      key={c.id}
                      card={c}
                      width={36}
                      dim={g === undefined}
                      highlight={g === undefined ? undefined : g === c.id ? 'good' : 'bad'}
                    />
                  );
                })}
              </View>
            </View>
          ))}
          <Text style={ms.hint}>Green border: right place. Red: wrong card there. Faded: not reached.</Text>
        </View>
      );
    default:
      return null;
  }
}

const v = StyleSheet.create({
  block: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  mono: { fontFamily: fonts.mono, fontSize: 13.5, letterSpacing: 1, lineHeight: 21 },
  pair: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 8 },
  expected: { color: colors.text, fontSize: 15, flex: 1 },
  given: { fontSize: 15, flex: 1, textAlign: 'right' },
});
