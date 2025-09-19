import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FAQScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>FAQ Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FAQScreen;