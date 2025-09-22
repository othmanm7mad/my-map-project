// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, MaterialIcons, Ionicons, Fontisto } from '@expo/vector-icons';

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
            // تحديد حجم ثابت لجميع الأيقونات
            const iconSize = 28; // يمكنك تغيير هذا الرقم حسب الحجم المطلوب
            
            // Define icons for each tab
            if (route.name === 'الرئيسية') {
              return <FontAwesome name="home" size={iconSize} color={color} />;
            } else if (route.name === 'قابلة عَ الطريق') {
              return <Fontisto name="nurse" size={iconSize} color={color} />;
            } else if (route.name === 'المقالات') {
              return <MaterialIcons name="article" size={iconSize} color={color} />;
            } else if (route.name === 'الإشعارات') {
              return <Ionicons name="notifications" size={iconSize} color={color} />;
            } else if (route.name === 'أسئلة شائعة') {
              return <Ionicons name="help-circle" size={iconSize} color={color} />;
            }
          },
          tabBarActiveTintColor: 'white', // الأيقونات النشطة بيضاء
          tabBarInactiveTintColor: '#e4eceb', // الأيقونات غير النشطة برتقالي فاتح
          headerShown: false, // Hide header for all screens
          tabBarStyle: {
            backgroundColor: '#ffae42', // خلفية التاب بار برتقالية
          },
        })}
      >
        <Tab.Screen name="الرئيسية" component={HomeScreen} />
        <Tab.Screen name="المقالات" component={ArticlesScreen} />
        <Tab.Screen name="الإشعارات" component={NotificationsScreen} />
        <Tab.Screen name="أسئلة شائعة" component={FAQScreen} />
        <Tab.Screen name="قابلة عَ الطريق" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;