import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,Image } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; 
import { AntDesign } from '@expo/vector-icons'; 

const LoginApp = ({ navigation, setIsLoggedIn }) => {  
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const q = query(collection(db, 'user'), where('username', '==', username), where('password', '==', password));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                Alert.alert(`Welcome ${userData.username}`, `Role: ${userData.role}`);
                
             
                setIsLoggedIn(true);

                if (userData.role === 'seller') {
                    navigation.navigate('Seller', { rest_ID: userData.rest_ID }); 
                } else if (userData.role === 'customer') {
                    navigation.navigate('RestaurantList');
                }
            } else {
                Alert.alert('Login Failed', 'Invalid username or password');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../Logo/RONGCHANG.jpg')} style={styles.logo} />
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>
                    <AntDesign name="logout" size={24} color="white" />
                    <Text>  </Text>
                    Login</Text>
            </TouchableOpacity>
        </View>
    );
};


export default LoginApp;
