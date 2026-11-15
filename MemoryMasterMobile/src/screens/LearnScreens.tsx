import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LESSONS } from '../data/lessons';
import { useStore } from '../store';
import { colors, fonts, radius } from '../theme';
import {
  Body,
  Button,
  Card,
  Eyebrow,
  Heading,
  IconBadge,
  Muted,
  ProgressBar,
  Row,
  Screen,
  Title,
  TopBar,
} from '../ui';

/** Learn tab: the step-by-step course. */
export function LearnScreen({ navigation }: any) {
  const { state } = useStore();
  const done = state.lessonsDone;
  const firstOpen = LESSONS.findIndex((l) => !done.includes(l.id));

  return (
    <Screen>
      <Eyebrow style={{ marginTop: 14 }}>Step by step</Eyebrow>
      <Title style={{ marginTop: 6 }}>Memory course</Title>
      <Body style={{ marginTop: 8 }}>
        Ten short lessons. Each one teaches a single idea and ends with a small practice. No
        experience needed.
      </Body>
      <Row style={{ gap: 12, marginTop: 16, marginBottom: 22 }}>
        <ProgressBar value={done.length / LESSONS.length} style={{ flex: 1 }} />
        <Muted>
          {done.length}/{LESSONS.length}
        </Muted>
      </Row>

      <View>
        {LESSONS.map((l, i) => {
          const isDone = done.includes(l.id);
          const locked = !isDone && firstOpen !== -1 && i > firstOpen;
          const current = i === firstOpen;
          return (
            <View key={l.id} style={{ flexDirection: 'row', gap: 14 }}>
              {/* the path line */}
              <View style={{ alignItems: 'center', width: 34 }}>
                <View style={[s.node, isDone && s.nodeDone, current && s.nodeCurrent]}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={16} color={colors.bg} />
                  ) : locked ? (
                    <Ionicons name="lock-closed" size={13} color={colors.faint} />
                  ) : (
                    <Text style={s.nodeText}>{i + 1}</Text>
                  )}
                </View>
                {i < LESSONS.length - 1 ? <View style={[s.line, isDone && { backgroundColor: colors.goldDeep }]} /> : null}
              </View>
              <Card
                style={[{ flex: 1, marginBottom: 12 }, locked && { opacity: 0.45 }]}
                tone={current ? 'gold' : 'default'}
                onPress={locked ? undefined : () => navigation.navigate('Lesson', { id: l.id })}
              >
                <Text style={s.lessonTitle}>{l.title}</Text>
                <Muted>{l.subtitle}</Muted>
                <Row style={{ gap: 6, marginTop: 10 }}>
                  <Ionicons name="time-outline" size={13} color={colors.faint} />
                  <Text style={s.meta}>{l.minutes} min</Text>
                  {l.practice ? <Text style={s.meta}>· practice included</Text> : null}
                </Row>
              </Card>
            </View>
          );
        })}
      </View>

      <Heading style={{ marginTop: 18, marginBottom: 12 }}>Your tools</Heading>
      <Card onPress={() => navigation.navigate('Palaces')}>
        <Row style={{ gap: 14 }}>
          <IconBadge name="business" tone="violet" />
          <View style={{ flex: 1 }}>
            <Text style={s.lessonTitle}>My Memory Palaces</Text>
            <Muted>Save the places and stops you use for storing pictures.</Muted>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Row>
      </Card>
    </Screen>
  );
}

