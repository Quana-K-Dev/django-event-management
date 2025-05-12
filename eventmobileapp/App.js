import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./components/Home/Home";
import { Icon } from "react-native-paper";

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="home"
          component={Home}
          options={{
            title: "Sự kiện",
            tabBarIcon: () => <Icon source="home" size={20} />,
          }}
        />
        {/* Thêm các màn hình khác như Profile, Login, v.v. */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;