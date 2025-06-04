import React, { useState, useEffect, useContext } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Sửa import Icon
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from './config/AuthContext';
import LogoutScreen from "./components/User/LogoutScreen";

// Import screens
import Home from "./components/Home/Home";
import LoginScreen from "./components/User/LoginScreen";
import RegisterScreen from "./components/User/RegisterScreen";
import RoleSelectScreen from "./components/User/RoleSelectScreen";
import AdminVerifyScreen from "./components/User/AdminVerifyScreen";
import CreateEventScreen from "./components/Organizer/CreateEventScreen";
import MyEventsScreen from "./components/Organizer/MyEventsScreen";
import EventEditScreen from "./components/Organizer/EventEditScreen";
import EventDetailsScreen from "./components/Home/EventDetailsScreen";
import TicketBookingScreen from "./components/Home/TicketBookingScreen";
import MyTicketsScreen from "./components/Home/MyTicketsScreen";
import TicketDetailsScreen from "./components/Home/TicketDetailsScreen";
import ScanTicketScreen from "./components/Home/ScanTicketScreen";
import ReviewScreen from "./components/Home/ReviewScreen";
import ReplyReviewScreen from "./components/Home/ReplyReviewScreen";
import NotificationScreen from "./components/Home/NotificationScreen";
import StatisticsScreen from "./components/Home/StatisticsScreen";
import RequestOrganizerScreen from './components/Organizer/RequestOrganizerScreen';
import EventApprovalScreen from './components/User/EventApprovalScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="Home" component={Home} options={{ title: "Sự kiện" }} />
    <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: "Chi tiết sự kiện" }} />
    <Stack.Screen name="TicketBooking" component={TicketBookingScreen} options={{ title: "Đặt vé" }} />
    <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} options={{ title: "Chi tiết vé" }} />
    <Stack.Screen name="Review" component={ReviewScreen} options={{ title: "Đánh giá sự kiện" }} />
    <Stack.Screen name="ReplyReview" component={ReplyReviewScreen} options={{ title: "Phản hồi đánh giá" }} />
  </Stack.Navigator>
);

const App = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  let role = "user";
  if (user?.is_superuser) role = "admin";
  else if (user?.is_organizer) role = "organizer";

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarLabelStyle: { fontSize: 13 },
          tabBarActiveTintColor: "#2196f3",
        }}
      >
        {/* Tab Sự kiện: Hiển thị cho tất cả vai trò */}
        <Tab.Screen
          name="Main"
          component={MainStack}
          options={{
            title: "Sự kiện",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-outline" color={color} size={size} />
            ),
          }}
        />

        {/* Tab Đăng nhập: Chỉ hiển thị khi chưa đăng nhập */}
        {!user && (
          <Tab.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: "Đăng nhập",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar" color={color} size={size} />
              ),
            }}
          />
        )}

        {/* Tab Đăng ký: Chỉ hiển thị khi chưa đăng nhập */}
        {!user && (
          <Tab.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: "Đăng kí",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account-plus" color={color} size={size} />
              ),
            }}
          />
        )}

        {/* Tab Tạo sự kiện: Chỉ hiển thị cho organizer */}
        {role === "organizer" && (
          <Tab.Screen
            name="Tạo sự kiện"
            component={CreateEventScreen}
            options={{
              title: "Tạo sự kiện",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-plus" color={color} size={size} />
              ),
            }}
          />
        )}

        {/* Tab Sự kiện của tôi: Chỉ hiển thị cho organizer */}
        {role === "organizer" && (
          <Tab.Screen
            name="Sự kiện của tôi"
            component={MyEventsScreen}
            options={{
              title: "Sự kiện của tôi",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-account" color={color} size={size} />
              ),
            }}
          />
        )}

        {/* Tab Quét vé: Chỉ hiển thị cho organizer */}
        {user && (role === "user" && (
          <Tab.Screen
            name="requestOrganizer"
            component={RequestOrganizerScreen}
            options={{
              title: "Yêu cầu NTC",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="file-document-edit" color={color} size={size} />
              ),
            }}
          />
        ))}

        {/* Tab Vé của tôi: Hiển thị cho user và organizer */}
        {user && ((role === "user" || role === "organizer") && (
          <Tab.Screen
            name="MyTickets"
            component={MyTicketsScreen}
            options={{
              title: "Vé của tôi",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="ticket" color={color} size={size} />
              ),
            }}
          />
        ))}

        {/* Tab Quét vé: Chỉ hiển thị cho organizer */}
        {role === "organizer" && (
          <Tab.Screen
            name="Quét vé"
            component={ScanTicketScreen}
            options={{
              title: "Quét vé",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="qrcode-scan" color={color} size={size} />
              ),
            }}
          />
        )}

        {/* Tab Thông báo: Hiển thị cho user và organizer */}
        {(role === "user" || role === "organizer") && (
          <Tab.Screen
            name="Thông báo"
            component={NotificationScreen}
            options={{
              title: "Thông báo",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="bell" color={color} size={size} />
              ),
            }}
          />
        )}

        {/* Tab Thống kê: Chỉ hiển thị cho organizer */}
        {role === "organizer" && (
          <Tab.Screen
            name="Thống kê"
            component={StatisticsScreen}
            options={{
              title: "Thống kê",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
              ),
            }}
          />
        )}

        {role === "admin" && (
          <Tab.Screen
            name="Duyệt sự kiện"
            component={EventApprovalScreen}
            options={{
              title: "Duyệt sự kiện",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
              ),
            }}
          />
        )}

        {/* Tab Duyệt yêu cầu: Chỉ hiển thị cho admin */}
        {role === "admin" && (
          <Tab.Screen
            name="Duyệt yêu cầu"
            component={AdminVerifyScreen}
            options={{
              title: "Duyệt yêu cầu",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="check-circle" color={color} size={size} />
              ),
            }}
          />
        )}

        {user && (
          <Tab.Screen
            name="Logout"
            component={LogoutScreen}
            options={{
              title: "Đăng xuất",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="logout" color={color} size={size} />
              ),
            }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;