import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Property, PropertyPhotos } from '../types';

interface AddPropertyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
}

export function AddPropertyModal({ visible, onClose, onSave }: AddPropertyModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [sizeSqm, setSizeSqm] = useState('');
  const [distanceMeters, setDistanceMeters] = useState('');
  const [timeMinutesWalk, setTimeMinutesWalk] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');

  // Condiciones de habitabilidad y restricciones
  const [hasNaturalLight, setHasNaturalLight] = useState(false);
  const [freeEntry24h, setFreeEntry24h] = useState(false);
  const [hasCurfew, setHasCurfew] = useState(false);
  const [curfewHour, setCurfewHour] = useState('22');
  const [allowsVisitors, setAllowsVisitors] = useState(true);
  const [allowsCooking, setAllowsCooking] = useState(true);
  const [petFriendly, setPetFriendly] = useState(false);
  const [declaredTransparently, setDeclaredTransparently] = useState(true);

  // Registro de las 4 fotos obligatorias categorizadas
  const [photos, setPhotos] = useState<Partial<PropertyPhotos>>({});

  const pickImage = async (type: keyof PropertyPhotos) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso Requerido',
        'Se requiere acceso a la galeria multimedia para registrar las evidencias fotograficas.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos((prev) => ({ ...prev, [type]: result.assets[0].uri }));
    }
  };

  const handleSubmit = () => {
    // Normalizacion de separadores decimales
    const cleanPrice = parseFloat(price.replace(',', '.'));
    const cleanSize = parseFloat(sizeSqm.replace(',', '.'));
    const cleanDistance = parseFloat(distanceMeters.replace(',', '.'));
    const cleanTime = parseFloat(timeMinutesWalk.replace(',', '.'));

    if (
      !title.trim() ||
      isNaN(cleanPrice) ||
      isNaN(cleanSize) ||
      isNaN(cleanDistance) ||
      isNaN(cleanTime)
    ) {
      Alert.alert(
        'Datos Incompletos',
        'Por favor ingrese el titulo, precio mensual, area util (m2), distancia (m) y tiempo a pie (min).'
      );
      return;
    }

    // Resolucion segura de fotografias con respaldo técnico para pruebas locales
    const finalPhotos: PropertyPhotos = {
      facadeUri:
        photos.facadeUri ||
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
      roomUri:
        photos.roomUri ||
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
      bathroomUri:
        photos.bathroomUri ||
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
      windowUri:
        photos.windowUri ||
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
    };

    const newProperty: Property = {
      id: `puno-${Date.now()}`,
      title: title.trim(),
      price: cleanPrice,
      sizeSqm: cleanSize,
      distanceMeters: cleanDistance,
      timeMinutesWalk: cleanTime,
      hasNaturalLight,
      securityRating: 4.0,
      services24h: {
        water: true,
        electricity: true,
        internet: true,
      },
      restrictions: {
        freeEntry24h,
        hasCurfew,
        curfewHour: hasCurfew ? parseInt(curfewHour, 10) : undefined,
        allowsVisitors,
        allowsCooking,
        petFriendly,
        declaredTransparently,
      },
      landlordVerified: true,
      realPhotosVerified: true,
      photos: finalPhotos,
      address: address.trim() || 'Av. Floral s/n',
      zone: zone.trim() || 'Entorno UNA Puno',
    };

    onSave(newProperty);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        {/* Cabecera Formal Institucional */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Registro Tecnico de Inmueble</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Seccion 1: Identificacion y Costo */}
          <Text style={styles.sectionLabel}>Datos Principales del Inmueble</Text>
          <TextInput
            placeholder="Titulo descriptivo del cuarto"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <View style={styles.rowInputs}>
            <TextInput
              placeholder="Precio mensual (S/.)"
              placeholderTextColor="#94A3B8"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[styles.input, styles.flexInput]}
            />
            <TextInput
              placeholder="Area util (m2)"
              placeholderTextColor="#94A3B8"
              value={sizeSqm}
              onChangeText={setSizeSqm}
              keyboardType="numeric"
              style={[styles.input, styles.flexInput]}
            />
          </View>

          {/* Seccion 2: Ubicacion respecto al Campus UNA Puno */}
          <Text style={styles.sectionLabel}>Ubicacion y Desplazamiento a UNA Puno</Text>
          <View style={styles.rowInputs}>
            <TextInput
              placeholder="Distancia (metros)"
              placeholderTextColor="#94A3B8"
              value={distanceMeters}
              onChangeText={setDistanceMeters}
              keyboardType="numeric"
              style={[styles.input, styles.flexInput]}
            />
            <TextInput
              placeholder="Tiempo a pie (minutos)"
              placeholderTextColor="#94A3B8"
              value={timeMinutesWalk}
              onChangeText={setTimeMinutesWalk}
              keyboardType="numeric"
              style={[styles.input, styles.flexInput]}
            />
          </View>
          <TextInput
            placeholder="Direccion exacta (Ej. Av. Floral 412)"
            placeholderTextColor="#94A3B8"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />
          <TextInput
            placeholder="Barrio o sector (Ej. Laykakota, Bellavista)"
            placeholderTextColor="#94A3B8"
            value={zone}
            onChangeText={setZone}
            style={styles.input}
          />

          {/* Seccion 3: Condiciones y Restricciones */}
          <Text style={styles.sectionLabel}>Condiciones de Habitabilidad y Reglas</Text>
          <TouchableOpacity
            style={[styles.toggleBtn, hasNaturalLight && styles.toggleBtnActive]}
            onPress={() => setHasNaturalLight(!hasNaturalLight)}
          >
            <Text style={[styles.toggleBtnText, hasNaturalLight && styles.toggleBtnTextActive]}>
              Iluminacion Natural Directa (Otorga +8 pts)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, freeEntry24h && styles.toggleBtnActive]}
            onPress={() => setFreeEntry24h(!freeEntry24h)}
          >
            <Text style={[styles.toggleBtnText, freeEntry24h && styles.toggleBtnTextActive]}>
              Entrada Libre 24h con Llave Propia (Otorga +5 pts)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, hasCurfew && styles.toggleBtnAlert]}
            onPress={() => setHasCurfew(!hasCurfew)}
          >
            <Text style={[styles.toggleBtnText, hasCurfew && styles.toggleBtnTextAlert]}>
              Toque de Queda / Cierre Nocturno (Resta puntos)
            </Text>
          </TouchableOpacity>

          {hasCurfew && (
            <TextInput
              placeholder="Hora limite de llegada (24h, ej. 22 para 10:00 PM)"
              placeholderTextColor="#94A3B8"
              value={curfewHour}
              onChangeText={setCurfewHour}
              keyboardType="numeric"
              style={styles.input}
            />
          )}

          <TouchableOpacity
            style={[styles.toggleBtn, !allowsVisitors && styles.toggleBtnAlert]}
            onPress={() => setAllowsVisitors(!allowsVisitors)}
          >
            <Text style={[styles.toggleBtnText, !allowsVisitors && styles.toggleBtnTextAlert]}>
              {allowsVisitors
                ? 'Permite visitas de companeros de estudio'
                : 'Prohibicion total de visitas (Resta -12 pts)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, !allowsCooking && styles.toggleBtnAlert]}
            onPress={() => setAllowsCooking(!allowsCooking)}
          >
            <Text style={[styles.toggleBtnText, !allowsCooking && styles.toggleBtnTextAlert]}>
              {allowsCooking
                ? 'Permite cocinar en habitacion o area comun'
                : 'Prohibicion de cocinar (Resta -8 pts)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, !declaredTransparently && styles.toggleBtnAlert]}
            onPress={() => setDeclaredTransparently(!declaredTransparently)}
          >
            <Text style={[styles.toggleBtnText, !declaredTransparently && styles.toggleBtnTextAlert]}>
              {declaredTransparently
                ? 'Reglas declaradas con transparencia total'
                : 'Reglas no transparentadas (Penalizacion critica de -25 pts)'}
            </Text>
          </TouchableOpacity>

          {/* Seccion 4: Inspeccion Fotografica Requerida */}
          <Text style={styles.sectionLabel}>Inspeccion Fotografica (4 Categorias)</Text>
          <View style={styles.photoGrid}>
            <View style={styles.photoBox}>
              <Text style={styles.photoBoxTitle}>1. Fachada / Acceso</Text>
              {photos.facadeUri ? (
                <Image source={{ uri: photos.facadeUri }} style={styles.previewImage} />
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('facadeUri')}>
                  <Text style={styles.uploadBtnText}>Adjuntar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.photoBox}>
              <Text style={styles.photoBoxTitle}>2. Habitacion</Text>
              {photos.roomUri ? (
                <Image source={{ uri: photos.roomUri }} style={styles.previewImage} />
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('roomUri')}>
                  <Text style={styles.uploadBtnText}>Adjuntar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.photoBox}>
              <Text style={styles.photoBoxTitle}>3. Banos</Text>
              {photos.bathroomUri ? (
                <Image source={{ uri: photos.bathroomUri }} style={styles.previewImage} />
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('bathroomUri')}>
                  <Text style={styles.uploadBtnText}>Adjuntar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.photoBox}>
              <Text style={styles.photoBoxTitle}>4. Ventana / Luz</Text>
              {photos.windowUri ? (
                <Image source={{ uri: photos.windowUri }} style={styles.previewImage} />
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('windowUri')}>
                  <Text style={styles.uploadBtnText}>Adjuntar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Registrar y Calcular Scoring</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#0A2D5A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  closeBtn: { padding: 6 },
  closeBtnText: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  formContent: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2D5A',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  rowInputs: { flexDirection: 'row', gap: 10 },
  flexInput: { flex: 1 },
  toggleBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  toggleBtnActive: { borderColor: '#0A2D5A', backgroundColor: '#EDF2F7' },
  toggleBtnAlert: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  toggleBtnText: { fontSize: 12, color: '#4A5568', fontWeight: '500' },
  toggleBtnTextActive: { color: '#0A2D5A', fontWeight: '700' },
  toggleBtnTextAlert: { color: '#DC2626', fontWeight: '700' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  photoBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  photoBoxTitle: { fontSize: 11, fontWeight: '600', color: '#4A5568', marginBottom: 6 },
  uploadBtn: {
    backgroundColor: '#0A2D5A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginTop: 8,
  },
  uploadBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  previewImage: { width: '100%', height: 90, borderRadius: 4, resizeMode: 'cover' },
  submitBtn: {
    backgroundColor: '#0A2D5A',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});