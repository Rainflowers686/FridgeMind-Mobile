import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity, FlatList,
  ScrollView, useWindowDimensions, Animated, Platform, Modal
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import axios from 'axios';
import { API_BASE_URL } from './config';

// ==================== 1. 全局主题 ====================
const theme = {
  colors: {
    primary: '#0A84FF',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    bgStart: '#F1F4F8',
    bgEnd: '#E2E8F0',
    cardBg: Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)',
    textMain: '#1C1C1E',
    textSub: '#8E8E93',
  },
  font: Platform.OS === 'android' ? 'Roboto' : 'System'
};

// ==================== 2. 高级微组件 ====================
const CircularProgress = ({ value, max, color, icon }) => {
  const radius = 20;
  const stroke = 4;
  const circum = 2 * Math.PI * radius;
  const progress = (value / max) * circum;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
      <Svg width={48} height={48}>
        <Circle stroke="#F1F5F9" cx="24" cy="24" r={radius} strokeWidth={stroke} fill="none" />
        <Circle stroke={color} cx="24" cy="24" r={radius} strokeWidth={stroke}
                strokeDasharray={circum} strokeDashoffset={circum - progress}
                strokeLinecap="round" fill="none" rotation="-90" origin="24, 24" />
      </Svg>
      <View style={{ position: 'absolute' }}><Ionicons name={icon} size={18} color={color} /></View>
    </View>
  );
};

