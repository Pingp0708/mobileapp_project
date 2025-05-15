import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RestaurantList from './screens/RestaurantList'; 
import Menu from './screens/Menu'; 
import Cart from './screens/Cart';
import Status from './screens/Status';
import Seller from './screens/Seller';
import LoginApp from './screens/LoginApp';
import StartApp from './screens/StartApp';
import { CartProvider } from './screens/CartContext';


const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const RenderLoginApp = (props) => {
    return <LoginApp {...props} setIsLoggedIn={setIsLoggedIn} />;
  };

  return (
    <CartProvider>
    <NavigationContainer>
   
      <Stack.Navigator initialRouteName="StartApp">
      <Stack.Screen name="StartApp" component={StartApp} options={{ headerShown: false }} />
        <Stack.Screen name="LoginApp" options={{ headerShown: false }} component={RenderLoginApp}
        />
        {isLoggedIn && ( 
          <>
            <Stack.Screen name="RestaurantList" component={RestaurantList} options={{ headerShown: false }} />
            <Stack.Screen name="Menu" component={Menu} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
            <Stack.Screen name="Status" component={Status} options={{ headerShown: false }} />
            <Stack.Screen name="Seller" component={Seller} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </CartProvider>
  );
};

export default App;