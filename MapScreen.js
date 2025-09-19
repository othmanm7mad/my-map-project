// MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

const { MAPBOX_TOKEN } = Constants.expoConfig.extra;
MapboxGL.setAccessToken(MAPBOX_TOKEN);

// 3 مواقع قابلات ثابتة (إحداثيات نابلس ومناطق قريبة)
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

  // الحصول على الموقع الحالي
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
      // استخدام موقع افتراضي في حالة الخطأ
      setUserLocation([35.1899, 32.2211]);
    }
  };

  // حساب المسافة باستخدام Haversine formula
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // نصف قطر الأرض بالكيلومترات
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // المسافة بالكيلومترات
  };

  // إيجاد أقرب قابلة
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

  // زر الطوارئ SOS
  const handleSOSPress = () => {
    if (!userLocation) {
      Alert.alert('خطأ', 'لا يمكن تحديد موقعك الحالي');
      return;
    }

    const nearest = findNearestMidwife();
    if (nearest) {
      setNearestMidwife(nearest);
      
      // إرسال إشعار للقابلة الأقرب
      Alert.alert(
        'تم إرسال طلب الطوارئ',
        `تم إرسال إشعار طوارئ إلى ${nearest.name}\n` +
        `المسافة: ${nearest.distance.toFixed(2)} كم\n` +
        `سيتم التواصل معك قريباً`,
        [
          {
            text: 'موافق',
            onPress: () => {
              // محاكاة استجابة القابلة
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
    <View style={{ flex: 1 }}>
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

        {/* عرض أقرب قابلة إذا تم اختيارها */}
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

      {/* زر الطوارئ */}
      <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
        <Text style={styles.sosButtonText}>🚨 طوارئ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  sosButton: {
    position: 'absolute',
    bottom: 50,
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
});

export default MapScreen;