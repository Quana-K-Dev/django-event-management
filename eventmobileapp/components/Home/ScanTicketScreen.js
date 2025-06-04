import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, Alert, Vibration, Dimensions, BackHandler } from "react-native";
import { BarCodeScanner } from "expo-camera";
import { Button, Card, IconButton, ProgressBar } from "react-native-paper";
import * as Camera from 'expo-camera';
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import { AuthContext } from "../../config/AuthContext";

const { width } = Dimensions.get('window');

const ScanTicketScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [flashOn, setFlashOn] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  // Handle back button to prevent accidental exits
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) {
        return true; // Prevent back during loading
      }
      return false;
    });

    return () => backHandler.remove();
  }, [loading]);

  // Focus/blur handlers to manage scanner lifecycle
  useEffect(() => {
    const unsubscribeFocus = navigation?.addListener('focus', () => {
      setIsActive(true);
      setScanned(false);
    });

    const unsubscribeBlur = navigation?.addListener('blur', () => {
      setIsActive(false);
    });

    return () => {
      unsubscribeFocus?.();
      unsubscribeBlur?.();
    };
  }, [navigation]);

  const requestCameraPermission = async () => {
    try {
      console.log("Requesting camera permission...");

      // Try using Camera.requestCameraPermissionsAsync() first
      let permissionResult;

      if (Camera.requestCameraPermissionsAsync) {
        permissionResult = await Camera.requestCameraPermissionsAsync();
      } else {
        // Fallback to BarCodeScanner method
        permissionResult = await BarCodeScanner.requestPermissionsAsync();
      }

      console.log("Permission result:", permissionResult);

      const granted = permissionResult.status === "granted";
      setHasPermission(granted);

      if (!granted) {
        console.log("Camera permission denied");
        Alert.alert(
          "Quyền camera bị từ chối",
          "Ứng dụng cần quyền camera để quét mã QR. Vui lòng cấp quyền trong cài đặt.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Thử lại", onPress: requestCameraPermission }
          ]
        );
      }
    } catch (error) {
      console.error("Permission request failed:", error);
      setHasPermission(false);
      Alert.alert(
        "Lỗi quyền camera",
        "Không thể yêu cầu quyền camera. Vui lòng kiểm tra cài đặt thiết bị.",
        [
          { text: "OK" },
          { text: "Thử lại", onPress: requestCameraPermission }
        ]
      );
    }
  };

  // Enhanced QR validation with more robust patterns
  const validateQRFormat = (data) => {
    if (!data || typeof data !== 'string') {
      return { valid: false, error: "Dữ liệu QR không hợp lệ" };
    }

    const trimmedData = data.trim();

    if (trimmedData.length < 5) {
      return { valid: false, error: "Mã QR quá ngắn" };
    }

    // Check for URL format
    if (trimmedData.match(/^https?:\/\//)) {
      const urlParts = trimmedData.split("/");
      const ticketId = urlParts[urlParts.length - 1];

      if (!ticketId || ticketId.length < 3) {
        return { valid: false, error: "URL không chứa mã vé hợp lệ" };
      }

      return { valid: true, ticketId, type: 'url' };
    }

    // Check for direct ticket ID (alphanumeric, minimum 5 chars)
    if (trimmedData.match(/^[A-Za-z0-9-_]{5,}$/)) {
      return { valid: true, ticketId: trimmedData, type: 'direct' };
    }

    // Try to extract ticket ID from various formats
    const ticketMatch = trimmedData.match(/(?:ticket[_-]?id?[:\s=]?)([A-Za-z0-9-_]{5,})/i);
    if (ticketMatch) {
      return { valid: true, ticketId: ticketMatch[1], type: 'extracted' };
    }

    return { valid: false, error: "Định dạng mã QR không được hỗ trợ" };
  };

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    if (scanned || loading || !isActive) return;

    console.log("QR Code scanned:", data);

    setScanned(true);
    setLoading(true);

    try {
      // Haptic feedback
      Vibration.vibrate([50, 30, 50]);

      // Validate QR format
      const validation = validateQRFormat(data);
      if (!validation.valid) {
        showErrorAlert("Mã QR không hợp lệ", validation.error);
        return;
      }

      // Check for recent duplicate scan (within 30 seconds)
      const recentScan = scanHistory.find(record =>
        record.rawData === data &&
        (Date.now() - new Date(record.timestamp).getTime()) < 30000
      );

      if (recentScan) {
        Alert.alert(
          "Vé đã được quét",
          `Vé này đã được quét ${Math.round((Date.now() - new Date(recentScan.timestamp).getTime()) / 1000)} giây trước. Bạn có muốn quét lại không?`,
          [
            { text: "Hủy", style: "cancel", onPress: () => setScanned(false) },
            { text: "Quét lại", onPress: () => validateTicket(validation.ticketId, data) }
          ]
        );
        return;
      }

      await validateTicket(validation.ticketId, data);

    } catch (error) {
      console.error("Scan error:", error);
      showErrorAlert("Lỗi quét mã", "Có lỗi không xác định xảy ra");
    } finally {
      setLoading(false);
      // Auto-reset after delay
      setTimeout(() => {
        if (isActive) setScanned(false);
      }, 2000);
    }
  }, [scanned, loading, isActive, scanHistory]);

  const validateTicket = async (ticketId, rawData) => {
    const startTime = Date.now();

    try {
      setLastScannedData(rawData);
      setScanCount(prev => prev + 1);

      const res = await authApis(token).post(
        endpoints.validateTicket(ticketId),
        {
          qr_code: rawData,
          scan_timestamp: new Date().toISOString(),
          device_info: {
            platform: 'mobile_app',
            scan_count: scanCount + 1
          }
        }
      );

      const scanRecord = {
        id: Date.now(),
        ticketId,
        timestamp: new Date().toISOString(),
        status: 'success',
        message: res.data.message || "Vé hợp lệ",
        rawData,
        responseTime: Date.now() - startTime,
        ticketInfo: res.data.ticket_info // If API provides ticket details
      };

      setScanHistory(prev => [scanRecord, ...prev.slice(0, 19)]); // Keep 20 records

      // Success feedback
      Vibration.vibrate([100, 50, 100]);

      Alert.alert(
        "✅ Xác nhận thành công!",
        `${res.data.message}\n\nMã vé: ${ticketId}`,
        [{ text: "Tiếp tục", onPress: () => setScanned(false) }]
      );

    } catch (error) {
      console.error("Validation error:", error);

      const errorMessage = getErrorMessage(error);
      const scanRecord = {
        id: Date.now(),
        ticketId,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: errorMessage,
        rawData,
        responseTime: Date.now() - startTime,
        errorCode: error.response?.status
      };

      setScanHistory(prev => [scanRecord, ...prev.slice(0, 19)]);

      // Error feedback
      Vibration.vibrate([200, 100, 200, 100, 200]);

      showErrorAlert("❌ Xác minh thất bại", errorMessage, [
        { text: "Thử lại", onPress: () => setScanned(false) },
        { text: "Bỏ qua", style: "cancel" }
      ]);
    }
  };

  const getErrorMessage = (error) => {
    if (!error.response) {
      return "Không thể kết nối đến server. Kiểm tra kết nối mạng.";
    }

    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data?.detail || "Dữ liệu không hợp lệ";
      case 401:
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      case 403:
        return "Không có quyền xác minh vé này";
      case 404:
        return "Không tìm thấy vé hoặc vé không tồn tại";
      case 409:
        return "Vé đã được sử dụng trước đó";
      case 500:
        return "Lỗi server. Vui lòng thử lại sau.";
      default:
        return data?.detail || `Lỗi không xác định (${status})`;
    }
  };

  const showErrorAlert = (title, message, buttons = [{ text: "OK", onPress: () => setScanned(false) }]) => {
    Alert.alert(title, message, buttons);
  };

  const resetScanner = () => {
    setScanned(false);
    setLastScannedData(null);
  };

  const toggleFlash = () => {
    setFlashOn(prev => !prev);
    // Brief vibration feedback
    Vibration.vibrate(50);
  };

  const clearHistory = () => {
    Alert.alert(
      "Xóa lịch sử",
      "Bạn có chắc muốn xóa tất cả lịch sử quét?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: () => setScanHistory([]) }
      ]
    );
  };

  // Loading state
  if (hasPermission === null) {
    return (
      <View style={[MyStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>Đang yêu cầu quyền camera...</Text>
        <ProgressBar indeterminate style={{ width: 200 }} />
        <Button
          mode="outlined"
          onPress={requestCameraPermission}
          style={{ marginTop: 20 }}
        >
          Thử lại
        </Button>
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={[MyStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ textAlign: 'center', marginBottom: 30, fontSize: 16, lineHeight: 24 }}>
          Ứng dụng cần quyền truy cập camera để quét mã QR.{'\n\n'}
          Vui lòng cấp quyền camera trong cài đặt thiết bị hoặc thử lại.
        </Text>
        <Button
          mode="contained"
          onPress={requestCameraPermission}
          style={{ marginBottom: 10 }}
        >
          Thử cấp quyền lại
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation?.goBack()}
        >
          Quay lại
        </Button>
      </View>
    );
  }

  return (
    <View style={MyStyles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
        <Text style={MyStyles.title}>Quét mã QR vé</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Đã quét: {scanCount}
        </Text>
      </View>

      {/* Scanner area */}
      <View style={{
        height: 400,
        width: width * 0.9,
        alignSelf: 'center',
        marginVertical: 20,
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={{ flex: 1 }}
          flashMode={flashOn ? BarCodeScanner.Constants.FlashMode.on : BarCodeScanner.Constants.FlashMode.off}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        />

        {/* Scanning overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Scanning frame */}
          <View style={{
            width: 250,
            height: 250,
            borderWidth: 3,
            borderColor: loading ? '#FF9800' : scanned ? '#4CAF50' : '#2196F3',
            borderRadius: 15,
            backgroundColor: 'transparent',
            opacity: 0.8
          }}>
            {/* Corner indicators */}
            {[
              { top: -3, left: -3, borderTopWidth: 3, borderLeftWidth: 3 },
              { top: -3, right: -3, borderTopWidth: 3, borderRightWidth: 3 },
              { bottom: -3, left: -3, borderBottomWidth: 3, borderLeftWidth: 3 },
              { bottom: -3, right: -3, borderBottomWidth: 3, borderRightWidth: 3 }
            ].map((style, index) => (
              <View key={index} style={{
                position: 'absolute',
                width: 30,
                height: 30,
                borderColor: scanned ? '#4CAF50' : '#2196F3',
                ...style
              }} />
            ))}
          </View>

          {/* Status indicator */}
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 15,
            borderRadius: 10,
            marginTop: 30,
            maxWidth: width * 0.8
          }}>
            <Text style={{
              color: 'white',
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600'
            }}>
              {loading ? "🔄 Đang xác minh..." :
               scanned ? "✅ Quét thành công!" :
               "📱 Đưa mã QR vào khung"}
            </Text>
            {loading && (
              <ProgressBar
                indeterminate
                style={{ marginTop: 10, height: 3 }}
                color="#2196F3"
              />
            )}
          </View>
        </View>

        {/* Control buttons overlay */}
        <View style={{
          position: 'absolute',
          top: 15,
          right: 15,
          flexDirection: 'column'
        }}>
          <IconButton
            icon={flashOn ? "flashlight" : "flashlight-off"}
            size={28}
            iconColor="white"
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              marginBottom: 10
            }}
            onPress={toggleFlash}
          />
        </View>
      </View>

      {/* Control buttons */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginVertical: 10
      }}>
        <Button
          mode="contained"
          onPress={resetScanner}
          disabled={loading}
          style={{ flex: 1, marginRight: 10 }}
          contentStyle={{ paddingVertical: 5 }}
        >
          {loading ? "Đang xử lý..." : "Quét lại"}
        </Button>
      </View>

      {/* Scan history */}
      {scanHistory.length > 0 && (
        <View style={{ flex: 1, marginHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[MyStyles.subject, { marginBottom: 0 }]}>
              Lịch sử quét ({scanHistory.length})
            </Text>
            <Button mode="text" onPress={clearHistory} compact>
              Xóa
            </Button>
          </View>

          {scanHistory.slice(0, 5).map(record => (
            <Card key={record.id} style={{
              marginBottom: 8,
              backgroundColor: record.status === 'success' ? '#E8F5E8' : '#FFE8E8',
              elevation: 2
            }}>
              <Card.Content style={{ paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontWeight: 'bold',
                      color: record.status === 'success' ? '#2E7D32' : '#C62828',
                      fontSize: 14
                    }}>
                      {record.status === 'success' ? '✅' : '❌'} {record.message}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      ID: {record.ticketId}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      {new Date(record.timestamp).toLocaleString('vi-VN')}
                      {record.responseTime && ` • ${record.responseTime}ms`}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
};

export default ScanTicketScreen;