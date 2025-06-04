import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import { Alert } from "react-native";
import { AuthContext } from "../../config/AuthContext";

const screenWidth = Dimensions.get("window").width;

const StatisticsScreen = () => {
  const [stats, setStats] = useState(null);
  const { token } = useContext(AuthContext);

  const loadStats = async () => {
    try {
      const res = await authApis(token).get(endpoints.statistics);
      setStats(res.data);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải thống kê");
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    return <View style={MyStyles.container}><Text>Đang tải...</Text></View>;
  }

  const ticketData = {
    labels: stats.tickets?.map(t => t.event_name) || [],
    datasets: [{ data: stats.tickets?.map(t => t.quantity) || [] }],
  };

  const revenueData = {
    labels: stats.revenue?.map(r => r.event_name) || [],
    datasets: [{ data: stats.revenue?.map(r => r.total) || [] }],
  };

  const feedbackData = stats.feedback?.map(f => ({
    name: `Điểm ${f.rating}`,
    population: f.count,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  })) || [];

  return (
    <ScrollView style={MyStyles.container}>
      <Text style={MyStyles.title}>Thống kê</Text>
      <Text style={[MyStyles.subject, MyStyles.m]}>Vé đã bán</Text>
      <BarChart
        data={ticketData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={MyStyles.m}
      />
      <Text style={[MyStyles.subject, MyStyles.m]}>Doanh thu</Text>
      <BarChart
        data={revenueData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel="VNĐ "
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={MyStyles.m}
      />
      <Text style={[MyStyles.subject, MyStyles.m]}>Phản hồi</Text>
      <PieChart
        data={feedbackData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={MyStyles.m}
      />
    </ScrollView>
  );
};

export default StatisticsScreen;