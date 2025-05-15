import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { collection, addDoc, getDocs, orderBy, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import IconE from 'react-native-vector-icons/Entypo';
import IconA from 'react-native-vector-icons/AntDesign';
import { useCart } from './CartContext'; 
import Toast from 'react-native-toast-message';

const Cart = ({ navigation }) => {
  const { cart, setCart } = useCart(); 
  const [localCart, setLocalCart] = useState(cart);
  const [restaurantNames, setRestaurantNames] = useState({});

  useEffect(() => {
    const fetchRestaurantNames = async () => {
      const restaurantPromises = localCart.map(async (item) => {
        const restaurantRef = collection(db, 'restaurant');
        const restaurantQuery = query(restaurantRef, where('rest_ID', '==', item.rest_ID));
        const restaurantSnapshot = await getDocs(restaurantQuery);
        
        if (!restaurantSnapshot.empty) {
          const restaurantData = restaurantSnapshot.docs[0].data();
          return { rest_ID: item.rest_ID, rest_name: restaurantData.rest_name };
        }
        
        return { rest_ID: item.rest_ID, rest_name: 'Unknown Restaurant' };
      });

      const names = await Promise.all(restaurantPromises);
      const nameMap = names.reduce((acc, { rest_ID, rest_name }) => {
        acc[rest_ID] = rest_name;
        return acc;
      }, {});

      setRestaurantNames(nameMap);
    };

    fetchRestaurantNames();
  }, [localCart]); 

  
  const subscribeToOrderUpdates = () => {
    const orderQuery = query(collection(db, 'orderFood'));
    return onSnapshot(orderQuery, (snapshot) => {
     
      const updatedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(updatedOrders); 
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToOrderUpdates();
    return () => unsubscribe(); 
  }, []);

  const removeFromCart = (indexToRemove, item) => {
    const updatedCart =   filter((_, index) => index !== indexToRemove);
    

    setLocalCart(updatedCart);
    Toast.show({
      text1: `${item.food_name}`, 
      text2: `ถูกลบออกจากตะกร้าแล้ว!`, 
      type: 'success', 
      position: 'top', 
      visibilityTime: 3000, 
    });

    
    setCart(updatedCart);
  };

  const handleOrderConfirm = async () => {
    try {
      const orderQuery = query(collection(db, 'orderFood'), orderBy('order_ID', 'desc'));
      const orderSnapshot = await getDocs(orderQuery);
      const lastOrderID = orderSnapshot.docs.length > 0 ? orderSnapshot.docs[0].data().order_ID : 0;
      const newOrderID = lastOrderID + 1;

      const orderPromises = localCart.map(async (item) => {
        await addDoc(collection(db, 'orderFood'), {
          food_ID: item.food_ID,
          rest_ID: item.rest_ID,
          order_ID: newOrderID,
          status: 'Unconfirmed',
        });
      });

      await Promise.all(orderPromises);
      Alert.alert('ยืนยันออเดอร์สำเร็จ', 'กำลังเตรียมอาหาร โปรดติดตามสถานะ');
      setLocalCart([]); 
      setCart([]); 
      goToStatus();
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  const goToStatus = () => {
    navigation.navigate('Status');
  };

  const handleGoBackToMenu = () => {
    navigation.goBack();
  };

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={handleGoBackToMenu}>
                    <IconE name="chevron-with-circle-left" size={24} color="black" />
                </TouchableOpacity>
        <Text style={styles.headerTitle}>ตะกร้าเมนู</Text>
        <TouchableOpacity onPress={goToStatus}>
          <IconA name="clockcircleo" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cartList}>
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Image 
                source={{ uri: `https://drive.google.com/uc?export=view&id=${item.food_picture}` }} 
                style={styles.foodImage} 
              />
              <View style={styles.foodInfo}>
                <Text style={{ marginTop: '-20%',marginLeft:-15, paddingBottom: '15%' }}>
                  {restaurantNames[item.rest_ID] || 'กำลังโหลด...'}
                </Text>
                <Text>{item.food_name} x1</Text>
                <Text>{item.food_price} บาท</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(index, item)}>
                <Text style={styles.removeButton}>ลบเมนู</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyCartText}>ตะกร้าของคุณว่างเปล่า</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleOrderConfirm}
          disabled={cart.length === 0}
        >
          <Text style={styles.confirmButtonText}>ยืนยันออเดอร์</Text>
        </TouchableOpacity>
      </View>
      <Toast position='top' topOffset={70} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
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
  cartList: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: '1%',
  },
  foodImage: {
    width: 150,
    height: 150,
    borderRadius: 5,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 30,
  },
  removeButton: {
    color: 'red',
    fontWeight: 'bold',
    padding: 15,
    borderRadius: 10,
  },
  emptyCartText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
  },
  footer: {
    padding: 10,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginLeft: '20%',
    marginRight: '20%',
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Cart;
