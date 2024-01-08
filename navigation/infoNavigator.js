import { createStackNavigator } from '@react-navigation/stack';
import UserDetail from '../screens/UserDetail';
import HomeScreen from '../screens/HomeScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function InfoStack() {
    return (
     <Drawer.Navigator initialRouteName="Home">
       <Drawer.Screen name="Home" component={HomeScreen} />
       <Drawer.Screen name="UserDetail" component={UserDetail} />
     </Drawer.Navigator>
    );
   }
   
