import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DISCIPLINES } from '../data/disciplines';
import { LESSONS } from '../data/lessons';
import { currentStreak, dayKey, isDue, useStore } from '../store';
import { colors, fonts, radius } from '../theme';
import { Body, Button, Card, Eyebrow, Heading, IconBadge, Muted, ProgressBar, Row, Screen, Title } from '../ui';
import { startLevel } from './DisciplineScreen';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function HomeScreen({ navigation }: any) {
  const { state } = useStore();
  const streak = currentStreak(state.activeDays);
  const doneCount = state.lessonsDone.length;
  const nextLesson = LESSONS.find((l) => !state.lessonsDone.includes(l.id));
  const dueCount = state.mnemonics.filter(isDue).length;
  const trainedToday = state.activeDays.includes(dayKey());

  // A different event every day for the quick workout.
  const dayNumber = Math.floor(Date.now() / 86400000);
  const daily = DISCIPLINES[dayNumber % DISCIPLINES.length];

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: 'SMTWTFS'[d.getDay()], on: state.activeDays.includes(dayKey(d)), today: i === 6 };
  });

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
        <View>
          <Eyebrow>{greeting()}</Eyebrow>
          <Title style={{ marginTop: 6 }}>Train your memory</Title>
        </View>
        <View style={s.streak}>
          <Ionicons name="flame" size={18} color={streak > 0 ? colors.gold : colors.faint} />
          <Text style={s.streakText}>{streak}</Text>
        </View>
      </Row>

      {/* Hero: the next step of the course */}
      <LinearGradient colors={['#2A2110', '#15120B', '#0D111B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <Eyebrow>{nextLesson ? `Your course · lesson ${doneCount + 1} of ${LESSONS.length}` : 'Course complete'}</Eyebrow>
        <Text style={s.heroTitle}>{nextLesson ? nextLesson.title : 'You know every technique'}</Text>
        <Body style={{ marginTop: 6 }}>
          {nextLesson ? nextLesson.subtitle : 'Keep your skills sharp with the ten championship events.'}
        </Body>
        <ProgressBar value={doneCount / LESSONS.length} style={{ marginTop: 16 }} />
        <Button
          label={nextLesson ? (doneCount === 0 ? 'Start the course' : 'Continue') : 'Go to training'}
          icon="play"
          style={{ marginTop: 18 }}
          onPress={() =>
            nextLesson ? navigation.navigate('Lesson', { id: nextLesson.id }) : navigation.navigate('Train')
          }
        />
      </LinearGradient>

      {dueCount > 0 ? (
        <Card tone="gold" style={{ marginTop: 16 }} onPress={() => navigation.navigate('Medicine')}>
          <Row style={{ gap: 14 }}>
            <IconBadge name="alarm" />
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>
                {dueCount} {dueCount === 1 ? 'review is' : 'reviews are'} due today
              </Text>
              <Muted>Open your mnemonics and review them before they fade.</Muted>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Row>
        </Card>
      ) : null}

      {/* Week strip */}
      <Card style={{ marginTop: 16 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading style={{ fontSize: 17 }}>This week</Heading>
          <Muted>{trainedToday ? 'Done for today ✓' : 'Not trained yet today'}</Muted>
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
          {week.map((d, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 6 }}>
              <View style={[s.day, d.on && s.dayOn, d.today && !d.on && s.dayToday]}>
                {d.on ? <Ionicons name="checkmark" size={15} color={colors.bg} /> : null}
              </View>
              <Text style={{ color: d.today ? colors.text : colors.faint, fontSize: 11, fontWeight: '700' }}>
                {d.label}
              </Text>
            </View>
          ))}
        </Row>
      </Card>

      {/* Daily workout */}
      <Heading style={s.section}>Today's 2-minute workout</Heading>
      <Card onPress={() => navigation.navigate('Session', { config: startLevel(daily, 'starter') })}>
        <Row style={{ gap: 14 }}>
          <IconBadge name={daily.icon} />
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{daily.name}</Text>
            <Muted>{daily.tagline}</Muted>
          </View>
          <Ionicons name="play-circle" size={34} color={colors.gold} />
        </Row>
      </Card>

      {/* Championship events */}
      <Row style={{ justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
        <Heading>Championship events</Heading>
        <Text style={s.link} onPress={() => navigation.navigate('Train')}>
          See all
        </Text>
      </Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {DISCIPLINES.map((d) => (
          <Card key={d.id} style={s.eventCard} onPress={() => navigation.navigate('Discipline', { id: d.id })}>
            <IconBadge name={d.icon} size={40} />
            <Text style={[s.cardTitle, { marginTop: 14 }]}>{d.name}</Text>
            <Muted style={{ marginTop: 4 }}>{d.tagline}</Muted>
          </Card>
        ))}
      </ScrollView>

      {/* Medicine */}
      <Heading style={s.section}>For medical study</Heading>
      <Card tone="raised" onPress={() => navigation.navigate('Medicine')}>
        <Row style={{ gap: 14 }}>
          <IconBadge name="medkit" tone="violet" />
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>AI mnemonic maker</Text>
            <Muted>Type any topic. Get a mnemonic, a story, and what every image means.</Muted>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Row>
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  hero: {
    marginTop: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#4A3B1C',
    padding: 20,
  },
  heroTitle: { color: colors.text, fontFamily: fonts.serif, fontSize: 25, lineHeight: 31, fontWeight: '600', marginTop: 10 },
  day: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: colors.gold },
  dayToday: { borderWidth: 1.5, borderColor: colors.gold },
  section: { marginTop: 28, marginBottom: 12 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  link: { color: colors.gold, fontWeight: '700', fontSize: 14 },
  eventCard: { width: 168, minHeight: 168 },
});
