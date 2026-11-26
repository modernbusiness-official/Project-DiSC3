//============================================================
//  Project DiSC3 — 90 Day Self-Discovery Challenge
//  Single-file Expo app (Web + iPhone + Android)
//  Paste this whole file into App.js on https://snack.expo.dev
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

/* ---------------------------- CONFIG ---------------------------- */
const TOTAL_DAYS = 90;
const DEFAULT_START = '2026-11-27'; // Day 1
const STORAGE_KEY = 'project_disc3_v1';

// Anonymous account is tied to this browser/device session. Keep website data intact for recovery.
// Use a freshly rotated Supabase Publishable key here.
// Never put a Supabase secret/service_role key in this app.
const SUPABASE_URL = 'https://vhcljozbpbidtebxxcre.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_0Gp6QpvkWHWCAE3_8Zq-BQ_wM5Zuy5K';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
const STREAK_MIN = 1; // 1 = saari habits complete hon tab hi streak count hoga (0.8 = 80%)

const C = {
  bg: '#050A0E',
  card: '#0D161B',
  card2: '#101C22',
  border: '#1E2D35',
  lime: '#B5F23D',
  limeDark: '#0A1200',
  teal: '#19B7A0',
  text: '#FFFFFF',
  muted: '#8CA0AA',
  orange: '#F5A524',
  track: '#25343C',
  danger: '#FF6B6B',
};

const PILLARS = [
  {
    id: 'discipline',
    letter: 'D',
    name: 'Discipline',
    color: '#B5F23D',
    fg: '#0A1200',
    habits: [
      { id: 'wake', label: 'Wake up on time' },
      { id: 'job', label: 'Job responsibility' },
      { id: 'gym', label: 'Gym / Recovery' },
      { id: 'sugar', label: 'No added sugar' },
      { id: 'nosex', label: 'No sex commitment' },
    ],
  },
  {
    id: 'consistency',
    letter: 'C',
    name: 'Consistency',
    color: '#F5A524',
    fg: '#1A1000',
    habits: [
      { id: 'raaj', label: 'Raajverse progress' },
      { id: 'roadies', label: 'Roadies preparation' },
    ],
  },
  {
    id: 'confidence',
    letter: 'C',
    name: 'Confidence',
    color: '#F5A524',
    fg: '#1A1000',
    habits: [{ id: 'conf', label: 'Confidence practice' }],
  },
  {
    id: 'self',
    letter: 'S',
    name: 'Self-awareness',
    color: '#8BD84A',
    fg: '#0A1200',
    habits: [{ id: 'selfaw', label: 'Self-awareness' }],
  },
  {
    id: 'courage',
    letter: 'C',
    name: 'Courage',
    color: '#F5A524',
    fg: '#1A1000',
    habits: [{ id: 'courage1', label: 'One courageous action' }],
  },
];
const TOTAL_HABITS = PILLARS.reduce((n, p) => n + p.habits.length, 0); // 11

const DEFAULT_SCHEDULE = [
  {
    id: 's1',
    time: '05:30',
    label: 'Wake up',
    icon: 'sunny-outline',
    on: true,
  },
  {
    id: 's2',
    time: '06:00',
    label: 'Get ready',
    icon: 'shirt-outline',
    on: true,
  },
  {
    id: 's3',
    time: '07:00',
    label: 'Work / Commute',
    icon: 'briefcase-outline',
    on: true,
  },
  {
    id: 's4',
    time: '16:00',
    label: 'Reach home',
    icon: 'home-outline',
    on: true,
  },
  {
    id: 's5',
    time: '17:00',
    label: 'Gym / Recovery',
    icon: 'barbell-outline',
    on: true,
  },
  {
    id: 's6',
    time: '18:30',
    label: 'Dinner & Freshen up',
    icon: 'restaurant-outline',
    on: true,
  },
  {
    id: 's7',
    time: '19:30',
    label: 'Raajverse Work',
    icon: 'play-circle-outline',
    on: true,
  },
  {
    id: 's8',
    time: '20:30',
    label: 'Roadies Preparation',
    icon: 'trophy-outline',
    on: true,
  },
  {
    id: 's9',
    time: '21:00',
    label: 'Self-reflection / Journal',
    icon: 'book-outline',
    on: true,
  },
  { id: 's10', time: '22:00', label: 'Sleep', icon: 'bed-outline', on: true },
];

const INITIAL_DATA = {
  startDate: DEFAULT_START,
  checks: {}, // { [day]: { [habitId]: true } }
  water: {}, // { [day]: litres }
  weight: {}, // { [day]: kg }
  schedule: DEFAULT_SCHEDULE,
  remindersOn: true,
  waterGoal: 3,
};

/* ---------------------------- HELPERS ---------------------------- */
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad2 = (n) => String(n).padStart(2, '0');
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const parseDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toKey = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayDate = (start, day) => addDays(parseDate(start), day - 1);
const fmtLong = (d) =>
  `${DAYS[d.getDay()]}, ${d.getDate()} ${
    MONTHS[d.getMonth()]
  } ${d.getFullYear()}`;
const fmtShort = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const currentDayOf = (start) => {
  const now = new Date();
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((t - parseDate(start)) / 86400000);
  return clamp(diff + 1, 1, TOTAL_DAYS);
};

const countDone = (data, day) => {
  const c = data.checks[day];
  return c ? Object.values(c).filter(Boolean).length : 0;
};
const pillarDone = (data, day, p) => {
  const c = data.checks[day] || {};
  return p.habits.filter((h) => c[h.id]).length;
};

