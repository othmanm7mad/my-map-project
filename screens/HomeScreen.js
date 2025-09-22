import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const HomeScreen = () => {
  const [isEmergencyReceived, setIsEmergencyReceived] = useState(false);

  useEffect(() => {
    // محاكاة إرسال طلب بعد 10 ثواني
    setTimeout(() => {
      setIsEmergencyReceived(true);
    }, 10000); // بعد 10 ثواني
  }, []);

  const handleAccept = () => {
    Alert.alert('تم قبول الطلب', 'لقد قبلت الطلب بنجاح!');
    setIsEmergencyReceived(false); // إخفاء التحذير
  };

  const handleReject = () => {
    Alert.alert('تم رفض الطلب', 'لقد تم رفض الطلب.');
    setIsEmergencyReceived(false); // إخفاء التحذير
  };

  return (
    <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}> الصفحة الرئيسية </Text>
            </View>
      
      {/* بيانات فاطمة */}
      <View style={styles.midwifeInfo}>
        <Text style={styles.midwifeName}>القابلة: فاطمة محمد</Text>
        <Text style={styles.midwifeDetails}>التخصص: رعاية الأمومة</Text>
        <Text style={styles.midwifeDetails}>الخبرة: 8 سنوات</Text>
        <Text style={styles.midwifeDetails}>الحالة: مرخصة</Text>
      </View>

      {/* محاكاة حالة الطوارئ بعد 10 ثواني */}
      {isEmergencyReceived && (
        <View style={styles.emergencyContainer}>
          <Text style={styles.emergencyText}>تم استلام طلب الطوارئ</Text>
          <Text style={styles.emergencyMessage}>رقم المريضة: 48564245</Text>
          <Text style={styles.emergencyMessage}> عنوان المريضة: سردا، جبل النجمة، شارع 17 </Text>
          
          {/* الأزرار جنب بعض */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
              <Text style={styles.buttonText}>رفض</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>قبول</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    backgroundColor: '#ffae42', 
    paddingVertical: 15, 
    alignItems: 'center', 
    paddingTop: 30 // زيادة المسافة من أعلى الشاشة لتجنب التداخل مع الكاميرا
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  midwifeInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    // تحديد عرض الكارد ليكون 80% من عرض الشاشة
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 10,
    alignItems: 'center', // توسيط النصوص داخل الكارد
    justifyContent: 'center', // توسيط النصوص عموديًا داخل الكارد
    shadowColor: '#000', // إضافة تأثير الظل
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  midwifeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  midwifeDetails: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
  },
  emergencyContainer: {
    backgroundColor: '#ffae42',
    padding: 20,
    borderRadius: 10,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
   
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyMessage: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 10,
  },
  // كونتينر للأزرار جنب بعض
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  acceptButton: {
    backgroundColor: '#4CAF80',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;