// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';

import MapScreen from './MapScreen'; // Main Map Screen
import HomeScreen from './screens/HomeScreen'; // Mock Home Screen
import ArticlesScreen from './screens/ArticlesScreen'; // Mock Articles Screen
import NotificationsScreen from './screens/NotificationsScreen'; // Mock Notifications Screen
import FAQScreen from './screens/FAQScreen'; // Mock FAQ Screen

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            // Define icons for each tab
            if (route.name === 'Home') {
              return <FontAwesome name="home" size={size} color={color} />;
            } else if (route.name === 'Map') {
              return <Ionicons name="map" size={size} color={color} />;
            } else if (route.name === 'Articles') {
              return <MaterialIcons name="article" size={size} color={color} />;
            } else if (route.name === 'Notifications') {
              return <Ionicons name="notifications" size={size} color={color} />;
            } else if (route.name === 'FAQ') {
              return <Ionicons name="help-circle" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: '#FF8C00', // Active tab color
          tabBarInactiveTintColor: 'gray', // Inactive tab color
          headerShown: false, // Hide header for all screens
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Articles" component={ArticlesScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="FAQ" component={FAQScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
