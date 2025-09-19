// MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, StatusBar, SafeAreaView } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

const { MAPBOX_TOKEN } = Constants.expoConfig.extra;
MapboxGL.setAccessToken(MAPBOX_TOKEN);

// 3 مواقع قابلات ثابتة
const MIDWIVES_LOCATIONS = [
  {
    id: 1,
    name: "القابلة سارة أحمد",
    coordinate: [35.1899, 32.2211],
    phone: "+970599123456"
  },
  {
    id: 2,
    name: "القابلة فاطمة محمد", 
    coordinate: [35.1950, 32.2180],
    phone: "+970599234567"
  },
  {
    id: 3,
    name: "القابلة مريم خالد",
    coordinate: [35.1850, 32.2250],
    phone: "+970599345678"
  }
];

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestMidwife, setNearestMidwife] = useState(null);

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
      setUserLocation([35.1899, 32.2211]);
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

  const handleSOSPress = () => {
    if (!userLocation) {
      Alert.alert('خطأ', 'لا يمكن تحديد موقعك الحالي');
      return;
    }

    const nearest = findNearestMidwife();
    if (nearest) {
      setNearestMidwife(nearest);
      
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
                  `${nearest.name} قبلت الحالة وستصل خلال ${Math.ceil(nearest.distance * 5)} دقائق`
                );
              }, 3000);
            }
          }
        ]
      );
    }
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
            zoomLevel={13}
            centerCoordinate={userLocation || [35.1899, 32.2211]}
          />
          
          {/* عرض مواقع القابلات */}
          {MIDWIVES_LOCATIONS.map(midwife => (
            <MapboxGL.PointAnnotation
              key={midwife.id}
              id={`midwife-${midwife.id}`}
              coordinate={midwife.coordinate}
            >
              <View style={styles.midwifeMarker}>
                <Text style={styles.markerText}>👩‍⚕️</Text>
              </View>
            </MapboxGL.PointAnnotation>
          ))}

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

          {/* عرض أقرب قابلة */}
          {nearestMidwife && (
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
                  lineColor: '#ff0000',
                  lineWidth: 3,
                  lineDasharray: [2, 2]
                }}
              />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>

        {/* زر الطوارئ داخل الخريطة */}
        <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
          <Text style={styles.sosButtonText}>🚨 طوارئ</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navText}>المقالات</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔔</Text>
          <Text style={styles.navText}>الإشعارات</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.activeNav]}>
          <View style={styles.activeNavButton}>
            <Text style={styles.activeNavIcon}>👩‍⚕️</Text>
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>قابلة عَ الطريق</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>❓</Text>
          <Text style={styles.navText}>أسئلة شائعة</Text>
        </TouchableOpacity>
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    margin: 0,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  sosButton: {
    position: 'absolute',
    bottom: 20,
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
  },
  userMarker: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    fontSize: 16,
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