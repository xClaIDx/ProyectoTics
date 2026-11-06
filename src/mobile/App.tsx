import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { initDatabase, getAllProperties, insertProperty, resetAndSeedDatabase } from './src/data/database';
import { calculateCasaScore } from './src/utils/scoring';
import { Property, UserPreferences, ScoreBreakdown } from './src/types';
import { AddPropertyModal } from './src/screens/AddPropertyModal';

interface RankedProperty extends Property {
  breakdown: ScoreBreakdown;
}

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rankedList, setRankedList] = useState<RankedProperty[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [prefs, setPrefs] = useState<UserPreferences>({
    weightPrice: 40,
    weightDistance: 30,
    weightSecurity: 20,
    weightServices: 10,
  });

  const loadData = () => {
    initDatabase();
    const data = getAllProperties();
    setProperties(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (properties.length > 0) {
      const calculated = properties.map((prop) => ({
        ...prop,
        breakdown: calculateCasaScore(prop, prefs),
      }));

      calculated.sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore);
      setRankedList(calculated);
    }
  }, [properties, prefs]);

  const handleSaveProperty = (newProp: Property) => {
    insertProperty(newProp);
    loadData();
  };

  const applyPreset = (type: 'economico' | 'cerca' | 'seguro' | 'equilibrado') => {
    if (type === 'economico') {
      setPrefs({ weightPrice: 60, weightDistance: 20, weightSecurity: 10, weightServices: 10 });
    } else if (type === 'cerca') {
      setPrefs({ weightPrice: 20, weightDistance: 60, weightSecurity: 10, weightServices: 10 });
    } else if (type === 'seguro') {
      setPrefs({ weightPrice: 20, weightDistance: 20, weightSecurity: 50, weightServices: 10 });
    } else {
      setPrefs({ weightPrice: 25, weightDistance: 25, weightSecurity: 25, weightServices: 25 });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2D5A" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>CasScore Puno</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>+ Publicar Cuarto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => { resetAndSeedDatabase(); loadData(); }}
            >
              <Text style={styles.resetBtnText}>Reiniciar BD</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Sistema Multicriterio de Evaluacion Habitacional | UNA Puno
        </Text>
      </View>

      <View style={styles.presetsContainer}>
        <Text style={styles.presetLabel}>CRITERIO DE PRIORIZACION:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          <TouchableOpacity
            style={[styles.presetBtn, prefs.weightPrice === 60 && styles.presetBtnActive]}
            onPress={() => applyPreset('economico')}
          >
            <Text style={[styles.presetBtnText, prefs.weightPrice === 60 && styles.presetBtnTextActive]}>
              Menor Precio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetBtn, prefs.weightDistance === 60 && styles.presetBtnActive]}
            onPress={() => applyPreset('cerca')}
          >
            <Text style={[styles.presetBtnText, prefs.weightDistance === 60 && styles.presetBtnTextActive]}>
              Mayor Proximidad
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetBtn, prefs.weightSecurity === 50 && styles.presetBtnActive]}
            onPress={() => applyPreset('seguro')}
          >
            <Text style={[styles.presetBtnText, prefs.weightSecurity === 50 && styles.presetBtnTextActive]}>
              Mayor Seguridad
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetBtn, prefs.weightPrice === 25 && prefs.weightDistance === 25 && styles.presetBtnActive]}
            onPress={() => applyPreset('equilibrado')}
          >
            <Text style={[styles.presetBtnText, prefs.weightPrice === 25 && styles.presetBtnTextActive]}>
              Equilibrado
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={rankedList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
              <Image source={{ uri: item.photos.roomUri }} style={styles.cardImage} />
              <Image source={{ uri: item.photos.facadeUri }} style={styles.cardImage} />
              <Image source={{ uri: item.photos.bathroomUri }} style={styles.cardImage} />
              <Image source={{ uri: item.photos.windowUri }} style={styles.cardImage} />
            </ScrollView>

            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>POSICION {index + 1}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillValue}>{item.breakdown.finalScore}</Text>
                  <Text style={styles.scorePillLabel}>CASA SCORE</Text>
                </View>
              </View>

              <Text style={styles.cardPrice}>
                S/. {item.price} <Text style={styles.cardUnit}>/ mes</Text>
              </Text>

              <View style={styles.metricRow}>
                <Text style={styles.metricText}>Dimension: {item.sizeSqm} m2</Text>
                <Text style={styles.metricSeparator}>|</Text>
                <Text style={styles.metricText}>Distancia: {item.distanceMeters} m</Text>
                <Text style={styles.metricSeparator}>|</Text>
                <Text style={styles.metricHighlight}>Tiempo: {item.timeMinutesWalk} min a pie</Text>
              </View>

              <Text style={styles.cardAddress}>{item.address} - {item.zone}</Text>

              <View style={styles.badgeRow}>
                {item.hasNaturalLight && (
                  <Text style={styles.lightBadge}>Luz Natural Directa</Text>
                )}
                {item.restrictions.freeEntry24h && (
                  <Text style={styles.freeEntryBadge}>Entrada Libre 24h</Text>
                )}
                {item.landlordVerified && (
                  <Text style={styles.verifiedBadge}>DNI Verificado</Text>
                )}
                {item.restrictions.hasCurfew && (
                  <Text style={styles.alertBadge}>Toque de queda {item.restrictions.curfewHour}:00 hrs</Text>
                )}
                {!item.restrictions.allowsVisitors && (
                  <Text style={styles.alertBadge}>Sin Visitas</Text>
                )}
                {!item.restrictions.declaredTransparently && (
                  <Text style={styles.criticalBadge}>Reglas No Transparentes</Text>
                )}
              </View>

              <View style={styles.breakdownBox}>
                <View style={styles.breakdownHeaderRow}>
                  <Text style={styles.breakdownTitle}>Desglose de Puntuacion Base:</Text>
                  <Text style={styles.breakdownBaseScore}>{item.breakdown.baseWeightedScore} pts</Text>
                </View>
                <Text style={styles.breakdownMetrics}>
                  Costo: {item.breakdown.priceScore} | Ubicacion: {item.breakdown.locationScore} | Seguridad: {item.breakdown.securityScore} | Servicios: {item.breakdown.servicesScore}
                </Text>

                {item.breakdown.explanationNotes.length > 0 && (
                  <View style={styles.notesContainer}>
                    {item.breakdown.explanationNotes.map((note, nIdx) => (
                      <Text key={nIdx} style={styles.noteItem}>- {note}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      />

      <AddPropertyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProperty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#0A2D5A',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', gap: 6 },
  addBtn: { backgroundColor: '#B48214', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  addBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  resetBtn: { backgroundColor: '#1E3A5F', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4 },
  resetBtnText: { color: '#CBD5E1', fontSize: 11, fontWeight: '600' },
  headerSubtitle: { fontSize: 11, color: '#CBD5E1', marginTop: 4 },
  presetsContainer: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  presetLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  presetScroll: { flexDirection: 'row' },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetBtnActive: { backgroundColor: '#0A2D5A', borderColor: '#0A2D5A' },
  presetBtnText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  presetBtnTextActive: { color: '#FFFFFF' },
  listContent: { padding: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  gallery: { width: '100%', height: 180 },
  cardImage: { width: 340, height: 180, resizeMode: 'cover' },
  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0A2D5A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rankBadgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 10, letterSpacing: 0.5 },
  cardBody: { padding: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  scorePill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  scorePillValue: { fontSize: 16, fontWeight: 'bold', color: '#166534' },
  scorePillLabel: { fontSize: 8, fontWeight: '700', color: '#166534' },
  cardPrice: { fontSize: 18, fontWeight: 'bold', color: '#0A2D5A', marginTop: 4 },
  cardUnit: { fontSize: 11, fontWeight: 'normal', color: '#64748B' },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metricText: { fontSize: 11, color: '#475569' },
  metricSeparator: { marginHorizontal: 6, color: '#CBD5E1', fontSize: 11 },
  metricHighlight: { fontSize: 11, fontWeight: '700', color: '#0A2D5A' },
  cardAddress: { fontSize: 11, color: '#64748B', marginTop: 3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  lightBadge: { fontSize: 10, backgroundColor: '#FEF3C7', color: '#92400E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  freeEntryBadge: { fontSize: 10, backgroundColor: '#E0E7FF', color: '#3730A3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  verifiedBadge: { fontSize: 10, backgroundColor: '#F1F5F9', color: '#0A2D5A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600', borderWidth: 1, borderColor: '#CBD5E1' },
  alertBadge: { fontSize: 10, backgroundColor: '#FEE2E2', color: '#991B1B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  criticalBadge: { fontSize: 10, backgroundColor: '#7F1D1D', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '700' },
  breakdownBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderColor: '#B48214',
  },
  breakdownHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  breakdownTitle: { fontSize: 10, fontWeight: '700', color: '#334155', textTransform: 'uppercase' },
  breakdownBaseScore: { fontSize: 10, fontWeight: '700', color: '#0A2D5A' },
  breakdownMetrics: { fontSize: 10, color: '#64748B' },
  notesContainer: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderColor: '#E2E8F0' },
  noteItem: { fontSize: 9.5, color: '#475569', marginTop: 1 },
});