const calcStreak = (data, today) => {
  let d = today;
  if (countDone(data, d) / TOTAL_HABITS < STREAK_MIN) d -= 1; // aaj abhi baaki hai to kal se gino
  let streak = 0;
  while (d >= 1 && countDone(data, d) / TOTAL_HABITS >= STREAK_MIN) {
    streak += 1;
    d -= 1;
  }
  return streak;
};

const computeStats = (data, mode, today) => {
  let from = 1;
  let to = TOTAL_DAYS;
  if (mode === 'Weekly') {
    from = Math.max(1, today - 6);
    to = today;
  }
  if (mode === 'Monthly') {
    from = Math.max(1, today - 29);
    to = today;
  }
  const days = to - from + 1;
  const tracked = Math.min(today, to) - from + 1;
  let done = 0;
  let waterDays = 0;
  const pillarTotals = {};
  PILLARS.forEach((p) => {
    pillarTotals[p.id] = 0;
  });
  for (let d = from; d <= to; d++) {
    done += countDone(data, d);
    PILLARS.forEach((p) => {
      pillarTotals[p.id] += pillarDone(data, d, p);
    });
    if ((data.water[d] || 0) >= data.waterGoal) waterDays += 1;
  }
  const total = days * TOTAL_HABITS;
  const pillarPct = {};
  PILLARS.forEach((p) => {
    pillarPct[p.id] = pillarTotals[p.id] / (days * p.habits.length);
  });
  return {
    days,
    tracked,
    done,
    total,
    pct: total ? done / total : 0,
    waterDays,
    pillarPct,
  };
};

