// MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, StatusBar, SafeAreaView, Modal, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
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
    coordinate: [35.1910, 32.2210],
    experience: "5 سنوات خبرة",
    specialty: "متخصصة في الولادة الطبيعية"
  },
  {
    id: 2,
    name: "القابلة فاطمة محمد",
    coordinate: [35.1885, 32.2190],
    experience: "8 سنوات خبرة",
    specialty: "متخصصة في رعاية الأمومة"
  },
  {
    id: 3,
    name: "القابلة مريم خالد",
    coordinate: [35.1915, 32.2185],
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FF8C00',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Add padding for Android
      }}
    >
      <StatusBar backgroundColor="#FF8C00" barStyle="light-content" />
      {/* Main Content */}
      <View style={styles.container}>
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

            {/* Midwives Locations */}
            {MIDWIVES_LOCATIONS.map((midwife) => (
              <MapboxGL.PointAnnotation
                key={midwife.id}
                id={`midwife-${midwife.id}`}
                coordinate={midwife.coordinate}
                onSelected={() => handleMidwifePress(midwife)}
              >
                <TouchableOpacity
                  style={styles.midwifeMarker}
                  onPress={() => handleMidwifePress(midwife)}
                >
                  <Text style={styles.markerText}>👩‍⚕️</Text>
                </TouchableOpacity>
              </MapboxGL.PointAnnotation>
            ))}

            {/* User Location */}
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
          </MapboxGL.MapView>

          {/* SOS Button */}
          <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
            <Text style={styles.sosButtonText}>🚨 SOS </Text>
          </TouchableOpacity>

          {/* Shabak Button */}
          <TouchableOpacity style={styles.shabakButton} onPress={handleCallShabakShabab}>
            <Text style={styles.shabakButtonText}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  sosButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sosButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  midwifeMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    fontSize: 16,
  },
  nearestMidwifeInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  nearestMidwifeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  nearestMidwifeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
  },
  nearestMidwifeDistance: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  cancelEmergencyButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 5,
  },
  cancelEmergencyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shabakButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  shabakButtonText: {
    fontSize: 20,
    color: 'white',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FF8C00',
    paddingVertical: 10,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  activeNav: {
    alignItems: 'center',
    marginTop: -10,
  },
  activeNavButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeNavIcon: {
    fontSize: 24,
  },
  activeNavText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapScreen;
