import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; 
import { useCart } from './CartContext';
import Toast from 'react-native-toast-message';
import IconE from 'react-native-vector-icons/Entypo';

const Menu = ({ route, navigation }) => {
  const { rest_ID } = route.params; 
  const [foodItems, setFoodItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { cart, setCart } = useCart();

  const fetchFoodItems = async () => {
    setLoading(true); 
    try {
      const q = query(collection(db, 'listFood'), where('rest_ID', '==', rest_ID)); 
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFoodItems(items);
    } catch (error) {
      console.error('Error fetching food items:', error);
      Toast.show({
        text1: 'เกิดข้อผิดพลาด',
        text2: 'ไม่สามารถดึงข้อมูลรายการอาหารได้',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurant = async () => {
    try {
      const q = query(collection(db, 'restaurant'), where('rest_ID', '==', rest_ID)); 
      const querySnapshot = await getDocs(q); 
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRestaurant(items[0] || null);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      Toast.show({
        text1: 'เกิดข้อผิดพลาด',
        text2: 'ไม่สามารถดึงข้อมูลร้านได้',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    fetchFoodItems(); 
    fetchRestaurant(); 
  }, [rest_ID]);

  const filteredFoodItems = foodItems.filter(item => 
    item.food_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    setCart([...cart, item]);
    Toast.show({
      text1: `${item.food_name}`,
      text2: `ถูกเพิ่มลงในตะกร้าแล้ว!`,
      type: 'success',
      position: 'top',
      visibilityTime: 3000,
    });
  }


  const goToCart = () => {
    navigation.navigate('Cart'); 
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('RestaurantList')}>
          <IconE name="chevron-with-circle-left" size={24} color="black" />
        </TouchableOpacity>
        {restaurant && (<Text style={styles.headerTitle}>{restaurant.rest_name}</Text>)} 
        <TouchableOpacity onPress={goToCart}>
          <Icon name="shopping-basket" size={24} color="black" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

    
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาเมนู..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

 
      <ScrollView style={styles.scrollView}>
        <Text style={styles.itemCountText}>ทั้งหมด {filteredFoodItems.length} รายการ</Text>
        <View style={styles.foodList}>
          {filteredFoodItems.map((item) => (
            <View key={item.id} style={styles.foodCard}>
              <Image source={{ uri: `https://drive.google.com/uc?export=view&id=${item.food_picture}` }} style={styles.foodImage} />
              <Text style={styles.foodName}>{item.food_name}</Text>
              <Text style={styles.foodPrice}>{item.food_price} บาท</Text>
              <TouchableOpacity style={styles.orderButton} onPress={() => addToCart(item)}>
                <Text style={styles.orderButtonText}>เพิ่มออเดอร์</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <Toast position='top' topOffset={70} />
    </SafeAreaView>
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
    paddingTop:60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 20,
    backgroundColor: '#f9f9f9',
    height:40
  },
  searchInput: {
    flex: 1,
    paddingLeft: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemCountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  foodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  foodImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  foodPrice: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  orderButton: {
    backgroundColor: '#FF5C00',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Menu;
