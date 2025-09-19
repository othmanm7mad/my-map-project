import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, StatusBar, SafeAreaView, Modal } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

// أيقونات من مكتبة Expo
import { FontAwesome, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';

const { MAPBOX_TOKEN } = Constants.expoConfig.extra;
MapboxGL.setAccessToken(MAPBOX_TOKEN);

const MIDWIVES_LOCATIONS = [
  {
    id: 1,
    name: "القابلة سارة أحمد",
    coordinate: [35.19486, 31.97558],
    experience: "5 سنوات خبرة",
    specialty: "متخصصة في الولادة الطبيعية"
  },
  {
    id: 2,
    name: "القابلة فاطمة محمد", 
    coordinate: [35.18197, 31.939929],
    experience: "8 سنوات خبرة",
    specialty: "متخصصة في رعاية الأمومة"
  },
  {
    id: 3,
    name: "القابلة مريم خالد",
    coordinate: [35.21131, 31.90400],
    experience: "6 سنوات خبرة",
    specialty: "متخصصة في الحمل عالي المخاطر"
  }
];

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestMidwife, setNearestMidwife] = useState(null);
  const [selectedMidwife, setSelectedMidwife] = useState(null);
  const [showMidwifeDetails, setShowMidwifeDetails] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'تم رفض الإذن للوصول إلى الموقع');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentCoords = [location.coords.longitude, location.coords.latitude];
      setUserLocation(currentCoords);
    } catch (error) {
      console.error('Error getting location:', error);
      setUserLocation([35.1899, 32.2200]); 
    }
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestMidwife = () => {
    if (!userLocation) return null;
    
    let nearest = null;
    let minDistance = Infinity;

    MIDWIVES_LOCATIONS.forEach(midwife => {
      const distance = calculateDistance(userLocation, midwife.coordinate);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...midwife, distance };
      }
    });

    return nearest;
  };

  const handleMidwifePress = (midwife) => {
    const distance = calculateDistance(userLocation, midwife.coordinate);
    setSelectedMidwife({ ...midwife, distance });
    setShowMidwifeDetails(true);
  };

  const handleSOSPress = () => {
    if (!userLocation) {
      Alert.alert('خطأ', 'لا يمكن تحديد موقعك الحالي');
      return;
    }

    const nearest = findNearestMidwife();
    if (nearest) {
      setNearestMidwife(nearest);
      setIsEmergencyActive(true);
      
      Alert.alert(
        'تم إرسال طلب الطوارئ',
        `تم إرسال إشعار طوارئ إلى ${nearest.name}\n` +
        `المسافة: ${nearest.distance.toFixed(2)} كم\n` +
        `سيتم التواصل معك قريباً`,
        [
          {
            text: 'موافق',
            onPress: () => {
              setTimeout(() => {
                Alert.alert(
                  'استجابة من القابلة',
                  `${nearest.name} قبلت الحالة وستصل خلال ${Math.ceil(nearest.distance * 10)} دقائق`
                );
              }, 3000);
            }
          }
        ]
      );
    }
  };

  const handleCallShabakShabab = () => {
    Alert.alert(
      'اتصال بشباك الشباب',
      'هل تريدين الاتصال بخط شباك الشباب والحصول على الاستشارة من القابلة القانونية؟\nالخط مجاني ومتوفر 24/7',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'اتصال',
          onPress: () => {
            Alert.alert('جاري الاتصال...', 'يتم توصيلك بشباك الشباب للدعم والمساعدة');
          }
        }
      ]
    );
  };

  const handleCancelEmergency = () => {
    setIsEmergencyActive(false);
    setNearestMidwife(null);
    Alert.alert('تم إلغاء الطوارئ', 'تم إلغاء حالة الطوارئ بنجاح');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8C00" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>قابلة عَ الطريق</Text>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView style={styles.map}>
          <MapboxGL.Camera
            zoomLevel={15}
            centerCoordinate={userLocation || [35.1899, 32.2200]}
          />
          
          {/* Midwives Markers */}
          {MIDWIVES_LOCATIONS.map((midwife) => (
            <MapboxGL.PointAnnotation
              key={midwife.id}
              id={`midwife-${midwife.id}`}
              coordinate={midwife.coordinate}
              onSelected={() => handleMidwifePress(midwife)}
            >
              <TouchableOpacity
                style={[
                  styles.midwifeMarker,
                  // بس لو في طوارئ نشطة وهاي هي الأقرب
                  isEmergencyActive && nearestMidwife?.id === midwife.id ? styles.nearestMidwifeMarker : null
                ]}
                onPress={() => handleMidwifePress(midwife)}
              >
                <Text style={styles.markerText}>👩‍⚕</Text>
              </TouchableOpacity>

            </MapboxGL.PointAnnotation>
          ))}

          {/* User Marker */}
          {/* عرض موقع المستخدم */}
          {userLocation && (
            <MapboxGL.PointAnnotation
              id="user-location"
              coordinate={userLocation}
            >
              <View style={styles.userMarker}>
                <Text style={styles.markerText}>🤰</Text>
              </View>
            </MapboxGL.PointAnnotation>
          )}


          {/* Route Line */}
          {isEmergencyActive && nearestMidwife && userLocation && (
            <MapboxGL.ShapeSource
              id="route"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [userLocation, nearestMidwife.coordinate]
                }
              }}
            >
              <MapboxGL.LineLayer
                id="routeLine"
                style={{
                  lineColor: '#ff4444',
                  lineWidth: 3,
                  lineDasharray: [2, 2]
                }}
              />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>

        {/* SOS Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
          <Text style={styles.sosButtonText}>🚨 SOS </Text>
        </TouchableOpacity>


        {/* Nearest Midwife Info */}
        {isEmergencyActive && nearestMidwife && (
          <View style={styles.nearestMidwifeInfo}>
            <Text style={styles.nearestMidwifeTitle}>القابلة المختارة:</Text>
            <Text style={styles.nearestMidwifeName}>{nearestMidwife.name}</Text>
            <Text style={styles.nearestMidwifeDistance}>
              المسافة: {nearestMidwife.distance.toFixed(2)} كم
            </Text>
            <TouchableOpacity 
              style={styles.cancelEmergencyButton}
              onPress={handleCancelEmergency}
            >
              <Text style={styles.cancelEmergencyText}>إلغاء الطوارئ</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Call Shabak Shabab Button (Circular and in Top-Right corner) */}
        <TouchableOpacity style={styles.shabakButton} onPress={handleCallShabakShabab}>
          <Text style={styles.shabakButtonText}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Midwife Details */}
      <Modal
        visible={showMidwifeDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMidwifeDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMidwife && (
              <>
                <Text style={styles.modalTitle}>{selectedMidwife.name}</Text>
                <Text style={styles.modalDetail}>⏱ {selectedMidwife.experience}</Text>
                <Text style={styles.modalDetail}>🏥 {selectedMidwife.specialty}</Text>
                <Text style={styles.modalDetail}>
                  📍 المسافة: {selectedMidwife.distance?.toFixed(2)} كم
                </Text>
                
                <View style={styles.modalButtons}>
                  
 
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowMidwifeDetails(false)}
                  >
                    <Text style={styles.closeButtonText}>إغلاق</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF8C00', paddingVertical: 15, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  sosButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sosButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  midwifeMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  nearestMidwifeMarker: {
    backgroundColor: '#FF8C00',
    borderColor: '#FFD700',
    borderWidth: 3,
    transform: [{ scale: 1.2 }],
  },
  userMarker: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  nearestMidwifeInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },markerText: {
  fontSize: 24,  // زيادة حجم الخط هنا
  textAlign: 'center',
  color: 'white', // أو أي لون تفضله
},
  nearestMidwifeTitle: { fontSize: 12, fontWeight: 'bold', color: '#ff4444' },
  nearestMidwifeName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginVertical: 2 },
  nearestMidwifeDistance: { fontSize: 12, color: '#FF8C00', fontWeight: 'bold' },
  cancelEmergencyButton: { backgroundColor: '#ff4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, marginTop: 5 },
  cancelEmergencyText: { color: 'white', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  shabakButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 50,  // دائرية
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  shabakButtonText: { color: 'white', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 15, margin: 20, alignItems: 'center', minWidth: 300 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  modalDetail: { fontSize: 14, color: '#666', marginBottom: 8, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-around', width: '100%' },
  callButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, flex: 1, marginRight: 10 },
  callButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  closeButton: { backgroundColor: '#ccc', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, flex: 1, marginLeft: 10 },
  closeButtonText: { color: '#333', fontWeight: 'bold', textAlign: 'center' },
});

export default MapScreen;
