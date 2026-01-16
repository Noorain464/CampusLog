import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { inventoryAPI, transactionAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
}

interface SectionData {
  title: string;
  data: InventoryItem[];
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getAllItems();
      if (response.success) {
        setItems(response.items);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Group items by category
  const categorizedItems = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, InventoryItem[]>);

    return Object.keys(grouped)
      .sort()
      .map((category) => ({
        title: category,
        data: grouped[category].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [items]);

  const handleRequestItem = async (itemId: string) => {
    if (user?.role === 'admin') {
      Alert.alert('Info', 'Admins cannot request items');
      return;
    }

    Alert.alert(
      'Request Item',
      'Are you sure you want to request this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              const response = await transactionAPI.requestItem(itemId);
              if (response.success) {
                Alert.alert('Success', 'Item requested successfully!');
                loadInventory();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to request item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isAvailable = item.availableQuantity > 0;
    
    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
            <Text className="text-sm text-gray-500 mt-1">{item.category}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-medium ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
              {isAvailable ? 'Available' : 'Out of Stock'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-sm text-gray-600">
            {item.availableQuantity} of {item.totalQuantity} available
          </Text>
          {user?.role === 'student' && isAvailable && (
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-lg"
              onPress={() => handleRequestItem(item._id)}
            >
              <Text className="text-white font-medium">Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View className="bg-gray-100 px-4 py-2 mt-4 mb-2">
      <Text className="text-lg font-bold text-gray-800">{section.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SectionList
        sections={categorizedItems}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadInventory} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="cube-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">No items available</Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

