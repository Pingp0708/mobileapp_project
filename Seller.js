import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { db } from '../firebase'; // Ensure this is correctly set up
import { collection, onSnapshot, query, where, updateDoc, doc, deleteDoc ,getDocs} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { AntDesign } from '@expo/vector-icons';

const Seller = ({ navigation, route }) => {
    const [foodDetails, setFoodDetails] = useState([]);
    const { rest_ID } = route.params;

    const fetchFoodDetails = async (food_ID) => {
        try {
            const q = query(
                collection(db, 'listFood'),
                where('food_ID', '==', food_ID),
                where('rest_ID', '==', rest_ID)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0] || null;
        } catch (error) {
            console.error('Error fetching food details:', error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, 'orderFood'), where('rest_ID', '==', rest_ID)), async (orderSnapshot) => {
            const orders = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const foodDetailsPromises = orders.map(async (order) => {
                const foodDetails = await fetchFoodDetails(order.food_ID);
                return { ...order, foodDetails };
            });

            const foodDetailsArray = await Promise.all(foodDetailsPromises);
            foodDetailsArray.sort((a, b) => {
                const orderA = a.order_ID ? parseInt(a.order_ID) : 0; 
                const orderB = b.order_ID ? parseInt(b.order_ID) : 0; 
                return orderA - orderB; // เปรียบเทียบหมายเลข
            });
            

            setFoodDetails(foodDetailsArray);
        });

        return () => unsubscribe(); 
    }, [rest_ID]);

    const handleOrderAction = async (orderId, currentStatus, order_ID, foodname) => {
        try {
            const orderRef = doc(db, 'orderFood', orderId);
            let newStatus;

            if (currentStatus === 'Unconfirmed') {
                newStatus = 'Preparing Food';
            } else if (currentStatus === 'Preparing Food') {
                newStatus = 'Food Ready';
            } else if (currentStatus === 'Food Ready') {
                await deleteOrder(orderId);
                return;
            }

            await updateDoc(orderRef, { status: newStatus });
            Toast.show({
                text1: `ออเดอร์ ID : ${order_ID}  ${foodname}`,
                text2: `สถานะ : ${newStatus}`,
                position: 'top',
                visibilityTime: 3000,
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            Toast.show({
                text1: 'เกิดข้อผิดพลาด',
                text2: 'ไม่สามารถอัปเดตสถานะได้',
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            const orderRef = doc(db, 'orderFood', orderId);
            await deleteDoc(orderRef);
            Toast.show({
                text1: 'ออเดอร์เสร็จสิ้น',
                position: 'top',
                visibilityTime: 3000,
            });
        } catch (error) {
            console.error('Error deleting order:', error);
            Toast.show({
                text1: 'เกิดข้อผิดพลาด',
                text2: 'ไม่สามารถลบออเดอร์ได้',
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    const handleGoBackToMenu = () => {
        navigation.goBack();
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleLogout}>
                    <AntDesign name="logout" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>จัดการออเดอร์</Text>
                <TouchableOpacity onPress={handleGoBackToMenu}>
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
                                            <Text style={{ textAlign: 'right', marginRight: '3%' }}> สถานะ : {item.status}</Text>
                                        </View>
                                        <Text>เมนู : {item.foodDetails.food_name} x1</Text>
                                        <Text>ราคา : {item.foodDetails.food_price} บาท</Text>
                                        <TouchableOpacity 
                                            style={styles.confirmButton} 
                                            onPress={() => handleOrderAction(item.id, item.status, item.order_ID, item.foodDetails.food_name)}
                                        >
                                            <Text style={styles.confirmButtonText}>
                                                {item.status === 'Food Ready' ? 'Picked up' : item.status === 'Unconfirmed' ? 'Confirm' : 'Food Ready'}
                                            </Text>
                                        </TouchableOpacity>
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
        marginTop:60,
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
    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyCartText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
        color: '#888',
    },
});

export default Seller;
