import React, { useEffect, useRef } from 'react';
import { View, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const StartApp = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const navigation = useNavigation();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000, 
        useNativeDriver: true,
      }),
      Animated.delay(1500) 
    ]).start(() => {
      navigation.replace('LoginApp');
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../Logo/RONGCHANG.jpg')}
        style={[styles.logo, { opacity: fadeAnim }]} 
      />
    </View>
  );
};



export default StartApp;