/** One lesson, shown page by page. */
export function LessonScreen({ navigation, route }: any) {
  const lesson = LESSONS.find((l) => l.id === route.params.id)!;
  const index = LESSONS.indexOf(lesson);
  const { completeLesson } = useStore();
  const [page, setPage] = useState(0);
  const p = lesson.pages[page];
  const last = page === lesson.pages.length - 1;

  const finish = () => {
    if (lesson.practice) {
      const pr = lesson.practice;
      navigation.replace('Session', {
        config: {
          disciplineId: pr.disciplineId,
          levelKey: 'lesson',
          kind: pr.kind,
          title: pr.label,
          amount: pr.amount,
          memSec: pr.memSec,
          recallSec: pr.recallSec,
          lessonId: lesson.id,
          simple: true,
        },
      });
    } else {
      completeLesson(lesson.id);
      navigation.goBack();
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar onBack={() => navigation.goBack()} title={`Lesson ${index + 1}`} />
      <Row style={{ gap: 5, marginBottom: 22 }}>
        {lesson.pages.map((_, i) => (
          <View key={i} style={[s.dot, i <= page && { backgroundColor: colors.gold }]} />
        ))}
      </Row>

      {page === 0 ? <Eyebrow style={{ marginBottom: 8 }}>{lesson.title}</Eyebrow> : null}
      <Title style={{ fontSize: 26, lineHeight: 33 }}>{p.heading}</Title>
      <Body style={{ marginTop: 14, fontSize: 16.5, lineHeight: 26 }}>{p.body}</Body>

      {p.table ? (
        <View style={s.table}>
          {p.table.map(([a, b], i) => (
            <View key={i} style={[s.tr, i === p.table!.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.tdKey}>{a}</Text>
              <Text style={s.tdVal}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {p.example ? (
        <View style={s.example}>
          <Text style={s.exampleLabel}>PICTURE THIS</Text>
          <Text style={s.exampleText}>{p.example}</Text>
        </View>
      ) : null}

      {last && lesson.practice ? (
        <Card tone="gold" style={{ marginTop: 22 }}>
          <Row style={{ gap: 10 }}>
            <Ionicons name="barbell" size={18} color={colors.gold} />
            <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{lesson.practice.intro}</Text>
          </Row>
        </Card>
      ) : null}

      <Row style={{ gap: 10, marginTop: 28 }}>
        {page > 0 ? (
          <Button label="Back" variant="ghost" style={{ flex: 1 }} onPress={() => setPage(page - 1)} />
        ) : null}
        <Button
          label={last ? (lesson.practice ? lesson.practice.label : 'Finish lesson') : 'Next'}
          icon={last ? 'play' : 'arrow-forward'}
          style={{ flex: 2 }}
          onPress={last ? finish : () => setPage(page + 1)}
        />
      </Row>
    </Screen>
  );
}

/** A simple notebook for memory palaces: a name and an ordered list of stops. */
export function PalacesScreen({ navigation }: any) {
  const { state, update } = useStore();
  const [name, setName] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [stop, setStop] = useState('');

  const addPalace = () => {
    if (!name.trim()) return;
    const id = `${Date.now()}`;
    update((st) => ({ palaces: [...st.palaces, { id, name: name.trim(), stations: [] }] }));
    setName('');
    setOpen(id);
  };
  const addStop = (id: string) => {
    if (!stop.trim()) return;
    update((st) => ({
      palaces: st.palaces.map((p) => (p.id === id ? { ...p, stations: [...p.stations, stop.trim()] } : p)),
    }));
    setStop('');
  };
  const removeStop = (id: string, i: number) =>
    update((st) => ({
      palaces: st.palaces.map((p) =>
        p.id === id ? { ...p, stations: p.stations.filter((_, k) => k !== i) } : p,
      ),
    }));
  const removePalace = (id: string) => update((st) => ({ palaces: st.palaces.filter((p) => p.id !== id) }));

  return (
    <Screen>
      <TopBar onBack={() => navigation.goBack()} title="My Memory Palaces" />
      <Body style={{ marginBottom: 16 }}>
        A palace is a place you know well. Write its stops in the order you walk past them. Use the
        same order every time.
      </Body>

      <Row style={{ gap: 10, marginBottom: 20 }}>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="New palace, e.g. My home"
          placeholderTextColor={colors.faint}
          onSubmitEditing={addPalace}
        />
        <Button label="Add" small onPress={addPalace} disabled={!name.trim()} />
      </Row>

      {state.palaces.length === 0 ? (
        <Card>
          <Muted>No palaces yet. Start with your home: front door, hallway, sofa, kitchen…</Muted>
        </Card>
      ) : null}

      <View style={{ gap: 12 }}>
        {state.palaces.map((p) => {
          const isOpen = open === p.id;
          return (
            <Card key={p.id}>
              <Pressable onPress={() => setOpen(isOpen ? null : p.id)}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View>
                    <Text style={s.lessonTitle}>{p.name}</Text>
                    <Muted>
                      {p.stations.length} {p.stations.length === 1 ? 'stop' : 'stops'}
                    </Muted>
                  </View>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
                </Row>
              </Pressable>
              {isOpen ? (
                <View style={{ marginTop: 12 }}>
                  {p.stations.map((st, i) => (
                    <Row key={i} style={s.stop}>
                      <Text style={s.stopNo}>{i + 1}</Text>
                      <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{st}</Text>
                      <Pressable onPress={() => removeStop(p.id, i)} hitSlop={10}>
                        <Ionicons name="close" size={18} color={colors.faint} />
                      </Pressable>
                    </Row>
                  ))}
                  <Row style={{ gap: 10, marginTop: 12 }}>
                    <TextInput
                      style={s.input}
                      value={stop}
                      onChangeText={setStop}
                      placeholder={`Stop ${p.stations.length + 1}`}
                      placeholderTextColor={colors.faint}
                      onSubmitEditing={() => addStop(p.id)}
                      blurOnSubmit={false}
                    />
                    <Button label="Add" small variant="ghost" onPress={() => addStop(p.id)} disabled={!stop.trim()} />
                  </Row>
                  <Pressable onPress={() => removePalace(p.id)} style={{ marginTop: 16 }}>
                    <Text style={{ color: colors.danger, fontSize: 13.5, fontWeight: '600' }}>Delete this palace</Text>
                  </Pressable>
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  node: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  nodeCurrent: { borderColor: colors.gold, borderWidth: 2 },
  nodeText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  lessonTitle: { color: colors.text, fontSize: 16.5, fontWeight: '700', marginBottom: 3 },
  meta: { color: colors.faint, fontSize: 12 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surface2 },
  table: {
    marginTop: 18,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  tr: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  tdKey: { color: colors.gold, fontWeight: '800', fontSize: 15, minWidth: 64, fontFamily: fonts.mono },
  tdVal: { color: colors.textSoft, fontSize: 15, lineHeight: 21, flex: 1 },
  example: {
    marginTop: 18,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.violetSoft,
    borderWidth: 1,
    borderColor: '#3A3470',
  },
  exampleLabel: { color: colors.violet, fontSize: 10.5, letterSpacing: 2, fontWeight: '800', marginBottom: 6 },
  exampleText: { color: colors.text, fontSize: 16, lineHeight: 25, fontFamily: fonts.serif },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 15.5,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  stop: { gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  stopNo: { color: colors.gold, fontFamily: fonts.mono, fontWeight: '700', width: 22 },
});
