// MapScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps'
import Constants from 'expo-constants';

const { MAPBOX_TOKEN } = Constants.expoConfig.extra;

// استبدل هذا بـ الـ access token الخاص بك
MapboxGL.setAccessToken(MAPBOX_TOKEN);

const MapScreen = () => {
  useEffect(() => {
    // يمكن إضافة أي إعدادات إضافية إذا لزم الأمر
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          zoomLevel={16}
          centerCoordinate={[35.18991,31.9430105 ]} // إحداثيات المركز (خط العرض والطول)
          
        />
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapScreen;