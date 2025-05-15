import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { db } from '../firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import IconF from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

const Status = ({ navigation }) => {
    const [foodDetails, setFoodDetails] = useState([]);
    const [updatedOrder, setUpdatedOrder] = useState(null);
    const [foodName, setFoodName] = useState('');

    const fetchOrderDetails = () => {
        const orderCollection = collection(db, 'orderFood');
        onSnapshot(orderCollection, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const foodDetailsPromises = orders.map(async (order) => {
                const foodDetail = await fetchFoodDetails(order.food_ID);
                return { ...order, foodDetails: foodDetail };
            });
    
            Promise.all(foodDetailsPromises).then((foodDetailsArray) => {
                foodDetailsArray.sort((a, b) => a.order_ID - b.order_ID);
                setFoodDetails(foodDetailsArray);
                
                snapshot.docChanges().forEach(change => {
                    if (change.type === "modified") {
                        const order = change.doc.data();
                        setUpdatedOrder(order);
                        const updatedFoodDetail = foodDetailsArray.find(item => item.id === change.doc.id);
                        if (updatedFoodDetail && updatedFoodDetail.foodDetails) {
                            setFoodName(updatedFoodDetail.foodDetails.food_name);
                        }
                    }
                });
            });
        });
    };

    const fetchFoodDetails = async (food_ID) => {
        try {
            const q = query(collection(db, 'listFood'), where('food_ID', '==', food_ID));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0] || null;
        } catch (error) {
            console.error('Error fetching food details:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    useEffect(() => {
        if (updatedOrder && updatedOrder.order_ID && updatedOrder.status) {
            Toast.show({
                text1: `ออเดอร์ ID : ${updatedOrder.order_ID} ${foodName}`,
                text2: `สถานะ : ${updatedOrder.status}`,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    }, [updatedOrder, foodName]); 

    const handleGoBackToMenu = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity  onPress ={() => navigation.navigate('RestaurantList')}>
                    <IconF name="map" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>สถานะเมนู</Text>
                <TouchableOpacity>
                    <Icon name="chevron-right" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {foodDetails.length > 0 ? (
                    foodDetails.map((item) => (
                        <View key={item.id} style={styles.cartItem}>
                            {item.foodDetails ? (
                                <>
                                    <Image source={{ uri: `https://drive.google.com/uc?export=view&id=${item.foodDetails.food_picture}` }} style={styles.foodImage} />
                                    <View style={styles.foodInfo}>
                                        <View style={styles.row}>
                                            <Text>ออเดอร์ ID : {item.order_ID}</Text>
                                            <Text style={{ marginLeft: 'auto' }}>สถานะ : {item.status}</Text>
                                        </View>
                                        <Text>{item.foodDetails.food_name} x1</Text>
                                        <Text>{item.foodDetails.food_price} บาท</Text>
                                    </View>
                                </>
                            ) : (
                                <Text style={styles.emptyCartText}>ไม่พบข้อมูลอาหาร</Text>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyCartText}>ยังไม่มีออเดอร์</Text>
                )}
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
        paddingTop: 0,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginTop: 60,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContainer: {
        padding: 10,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    foodImage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginLeft: '3%',
    },
    foodInfo: {
        flex: 1,
        marginLeft: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    emptyCartText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
        color: '#888',
    },
});

export default Status;
