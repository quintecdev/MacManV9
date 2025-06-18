// FullScreenImageView.tsx
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';

const FullScreenImageView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUrl } = route.params
  console.log({imageUrl})

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FullScreenImageView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 10,
  },
  backText: {
    color: 'white',
    fontSize: 20,
  },
});
