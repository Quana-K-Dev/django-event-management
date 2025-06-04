import React, { useState, useEffect, useContext } from "react";
import { View, Text, Alert } from "react-native";
import { BarCodeScanner } from "expo-camera";
import { Button } from "react-native-paper";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import { AuthContext } from "../../config/AuthContext";

const ScanTicketScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const res = await authApis(token).post(endpoints.validateTicket(data.split("/").pop()), { qr_code: data });
      Alert.alert("Thành công", res.data.message);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", ex.response?.data?.detail || "Không thể xác minh vé");
    } finally {
      setTimeout(() => setScanned(false), 3000); // Allow scanning again after 3 seconds
    }
  };

  if (hasPermission === null) {
    return <View style={MyStyles.container}><Text>Đang yêu cầu quyền camera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={MyStyles.container}><Text>Không có quyền truy cập camera</Text></View>;
  }

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Quét mã QR vé</Text>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: 400, width: "100%" }}
      />
      <Button mode="contained" onPress={() => setScanned(false)} style={MyStyles.m} disabled={!scanned}>
        Quét lại
      </Button>
    </View>
  );
};

export default ScanTicketScreen;