const AnimatedSwitch = ({ isClosed }) => {
  const translateX = useRef(new Animated.Value(isClosed ? 20 : 0)).current;
  useEffect(() => { Animated.spring(translateX, { toValue: isClosed ? 20 : 0, useNativeDriver: true }).start(); }, [isClosed]);
  return (
    <View style={[{ width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' }, { backgroundColor: isClosed ? theme.colors.success : theme.colors.danger }]}>
      <Animated.View style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', elevation: 2 }, { transform: [{ translateX }] }]} />
    </View>
  );
};

// ==================== 3. 监控大屏 (已接入后端实时轮询) ====================
function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [visible, setIsVisible] = useState(false);

  // 初始状态：显示加载中
  const [fridgeData, setFridgeData] = useState({
    temp: '--', humi: '--', door: '获取中...', update: '同步中...',
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000&auto=format&fit=crop'
  });

// 🔌 核心：精准对接后端 /api/sensor_logs 接口
  const fetchRealtimeData = async () => {
    try {
      // 加上 ?limit=1 规范请求，虽然截图中默认返回了，但前端显式声明更严谨
      const response = await axios.get(`${API_BASE_URL}/api/sensor_logs?limit=1`);

      if (response.data && response.data.length > 0) {
        const latestLog = response.data[0];

        // 转换后端的时间戳为友好的 "HH:MM" 格式
        const logTime = new Date(latestLog.timestamp);
        const formattedTime = logTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute:'2-digit' });

        setFridgeData(prev => ({
          ...prev, // 保留之前的兜底照片和舱门状态
          temp: latestLog.temperature != null ? latestLog.temperature.toFixed(1) : '--',
          humi: latestLog.humidity != null ? latestLog.humidity.toFixed(0) : '--',
          update: formattedTime // 使用真实的后端记录时间
        }));
      }
    } catch (error) {
      console.warn("大屏数据拉取失败，请检查网络或后端服务:", error.message);
    }
  };

  // 页面加载时执行一次，然后每隔 5 秒自动刷新一次
  useEffect(() => {
    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 5000);
    return () => clearInterval(interval);
  }, []);

  const tempColor = Number(fridgeData.temp) > 8 ? theme.colors.danger : theme.colors.primary;

  const StatusCard = ({ title, children, value, unit, color }) => (
    <View style={[styles.card, { width: isTablet ? '31%' : '100%', marginBottom: isTablet ? 0 : 16 }]}>
      <Text style={styles.cardLabel} numberOfLines={1}>{title}</Text>
      {children}
      <View style={{flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center'}}>
        <Text style={[styles.cardValue, {color}]}>{value}</Text>
        <Text style={styles.cardUnit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <LinearGradient colors={[theme.colors.bgStart, theme.colors.bgEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="snow" size={28} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>FridgeMind AI</Text>
          </View>
          <TouchableOpacity onPress={fetchRealtimeData}>
             <Ionicons name="sync-circle" size={36} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 40}} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: isTablet ? 'row' : 'column', justifyContent: 'space-between', marginBottom: 20 }}>
            <StatusCard title="内部温度" value={fridgeData.temp} unit="℃" color={tempColor}>
              <CircularProgress value={fridgeData.temp === '--' ? 0 : fridgeData.temp} max={10} color={tempColor} icon="thermometer" />
            </StatusCard>
            <StatusCard title="相对湿度" value={fridgeData.humi} unit="%" color={theme.colors.primary}>
              <CircularProgress value={fridgeData.humi === '--' ? 0 : fridgeData.humi} max={100} color={theme.colors.primary} icon="water" />
            </StatusCard>
            <StatusCard title="舱门状态" value={fridgeData.door} unit="" color={fridgeData.door === '已关' ? theme.colors.success : theme.colors.danger}>
              <View style={{ height: 48, justifyContent: 'center' }}><AnimatedSwitch isClosed={fridgeData.door === '已关'} /></View>
            </StatusCard>
          </View>

          <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
            <View style={styles.imageHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="camera" size={20} color={theme.colors.textMain} />
                <Text style={{fontWeight: 'bold', marginLeft: 8, fontSize: 16, color: theme.colors.textMain, fontFamily: theme.font}}>最新内部存照</Text>
              </View>
              <View style={styles.badge}><Text style={styles.badgeText}>NPU 校正</Text></View>
            </View>
            <TouchableOpacity onPress={() => setIsVisible(true)} activeOpacity={0.9} style={{width: '100%'}}>
              <Image source={{ uri: fridgeData.img }} style={{ width: '100%', height: isTablet ? 480 : 220, resizeMode: 'cover' }} />
              <View style={styles.aiOverlay}>
                <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: theme.font}}>AI 识别: 实时监控中 • {fridgeData.update}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setIsVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, right: 20, zIndex: 10, padding: 10 }}
            onPress={() => setIsVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: fridgeData.img }} style={{ width: '100%', height: '80%', resizeMode: 'contain' }} />
        </View>
      </Modal>
    </View>
  );
}
// ==================== 4. AI 智能库存 (已接入后端实时请求) ====================
function InventoryScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔌 核心：从后端拉取 /api/inventory 列表
  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inventory`);

      // 将后端的数据映射为前端需要的格式
      const formattedData = response.data.map(item => ({
        id: item.id ? item.id.toString() : Math.random().toString(),
        name: item.item_name || '未知食材',
        qty: item.quantity || 1,
        // 根据后端状态映射颜色，假设后端返回的是 '在库', '临期', '过期' 等枚举
        status: item.status === '过期' ? 'danger' : (item.status === '临期' ? 'warning' : 'normal'),
        days: item.expiry_time ? `预计过期: ${new Date(item.expiry_time).toLocaleDateString()}` : '保鲜中'
      }));

      setData(formattedData);
    } catch (error) {
      console.warn("库存数据拉取失败:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <View style={{flex: 1}}>
      <LinearGradient colors={[theme.colors.bgStart, theme.colors.bgEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI 智能库存</Text>
          <TouchableOpacity onPress={fetchInventory}>
             <Ionicons name="refresh" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: theme.colors.textSub, fontFamily: theme.font}}>加载食材库中...</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={i => i.id}
            contentContainerStyle={{padding: 16}}
            ListEmptyComponent={<Text style={{textAlign: 'center', color: theme.colors.textSub, marginTop: 40}}>空空如也，快去买点吃的吧！</Text>}
            renderItem={({ item }) => {
              const color = item.status === 'normal' ? theme.colors.success : (item.status === 'warning' ? theme.colors.warning : theme.colors.danger);
              return (
                <View style={[styles.card, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color, marginRight: 12 }} />
                    <View>
                      <Text style={{fontSize: 16, fontWeight: 'bold', color: theme.colors.textMain, fontFamily: theme.font}}>{item.name}</Text>
                      <Text style={{fontSize: 12, marginTop: 4, color, fontFamily: theme.font}}>{item.days}</Text>
                    </View>
                  </View>
                  <Text style={{fontSize: 22, fontWeight: 'bold', color: theme.colors.textMain, fontFamily: theme.font}}>x{item.qty}</Text>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
// ==================== 5. 历史趋势 ====================
function StatsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const containerPadding = 32;
  const cardPadding = 40;
  const yAxisWidth = 30;
  const chartWidth = isTablet ? Math.min(width - 200, 800) : width - containerPadding - cardPadding - yAxisWidth;
  const pointSpacing = chartWidth / 5.5;

  const tempData = [{value: 4.1, label: '10:00'}, {value: 4.5, label: '11:00'}, {value: 4.2, label: '12:00'}, {value: 4.8, label: '13:00'}, {value: 4.4, label: '14:00'}, {value: 4.6, label: '15:00'}];

  return (
    <View style={{flex: 1}}>
      <LinearGradient colors={[theme.colors.bgStart, theme.colors.bgEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <View style={styles.header}><Text style={styles.headerTitle}>环境与趋势监测</Text></View>
        <ScrollView contentContainerStyle={{padding: 16}}>
          <View style={styles.card}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: theme.colors.textMain, marginBottom: 24, fontFamily: theme.font}}>今日温度变化 (℃)</Text>
            <View style={{ paddingBottom: 20 }}>
              <LineChart
                data={tempData} width={chartWidth} spacing={pointSpacing} initialSpacing={10}
                color={theme.colors.primary} thickness={3} dataPointsColor={theme.colors.primary} dataPointsRadius={4}
                hideRules maxValue={6} noOfSections={6} yAxisLabelTexts={['0', '1', '2', '3', '4', '5', '6']}
                yAxisTextStyle={{color: theme.colors.textSub, fontSize: 12, fontFamily: theme.font}}
                xAxisLabelTextStyle={{color: theme.colors.textSub, fontSize: 11, textAlign: 'center', fontFamily: theme.font}}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ==================== 6. 底部导航栏 ====================
const Tab = createBottomTabNavigator();

const CustomTabIcon = ({ focused, color, iconName, label }) => (
  <View style={styles.tabItemContainer}>
    <Ionicons name={iconName} size={24} color={color} />
    <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    {focused && <View style={styles.activeGlow} />}
  </View>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
        }}>
          <Tab.Screen name="Dashboard" component={DashboardScreen} options={{
            tabBarIcon: ({color, focused}) => <CustomTabIcon focused={focused} color={color} iconName="grid" label="大屏" />
          }}/>
          <Tab.Screen name="Inventory" component={InventoryScreen} options={{
            tabBarIcon: ({color, focused}) => <CustomTabIcon focused={focused} color={color} iconName="nutrition" label="清单" />
          }}/>
          <Tab.Screen name="Stats" component={StatsScreen} options={{
            tabBarIcon: ({color, focused}) => <CustomTabIcon focused={focused} color={color} iconName="analytics" label="趋势" />
          }}/>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// ==================== 样式表 ====================
const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: theme.colors.textMain, marginLeft: 10, fontFamily: theme.font },

  card: {
    backgroundColor: theme.colors.cardBg, borderRadius: 20, padding: 16, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
      web: { boxShadow: '0 8px 30px rgba(10, 132, 255, 0.08)', backdropFilter: 'blur(20px)' }
    })
  },

  cardLabel: { fontSize: 13, color: theme.colors.textSub, fontWeight: 'bold', fontFamily: theme.font },
  cardValue: { fontSize: 32, fontWeight: '900', fontFamily: theme.font },
  cardUnit: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textSub, marginLeft: 2, fontFamily: theme.font },

  imageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', width: '100%' },
  badge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold', fontFamily: theme.font },
  aiOverlay: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },

  tabBar: { backgroundColor: '#ffffff', borderTopWidth: 0, elevation: 16, height: Platform.OS === 'ios' ? 85 : 65 },

  tabItemContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'relative', paddingTop: 8 },
  tabLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 4, fontFamily: theme.font },
  activeGlow: { position: 'absolute', bottom: 0, width: 36, height: 4, backgroundColor: theme.colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4 }
});