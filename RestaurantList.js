import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 
import { AntDesign } from '@expo/vector-icons'; // ติดตั้งไลบรารีไอคอนถ้ายังไม่ได้ติดตั้ง

const RestaurantList = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const scrollViewRef = useRef(null); // ใช้ useRef เพื่อสร้างอ้างอิงถึง ScrollView

  const fetchRestaurants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'restaurant')); 
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRestaurants(items);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "คุณต้องการออกจากระบบใช่ไหม?",
      [
        {
          text: "ยกเลิก",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { 
          text: "ออกจากระบบ", 
          onPress: () => navigation.navigate('LoginApp') 
        }
      ]
    );
  };

  useEffect(() => {
    fetchRestaurants(); 
  }, []);

  const handleMarkerPress = (restaurant) => {
    if (restaurant.status === 'open') {
      const cardIndex = restaurants.findIndex(r => r.rest_ID === restaurant.rest_ID);
      if (cardIndex !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: cardIndex * 180, animated: true });
      }
    } else {
      Alert.alert('ร้านอาหารปิด', 'ร้านอาหารนี้ไม่เปิดให้บริการในขณะนี้');
    }
  };

  const sortedRestaurants = restaurants
    .sort((a, b) => a.rest_ID - b.rest_ID) 
    .filter(restaurant => restaurant.status === 'close')
    .concat(restaurants.filter(restaurant => restaurant.status === 'open')); 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout}>
          <AntDesign name="logout" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>เลือกร้านอาหาร</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Status')}>
          <AntDesign name="clockcircleo" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 7.012036843304233, 
          longitude: 100.49920198695328,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
      >
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.rest_ID}
            coordinate={{
              latitude: restaurant.latitude, 
              longitude: restaurant.longitude, 
            }}
            onPress={() => handleMarkerPress(restaurant)} 
          >
            <View style={[styles.markerContainer, { backgroundColor: restaurant.status === 'open' ? 'lightgreen' : 'lightcoral' }]}>
              <Text style={styles.markerText}>{restaurant.rest_ID}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <ScrollView 
  horizontal 
  style={styles.restaurantScroll} 
  ref={scrollViewRef} 
>
  {[
    ...restaurants.filter(r => r.status === 'open').sort((a, b) => a.rest_ID - b.rest_ID),
    ...restaurants.filter(r => r.status === 'close').sort((a, b) => a.rest_ID - b.rest_ID)
  ].map((restaurant) => (
    <View key={restaurant.rest_ID} style={styles.card}>
      <Image 
        source={{ uri: `https://drive.google.com/uc?export=view&id=${restaurant.rest_picture}` }} 
        style={styles.image} 
      />
      <View style={styles.contentContainer}>
        <View style={[styles.restaurantIDContainer, { backgroundColor: restaurant.status === 'open' ? 'lightgreen' : 'lightcoral' }]}>
          <Text style={styles.restaurantIDText}>{restaurant.rest_ID}</Text>
        </View>
        <View style={styles.restaurantNameContainer}>
          <Text style={styles.restaurantName}>{restaurant.rest_name}</Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            if (restaurant.status === 'open') {
              navigation.navigate('Menu', { rest_ID: restaurant.rest_ID, rest_name: restaurant.rest_name });
            } else {
              Alert.alert('ร้านอาหารปิด', 'ร้านอาหารนี้ไม่เปิดให้บริการในขณะนี้');
            }
          }} 
        >
          <Text style={styles.buttonText}>{restaurant.status === 'close' ? 'ร้านปิด' : 'เลือก'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ))}
</ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    padding: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: 30,
    height: 30,
    alignItems: 'center',
  },
  markerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  restaurantScroll: {
    position: 'absolute',
    bottom: 30,
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    width: 180,
    height: 250, 
    marginRight: 25,
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    position: 'relative', 
    overflow: 'hidden', 
  },
  image: {
    width: '100%',
    height: '100%', 
    position: 'absolute', 
    top: 0,
    left: 0,
  },
  contentContainer: {
    position: 'relative', 
    zIndex: 1, 
    padding: 10, 
  },
  restaurantIDContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'gray', 
    borderRadius: 15,
    padding: 5,
    paddingHorizontal: 10,
  },
  restaurantIDText: {
    color: '#000',
    fontWeight: 'bold',
  },
  restaurantNameContainer: {
    backgroundColor: 'white',
    padding: 5,
    paddingHorizontal: 10,
    height: 30,
    bottom: 10,
    width: '113%',
    marginTop: 40,
    right: 10,
    borderRadius: 5, 
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4, 
    elevation: 3, 
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    backgroundColor: 'rgba(128, 128, 128, 0.9)',
    padding: 10,
    marginLeft: '50%',
    borderRadius: 15,
    marginTop: '73%',
    marginRight: '2%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RestaurantList;