const normTime = (t) => {
  const m = /^(\d{1,2})[:.]?(\d{2})$/.exec(String(t).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return `${pad2(h)}:${pad2(mi)}`;
};

/* ---------------------------- CLOUD SYNC HELPERS ---------------------------- */
// Local values win conflicts; cloud-only days/entries are retained.
// This protects existing device data during the first cloud migration.
const mergeProgress = (localData, cloudData) => {
  const local = { ...INITIAL_DATA, ...(localData || {}) };
  const cloud = { ...INITIAL_DATA, ...(cloudData || {}) };
  return {
    ...cloud,
    ...local,
    checks: { ...(cloud.checks || {}), ...(local.checks || {}) },
    water: { ...(cloud.water || {}), ...(local.water || {}) },
    weight: { ...(cloud.weight || {}), ...(local.weight || {}) },
    schedule: Array.isArray(local.schedule) ? local.schedule : cloud.schedule,
    startDate: local.startDate || cloud.startDate || DEFAULT_START,
    remindersOn:
      typeof local.remindersOn === 'boolean'
        ? local.remindersOn
        : cloud.remindersOn,
    waterGoal:
      Number(local.waterGoal) ||
      Number(cloud.waterGoal) ||
      INITIAL_DATA.waterGoal,
  };
};
/* ---------------------------- SMALL UI PIECES ---------------------------- */
function Header({ subtitle, onBell }) {
  return (
    <View style={s.header}>
            
      <View>
                
        <Text style={s.brand}>
                    Project <Text style={{ color: C.lime }}>DiSC3</Text>
                  
        </Text>
                {subtitle ? <Text style={s.brandSub}>{subtitle}</Text> : null}
              
      </View>
            
      <TouchableOpacity onPress={onBell} style={s.bell} activeOpacity={0.7}>
                
        <Ionicons name="notifications-outline" size={24} color="#fff" />
              
      </TouchableOpacity>
          
    </View>
  );
}

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function Bar({ pct, height = 8, color = C.lime }) {
  return (
    <View style={[s.barTrack, { height, borderRadius: height / 2 }]}>
            
      <View
        style={{
          width: `${clamp(pct, 0, 1) * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
          
    </View>
  );
}

function Badge({ p, size = 32 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: p.color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
            
      <Text style={{ color: p.fg, fontWeight: '900', fontSize: size * 0.5 }}>
        {p.letter}
      </Text>
          
    </View>
  );
}

function Ring({ size = 150, stroke = 12, pct = 0, id = 'ring', children }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: C.lime,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.card,
      }}>
            {children}
          
    </View>
  );
}

function StatRow({ icon, lib = 'ion', color = C.lime, value, label }) {
  const Icon = lib === 'mci' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={s.statRow}>
            
      <Icon name={icon} size={26} color={color} style={{ width: 34 }} />
            
      <View>
                <Text style={s.statVal}>{value}</Text>
                <Text style={s.statLbl}>{label}</Text>
              
      </View>
          
    </View>
  );
}

function HabitRow({ label, checked, onPress, last }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[s.habitRow, !last && s.habitBorder]}>
            
      <View style={[s.box, checked && s.boxOn]}>
                
        {checked ? (
          <Ionicons name="checkmark" size={17} color={C.limeDark} />
        ) : null}
              
      </View>
            
      <Text
        style={[
          s.habitText,
          checked && { color: C.muted, textDecorationLine: 'line-through' },
        ]}>
                {label}
              
      </Text>
          
    </TouchableOpacity>
  );
}

function PrimaryButton({ icon, label, onPress, color = C.lime }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.primaryBtn, { backgroundColor: color }]}>
            
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={C.limeDark}
          style={{ marginRight: 8 }}
        />
      ) : null}
            <Text style={s.primaryBtnText}>{label}</Text>
          
    </TouchableOpacity>
  );
}

/* ---------------------------- HOME ---------------------------- */
function Home({
  data,
  today,
  stats,
  streak,
  todayDone,
  onWater,
  onWeight,
  onBell,
}) {
  const start = parseDate(data.startDate);
  const end = addDays(start, TOTAL_DAYS - 1);
  const water = data.water[today] || 0;
  const weight = data.weight[today];
  const dayPct = todayDone / TOTAL_HABITS;
  const { width } = useWindowDimensions();
const isMobile = width < 600;

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}>
            
      <Header subtitle="90-DAY SELF-DISCOVERY CHALLENGE" onBell={onBell} />
            {/* Hero */}
            
      <View style={s.hero}>
                
        <LinearGradient
          colors={['#09131D', '#1D2A44', '#7A4A4F', '#E8913F']}
          locations={[0, 0.45, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
                
        <MaterialCommunityIcons
          name="image-filter-hdr"
          size={200}
          color="#070D12"
          style={{ position: 'absolute', right: -24, bottom: -46 }}
        />
                
        <MaterialCommunityIcons
          name="hiking"
          size={46}
          color="#04080B"
          style={{ position: 'absolute', right: 62, bottom: 104 }}
        />
                
        <View
  style={{
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18
  }}
>
                    <Text style={s.heroA}>90 DAYS</Text>
                    <Text style={s.heroB}>CHALLENGE</Text>
                    
          <Text style={s.heroC}>
            Become who you{'\n'}promised yourself to be.
          </Text>
                  
        </View>
              
      </View>
            {/* Date pill */}
            
      <View style={s.pill}>
                
        <Ionicons name="calendar-outline" size={20} color={C.lime} />
                
        <Text style={s.pillText}>
          {fmtShort(start)} – {fmtShort(end)}
        </Text>
              
      </View>
            
{/* Day ring + stats */}
<View style={[s.ringRow, isMobile && s.ringRowMobile]}>
  <Ring size={150} stroke={13} pct={today / TOTAL_DAYS} id="homeRing">
    <Text style={s.ringDay}>DAY</Text>
    <Text style={s.ringNum}>
      {pad2(today)}
      <Text style={s.ringOf}> / 90</Text>
    </Text>
  </Ring>

  <View style={[{ flex: 1, marginLeft: 18 }, isMobile && s.mobileStats]}>
    <StatRow
      icon="target"
      lib="mci"
      value={`${Math.round(stats.pct * 100)}%`}
      label="Overall Progress"
    />
    <StatRow
      icon="fire"
      lib="mci"
      color={C.orange}
      value={`${streak} Days`}
      label="Current Streak"
    />
    <StatRow
      icon="flag"
      lib="mci"
      value={`${TOTAL_DAYS - today} Days`}
      label="Remaining"
    />
  </View>
</View>

            {/* Pillars */}
            
      <Card>
                <Text style={s.cardTitle}>DISC5 – Five Pillars</Text>
                
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
                    
          {PILLARS.map((p) => (
            <View key={p.id} style={s.pillarChip}>
                            
              <Badge p={p} size={34} />
                            
              <Text style={s.pillarChipText} numberOfLines={2}>
                {p.name}
              </Text>
                          
            </View>
          ))}
                  
        </View>
              
      </Card>
            {/* Today at a glance */}
            
      <Card style={{ marginTop: 14 }}>
                <Text style={s.cardTitle}>Today at a Glance</Text>
                
        <View style={s.glanceRow}>
                    
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={22}
            color={C.lime}
          />
                    
          <Text style={s.glanceText}>
            {todayDone} / {TOTAL_HABITS} Habits
          </Text>
                    <Text style={s.glancePct}>{Math.round(dayPct * 100)}%</Text>
                  
        </View>
                
        <Bar pct={dayPct} height={9} />
                
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
                    
          <View style={[s.miniCard, { marginRight: 8 }]}>
                        
            <View style={s.miniHead}>
                            
              <Ionicons name="water-outline" size={20} color={C.lime} />
                            <Text style={s.miniLabel}>Water</Text>
                          
            </View>
                        
            <Text style={s.miniValue}>
              {water.toFixed(2)} / {data.waterGoal.toFixed(2)} L
            </Text>
                        
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            
              <TouchableOpacity
                style={s.roundBtn}
                onPress={() => onWater(-0.25)}>
                                
                <Ionicons name="remove" size={18} color="#fff" />
                              
              </TouchableOpacity>
                            
              <TouchableOpacity
                style={[s.roundBtn, { backgroundColor: C.lime, marginLeft: 8 }]}
                onPress={() => onWater(0.25)}>
                                
                <Ionicons name="add" size={18} color={C.limeDark} />
                              
              </TouchableOpacity>
                          
            </View>
                      
          </View>
                    
          <TouchableOpacity
            style={[s.miniCard, { marginLeft: 8 }]}
            activeOpacity={0.8}
            onPress={onWeight}>
                        
            <View style={s.miniHead}>
                            
              <Ionicons name="speedometer-outline" size={20} color={C.lime} />
                            <Text style={s.miniLabel}>Weight</Text>
                          
            </View>
                        
            <Text style={s.miniValue}>{weight ? `${weight} kg` : '-- kg'}</Text>
                        <Text style={s.miniHint}>Tap to log today</Text>
                      
          </TouchableOpacity>
                  
        </View>
              
      </Card>
            {/* Quote */}
            
      <View style={s.quote}>
                
        <Ionicons name="chatbox-ellipses-outline" size={26} color={C.lime} />
                
        <Text style={s.quoteText}>
          Small, consistent actions for 90 days create a new you.
        </Text>
              
      </View>
          
    </ScrollView>
  );
}

//---------------------------- CHALLENGE ----------------------------//
function Challenge({ data, today, day, setDay, onToggle, onSave }) {
  const date = dayDate(data.startDate, day);
  const checks = data.checks[day] || {};
  const done = countDone(data, day);
  const pct = done / TOTAL_HABITS;

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}>
            
      <Header />
            <Text style={s.bigTitle}>90 DAYS CHALLENGE</Text>
            <Text style={s.bigDay}>DAY {pad2(day)} / 90</Text>
            
      <View style={s.dayNav}>
                
        <TouchableOpacity
          style={[s.navBtn, day <= 1 && { opacity: 0.3 }]}
          disabled={day <= 1}
          onPress={() => setDay(day - 1)}>
                    
          <Ionicons name="chevron-back" size={20} color={C.lime} />
                  
        </TouchableOpacity>
                <Text style={s.dateText}>{fmtLong(date)}</Text>
                
        <TouchableOpacity
          style={[s.navBtn, day >= today && { opacity: 0.3 }]}
          disabled={day >= today}
          onPress={() => setDay(day + 1)}>
                    
          <Ionicons name="chevron-forward" size={20} color={C.lime} />
                  
        </TouchableOpacity>
              
      </View>
            
      <View style={{ marginTop: 14 }}>
                
        <Bar pct={pct} height={10} />
                
        <View style={s.rowBetween}>
                    
          <Text style={s.mutedText}>
            {day === today ? "Today's Completion" : 'Day Completion'}
          </Text>
                    
          <Text style={s.mutedText}>
            {done} / {TOTAL_HABITS} ({Math.round(pct * 100)}%)
          </Text>
                  
        </View>
              
      </View>
            
      {PILLARS.map((p) => (
        <Card key={p.id} style={{ marginTop: 14, paddingVertical: 8 }}>
                    
          <View style={s.groupHead}>
                        
            <Badge p={p} size={30} />
                        
            <Text style={s.groupTitle}>
              {p.name.toUpperCase()} ({p.habits.length})
            </Text>
                      
          </View>
                    
          {p.habits.map((h, i) => (
            <HabitRow
              key={h.id}
              label={h.label}
              checked={!!checks[h.id]}
              last={i === p.habits.length - 1}
              onPress={() => onToggle(day, h.id)}
            />
          ))}
                  
        </Card>
      ))}
            
      <View style={{ marginTop: 18 }}>
                
        <PrimaryButton
          icon="checkmark"
          label="Save Today's Check-in"
          onPress={() => onSave(day, done)}
        />
              
      </View>
          
    </ScrollView>
  );
}

/* ---------------------------- PROGRESS ---------------------------- */
function Progress({ data, today, onBell }) {
  const [mode, setMode] = useState('Overall');
  const st = computeStats(data, mode, today);

  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = today - i;
    week.push({
      label: DAYS[dayDate(data.startDate, d).getDay()],
      pct: d >= 1 ? countDone(data, d) / TOTAL_HABITS : 0,
    });
  }

  const wDays = Object.keys(data.weight)
    .map(Number)
    .sort((a, b) => a - b);
  const latestW = wDays.length ? data.weight[wDays[wDays.length - 1]] : null;
  const deltaW = wDays.length > 1 ? latestW - data.weight[wDays[0]] : null;

  let waterSum = 0;
  for (let d = 1; d <= today; d++) waterSum += data.water[d] || 0;
  const waterAvg = waterSum / today;

  const PLOT_H = 126;

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}>
            
      <Header onBell={onBell} />
            <Text style={s.screenTitle}>Your Progress</Text>
            
      <View style={s.segment}>
                
        {['Overall', 'Weekly', 'Monthly'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[s.segItem, mode === m && s.segOn]}
            onPress={() => setMode(m)}
            activeOpacity={0.8}>
                        
            <Text style={[s.segText, mode === m && { color: C.limeDark }]}>
              {m}
            </Text>
                      
          </TouchableOpacity>
        ))}
              
      </View>
            
      <View style={s.ringRow}>
                
        <Ring size={138} stroke={12} pct={st.pct} id="progRing">
                    <Text style={s.ringPct}>{Math.round(st.pct * 100)}%</Text>
                    <Text style={s.ringSmall}>Overall{'\n'}Completion</Text>
                  
        </Ring>
                
        <View style={{ flex: 1, marginLeft: 18 }}>
                    
          <StatRow
            icon="calendar-outline"
            value={`${st.tracked} / ${st.days}`}
            label="Days Tracked"
          />
                    
          <StatRow
            icon="checkbox-outline"
            value={`${st.done} / ${st.total}`}
            label="Habits Done"
          />
                    
          <StatRow
            icon="water-outline"
            value={`${st.waterDays}`}
            label={`${data.waterGoal}L Water Days`}
          />
                  
        </View>
              
      </View>
            
      <Card>
                <Text style={s.cardTitle}>DISC5 Pillar Performance</Text>
                
        {PILLARS.map((p) => (
          <View
            key={p.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 14,
            }}>
                        
            <Badge p={p} size={32} />
                        
            <View style={{ flex: 1, marginLeft: 12 }}>
                            
              <View style={s.rowBetween}>
                                <Text style={s.pillarName}>{p.name}</Text>
                                
                <Text style={s.pillarName}>
                  {Math.round(st.pillarPct[p.id] * 100)}%
                </Text>
                              
              </View>
                            
              <View style={{ marginTop: 6 }}>
                                
                <Bar pct={st.pillarPct[p.id]} height={7} color={p.color} />
                              
              </View>
                          
            </View>
                      
          </View>
        ))}
              
      </Card>
            
      <Card style={{ marginTop: 14 }}>
                <Text style={s.cardTitle}>Habit Completion (Last 7 Days)</Text>
                
        <View
          style={{ flexDirection: 'row', marginTop: 12, height: PLOT_H + 14 }}>
                    
          <View style={{ width: 38, justifyContent: 'space-between' }}>
                        
            {[100, 80, 60, 40, 20, 0].map((v) => (
              <Text key={v} style={s.axis}>
                {v}%
              </Text>
            ))}
                      
          </View>
                    
          <View style={{ flex: 1 }}>
                        
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 1,
                  top: 7 + (i * PLOT_H) / 5,
                  backgroundColor: C.border,
                }}
              />
            ))}
                        
            <View
              style={{
                position: 'absolute',
                top: 7,
                left: 0,
                right: 0,
                height: PLOT_H,
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
              }}>
                            
              {week.map((w, i) => (
                <View
                  key={i}
                  style={{
                    width: 18,
                    height: w.pct * PLOT_H,
                    minHeight: w.pct > 0 ? 3 : 0,
                    backgroundColor: C.lime,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                  }}
                />
              ))}
                          
            </View>
                      
          </View>
                  
        </View>
                
        <View style={{ flexDirection: 'row', marginLeft: 38, marginTop: 4 }}>
                    
          {week.map((w, i) => (
            <Text key={i} style={[s.axis, { flex: 1, textAlign: 'center' }]}>
              {w.label}
            </Text>
          ))}
                  
        </View>
              
      </Card>
            
      <View style={{ flexDirection: 'row', marginTop: 14 }}>
                
        <View style={[s.miniCard, { marginRight: 8 }]}>
                    
          <View style={s.miniHead}>
                        
            <Ionicons name="speedometer-outline" size={20} color={C.lime} />
                        <Text style={s.miniLabel}>Weight Trend</Text>
                      
          </View>
                    
          <Text style={s.miniValue}>{latestW ? `${latestW} kg` : '-- kg'}</Text>
                    
          {deltaW !== null ? (
            <Text style={s.miniHint}>
              {deltaW > 0 ? '+' : ''}
              {deltaW.toFixed(1)} kg since start
            </Text>
          ) : null}
                  
        </View>
                
        <View style={[s.miniCard, { marginLeft: 8 }]}>
                    
          <View style={s.miniHead}>
                        
            <Ionicons name="water-outline" size={20} color={C.lime} />
                        <Text style={s.miniLabel}>Water Avg</Text>
                      
          </View>
                    <Text style={s.miniValue}>{waterAvg.toFixed(2)} L</Text>
                    <Text style={s.miniHint}>per day</Text>
                  
        </View>
              
      </View>
          
    </ScrollView>
  );
}

/* ---------------------------- SCHEDULE ---------------------------- */
function Schedule({ data, onChange, onReminders }) {
  const [editing, setEditing] = useState(false);
  const list = data.schedule;

  const patch = (id, change) =>
    onChange(list.map((it) => (it.id === id ? { ...it, ...change } : it)));
  const remove = (id) => onChange(list.filter((it) => it.id !== id));
  const add = () =>
    onChange([
      ...list,
      {
        id: `s${Date.now()}`,
        time: '12:00',
        label: 'New task',
        icon: 'time-outline',
        on: true,
      },
    ]);

  const finishEditing = () => {
    const cleaned = list
      .map((it) => ({ ...it, time: normTime(it.time) || it.time }))
      .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
    onChange(cleaned);
    setEditing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
            
      <Header />
            <Text style={s.screenTitle}>Daily Schedule</Text>
            
      <Text style={s.mutedText}>Your routine for a high-performance day.</Text>
            
      <View style={{ marginTop: 16 }}>
                
        <View style={s.timeline} />
                
        {list.map((it) => (
          <View key={it.id} style={s.schedRow}>
                        
            <View style={s.dot} />
                        
            <View style={s.schedCard}>
                            
              {editing ? (
                <TextInput
                  value={it.time}
                  onChangeText={(v) => patch(it.id, { time: v })}
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                  style={[s.timeChip, s.timeInput]}
                />
              ) : (
                <View style={s.timeChip}>
                                    <Text style={s.timeText}>{it.time}</Text>
                                  
                </View>
              )}
                            
              <Ionicons
                name={it.icon}
                size={22}
                color={C.lime}
                style={{ marginHorizontal: 10 }}
              />
                            
              {editing ? (
                <TextInput
                  value={it.label}
                  onChangeText={(v) => patch(it.id, { label: v })}
                  style={s.labelInput}
                />
              ) : (
                <Text style={s.schedLabel} numberOfLines={1}>
                  {it.label}
                </Text>
              )}
                            
              {editing ? (
                <TouchableOpacity
                  onPress={() => remove(it.id)}
                  style={{ padding: 6 }}>
                                    
                  <Ionicons name="trash-outline" size={20} color={C.danger} />
                                  
                </TouchableOpacity>
              ) : (
                <Switch
                  value={it.on}
                  onValueChange={(v) => patch(it.id, { on: v })}
                  trackColor={{ false: '#2B3A42', true: C.lime }}
                  thumbColor="#FFFFFF"
                />
              )}
                          
            </View>
                      
          </View>
        ))}
              
      </View>
      {editing ? (
        <TouchableOpacity onPress={add} style={s.addBtn} activeOpacity={0.8}>
                    
          <Ionicons name="add" size={20} color={C.lime} />
                    
          <Text style={{ color: C.lime, fontWeight: '700', marginLeft: 6 }}>
            Add item
          </Text>
                  
        </TouchableOpacity>
      ) : null}
            
      <Card style={{ marginTop: 16 }}>
                
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    
          <Ionicons name="notifications" size={22} color={C.lime} />
                    
          <Text style={[s.cardTitle, { marginLeft: 10 }]}>Reminders</Text>
                  
        </View>
                
        <View style={[s.rowBetween, { marginTop: 12, alignItems: 'center' }]}>
                    
          <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={s.schedLabel}>Daily Reminders</Text>
                        
            <Text style={[s.mutedText, { fontSize: 12 }]}>
                            Get notified for your routine timings.             
            </Text>
                      
          </View>
                    
          <Switch
            value={data.remindersOn}
            onValueChange={onReminders}
            trackColor={{ false: '#2B3A42', true: C.lime }}
            thumbColor="#FFFFFF"
          />
                  
        </View>
              
      </Card>
            
      <View style={{ marginTop: 18 }}>
                
        <PrimaryButton
          icon={editing ? 'checkmark' : 'create-outline'}
          label={editing ? 'Done' : 'Edit Schedule'}
          onPress={() => (editing ? finishEditing() : setEditing(true))}
        />
              
      </View>
          
    </ScrollView>
  );
}

/* ---------------------------- ROOT ---------------------------- */
/* ---------------------------- MORE ---------------------------- */
function More({ data, onGoal, onRestart, cloudStatus }) {
  const [confirm, setConfirm] = useState(false);
  const start = parseDate(data.startDate);
  const end = addDays(start, TOTAL_DAYS - 1);

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <Header />
      <Text style={s.screenTitle}>More</Text>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.cardTitle}>Cloud Backup</Text>
        <Text style={[s.mutedText, { marginTop: 8 }]}>
          {cloudStatus || 'Connecting to cloud...'}
        </Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.cardTitle}>Challenge</Text>
        <Text style={[s.mutedText, { marginTop: 8 }]}>Start: {fmtLong(start)}</Text>
        <Text style={[s.mutedText, { marginTop: 4 }]}>End: {fmtLong(end)}</Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.cardTitle}>Daily water goal</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <TouchableOpacity style={s.roundBtn} onPress={() => onGoal(-0.5)}>
            <Ionicons name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={[s.miniValue, { marginHorizontal: 18 }]}>
            {data.waterGoal.toFixed(1)} L
          </Text>
          <TouchableOpacity
            style={[s.roundBtn, { backgroundColor: C.lime }]}
            onPress={() => onGoal(0.5)}
          >
            <Ionicons name="add" size={18} color={C.limeDark} />
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.cardTitle}>Restart challenge</Text>
        <Text style={[s.mutedText, { marginTop: 8, marginBottom: 12 }]}>
          Aaj se Day 1 shuru hoga aur purana saara progress delete ho jayega.
        </Text>
        <PrimaryButton
          color={confirm ? C.danger : C.lime}
          icon={confirm ? 'warning-outline' : 'refresh'}
          label={confirm ? 'Pakka? Dobara tap karo' : 'Restart from today'}
          onPress={() => {
            if (confirm) {
              setConfirm(false);
              onRestart();
            } else {
              setConfirm(true);
            }
          }}
        />
      </Card>

      <Text style={[s.mutedText, { textAlign: 'center', marginTop: 18, fontSize: 12 }]}>
        Project DiSC3 v1.1 · Local storage + Supabase cloud backup.
      </Text>
    </ScrollView>
  );
}

/* ---------------------------- WEIGHT MODAL ---------------------------- */
function WeightModal({ visible, initial, onClose, onSave }) {
  const [txt, setTxt] = useState('');

  useEffect(() => {
    if (visible) setTxt(initial ? String(initial) : '');
  }, [visible, initial]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalBg}>
        <View style={s.modalCard}>
          <Text style={s.cardTitle}>Aaj ka weight (kg)</Text>
          <TextInput
            value={txt}
            onChangeText={setTxt}
            keyboardType="decimal-pad"
            placeholder="e.g. 68.5"
            placeholderTextColor={C.muted}
            style={s.input}
            autoFocus
          />
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: C.track, marginRight: 8 }]}
              onPress={onClose}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: C.lime, marginLeft: 8 }]}
              onPress={() => onSave(parseFloat(txt.replace(',', '.')))}
            >
              <Text style={{ color: C.limeDark, fontWeight: '800' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------------------- TAB BAR ---------------------------- */
const TABS = [
  { key: 'Home', icon: 'home' },
  { key: 'Challenge', icon: 'checkbox' },
  { key: 'Progress', icon: 'stats-chart' },
  { key: 'Schedule', icon: 'calendar' },
  { key: 'More', icon: 'person' },
];

function TabBar({ tab, setTab, bottomInset }) {
  return (
    <View style={[s.tabBar, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={s.tabItem}
            onPress={() => setTab(t.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={active ? t.icon : `${t.icon}-outline`}
              size={24}
              color={active ? C.lime : '#9FB0B8'}
            />
            <Text style={[s.tabText, active && { color: C.lime, fontWeight: '800' }]}>
              {t.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
function Root() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState(
    'Preparing secure cloud backup...'
  );
  const cloudUserId = useRef(null);
  const [tab, setTab] = useState('Home');
  const [selDay, setSelDay] = useState(null);
  const [toast, setToast] = useState('');
  const [weightOpen, setWeightOpen] = useState(false);
  const toastTimer = useRef(null); // Load local data first, then sign in anonymously and safely merge cloud data.

  useEffect(() => {
    let active = true;
    (async () => {
      let localData = INITIAL_DATA;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) localData = { ...INITIAL_DATA, ...JSON.parse(raw) };
      } catch (e) {
        console.warn('Could not load local progress:', e);
      }
      if (!active) return;
      setData(localData);

      try {
        if (
          !SUPABASE_PUBLISHABLE_KEY ||
          SUPABASE_PUBLISHABLE_KEY.includes('PASTE_YOUR_')
        ) {
          throw new Error(
            'Add your new Supabase Publishable key in App.js CONFIG.'
          );
        }

        let { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        let session = sessionData?.session;

        if (!session) {
          const signIn = await supabase.auth.signInAnonymously();
          if (signIn.error) throw signIn.error;
          session = signIn.data?.session;
        }
        if (!session?.user?.id)
          throw new Error('Anonymous sign-in did not return a user session.');

        cloudUserId.current = session.user.id;
        const { data: cloudRow, error: readError } = await supabase
          .from('user_progress')
          .select('data')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (readError) throw readError;

        const merged = cloudRow?.data
          ? mergeProgress(localData, cloudRow.data)
          : localData; // Keep local copy before attempting cloud write.

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        if (!active) return;
        setData(merged);

        const { error: writeError } = await supabase
          .from('user_progress')
          .upsert(
            {
              user_id: session.user.id,
              data: merged,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        if (writeError) throw writeError;

        if (active) {
          setCloudStatus('Connected · Automatic cloud backup ON');
          setCloudReady(true);
        }
      } catch (e) {
        console.warn('Cloud sync setup failed:', e);
        if (active) {
          setCloudStatus(
            'Offline / backup unavailable: ' +
              (e?.message || 'Connection error')
          );
          setCloudReady(false);
        }
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []); // Save locally immediately; upload to Supabase after a short pause.

  useEffect(() => {
    if (!loaded) return;
    const serialized = JSON.stringify(data);
    AsyncStorage.setItem(STORAGE_KEY, serialized).catch((e) =>
      console.warn('Local save failed:', e)
    );
    if (!cloudReady || !cloudUserId.current) return;

    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: cloudUserId.current,
            data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
        if (error) throw error;
        setCloudStatus('Connected · All changes backed up');
      } catch (e) {
        console.warn('Cloud backup failed:', e);
        setCloudStatus('Local save OK · Cloud backup pending');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [data, loaded, cloudReady]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  }, []);

  const today = currentDayOf(data.startDate);
  const viewDay = clamp(selDay === null ? today : selDay, 1, today);
  const stats = computeStats(data, 'Overall', today);
  const streak = calcStreak(data, today);
  const todayDone = countDone(data, today);

  const toggleHabit = (day, id) =>
    setData((d) => {
      const dayChecks = { ...(d.checks[day] || {}) };
      dayChecks[id] = !dayChecks[id];
      return { ...d, checks: { ...d.checks, [day]: dayChecks } };
    });

  const changeWater = (delta) =>
    setData((d) => {
      const v = clamp(
        Math.round(((d.water[today] || 0) + delta) * 100) / 100,
        0,
        10
      );
      return { ...d, water: { ...d.water, [today]: v } };
    });

  const saveWeight = (kg) => {
    setData((d) => {
      const w = { ...d.weight };
      if (isNaN(kg) || kg < 20 || kg > 300) delete w[today];
      else w[today] = Math.round(kg * 10) / 10;
      return { ...d, weight: w };
    });
    setWeightOpen(false);
    showToast('Weight saved');
  };

  const saveCheckin = (day, done) => {
    showToast(
      done === TOTAL_HABITS
        ? 'Perfect day! All habits done :fire:'
        : 'Check-in saved :white_check_mark:'
    );
  };

  const setSchedule = (schedule) => setData((d) => ({ ...d, schedule }));

  const toggleReminders = (v) => {
    setData((d) => ({ ...d, remindersOn: v }));
    showToast(v ? 'Reminders ON' : 'Reminders OFF');
  };

  const changeGoal = (delta) =>
    setData((d) => ({
      ...d,
      waterGoal: clamp(Math.round((d.waterGoal + delta) * 10) / 10, 1, 8),
    }));

  const restart = () => {
    setData((d) => ({
      ...INITIAL_DATA,
      startDate: toKey(new Date()),
      schedule: d.schedule,
      remindersOn: d.remindersOn,
      waterGoal: d.waterGoal,
    }));
    setSelDay(null);
    setTab('Home');
    showToast('Day 1 shuru! All the best :muscle:');
  };

  const bell = () =>
    showToast(data.remindersOn ? 'Reminders are ON' : 'Reminders are OFF');

  let screen = null;
  if (tab === 'Home') {
    screen = (
      <Home
        data={data}
        today={today}
        stats={stats}
        streak={streak}
        todayDone={todayDone}
        onWater={changeWater}
        onWeight={() => setWeightOpen(true)}
        onBell={bell}
      />
    );
  } else if (tab === 'Challenge') {
    screen = (
      <Challenge
        data={data}
        today={today}
        day={viewDay}
        setDay={setSelDay}
        onToggle={toggleHabit}
        onSave={saveCheckin}
      />
    );
  } else if (tab === 'Progress') {
    screen = <Progress data={data} today={today} onBell={bell} />;
  } else if (tab === 'Schedule') {
    screen = (
      <Schedule
        data={data}
        onChange={setSchedule}
        onReminders={toggleReminders}
      />
    );
  } else {
    screen = (
      <More
        data={data}
        onGoal={changeGoal}
        onRestart={restart}
        cloudStatus={cloudStatus}
      />
    );
  }

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
            
      <StatusBar style="light" />
            
      <View style={s.shell}>
                <View style={{ flex: 1 }}>{loaded ? screen : null}</View>
                
        <TabBar tab={tab} setTab={setTab} bottomInset={insets.bottom} />
              
      </View>
            
      {toast ? (
        <View style={[s.toastWrap, { bottom: 88 + insets.bottom }]}>
                    
          <View style={s.toast}>
                        <Text style={s.toastText}>{toast}</Text>
                      
          </View>
                  
        </View>
      ) : null}
            
      <WeightModal
        visible={weightOpen}
        initial={data.weight[today]}
        onClose={() => setWeightOpen(false)}
        onSave={saveWeight}
      />
          
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
            
      <Root />
          
    </SafeAreaProvider>
  );
}

/* ---------------------------- STYLES ---------------------------- */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  shell: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 28 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  brand: { color: '#fff', fontSize: 24, fontWeight: '800' },
  brandSub: {
    color: '#D6E0E5',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  bell: { padding: 6 },

  card: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  mutedText: { color: C.muted, fontSize: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },

  barTrack: { backgroundColor: C.track, overflow: 'hidden', width: '100%' },

  hero: {
    height: 210,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  heroA: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: 36,
  },
  heroB: {
    color: C.lime,
    fontSize: 34,
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: 38,
  },
  heroC: { color: '#fff', fontSize: 14, marginTop: 6, lineHeight: 19 },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.lime,
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 14,
    backgroundColor: 'rgba(181,242,61,0.06)',
  },
  pillText: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 10 },

  ringRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  ringRowMobile: {
  flexDirection: 'column',
  alignItems: 'center',
  marginVertical: 20,
},
mobileStats: {
  width: '100%',
  marginLeft: 0,
  marginTop: 24,
},
  ringDay: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ringNum: { color: '#fff', fontSize: 40, fontWeight: '900' },
  ringOf: { fontSize: 20, fontWeight: '600', color: '#DDE6EA' },
  ringPct: { color: '#fff', fontSize: 34, fontWeight: '900' },
  ringSmall: {
    color: '#DDE6EA',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },

  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statVal: { color: '#fff', fontSize: 17, fontWeight: '800' },
  statLbl: { color: C.muted, fontSize: 11 },

  pillarChip: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    backgroundColor: C.card2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillarChipText: {
    color: '#E6EEF1',
    fontSize: 9.5,
    textAlign: 'center',
    marginTop: 6,
    height: 24,
  },

  glanceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  glanceText: { color: '#fff', fontSize: 16, marginLeft: 10, flex: 1 },
  glancePct: { color: C.lime, fontSize: 18, fontWeight: '800' },

  miniCard: {
    flex: 1,
    backgroundColor: C.card2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  miniHead: { flexDirection: 'row', alignItems: 'center' },
  miniLabel: { color: '#fff', fontSize: 14, marginLeft: 8, fontWeight: '600' },
  miniValue: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 8 },
  miniHint: { color: C.muted, fontSize: 11, marginTop: 4 },
  roundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.track,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: C.lime,
    borderRadius: 18,
    backgroundColor: 'rgba(181,242,61,0.06)',
  },
  quoteText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    lineHeight: 21,
  },

  bigTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },
  bigDay: {
    color: C.lime,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
  },
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  groupHead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  groupTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginLeft: 40,
  },
  habitBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#5B6E77',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: C.lime, borderColor: C.lime },
  habitText: { color: '#fff', fontSize: 15, marginLeft: 14, flex: 1 },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 15,
  },
  primaryBtnText: { color: C.limeDark, fontSize: 17, fontWeight: '800' },

  screenTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 3,
    marginTop: 12,
  },
  segItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  segOn: { backgroundColor: C.lime },
  segText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  pillarName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  axis: { color: C.muted, fontSize: 10, height: 14 },

  timeline: {
    position: 'absolute',
    left: 4,
    top: 24,
    bottom: 24,
    width: 2,
    backgroundColor: 'rgba(181,242,61,0.45)',
  },
  schedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.lime,
    marginRight: 12,
  },
  schedCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  timeChip: {
    borderWidth: 1,
    borderColor: 'rgba(181,242,61,0.45)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#0B1410',
    minWidth: 58,
    alignItems: 'center',
  },
  timeText: { color: C.lime, fontWeight: '700', fontSize: 14 },
  timeInput: {
    color: C.lime,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    width: 64,
  },
  schedLabel: { color: '#fff', fontSize: 14, flex: 1 },
  labelInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.track,
    paddingVertical: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: C.lime,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#070E12',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { color: '#9FB0B8', fontSize: 10.5, marginTop: 3 },

  toastWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: {
    backgroundColor: C.lime,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  toastText: { color: C.limeDark, fontWeight: '800', fontSize: 14 },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.card2,
  },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
});
