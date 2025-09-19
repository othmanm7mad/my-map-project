import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ArticlesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Articles Screen</Text>
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

export default ArticlesScreen;