import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionAPI } from '../../utils/api';

interface Transaction {
  _id: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  requestDate: string;
  returnDate?: string;
  item: {
    _id: string;
    name: string;
    category: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'approved':
      return 'bg-green-100 text-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'returned':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return 'time-outline';
    case 'approved':
      return 'checkmark-circle-outline';
    case 'rejected':
      return 'close-circle-outline';
    case 'returned':
      return 'return-down-back-outline';
    default:
      return 'help-circle-outline';
  }
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getMyTransactions();
      if (response.success) {
        setTransactions(response.transactions);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReturnItem = async (transactionId: string) => {
    Alert.alert(
      'Return Item',
      'Are you sure you want to return this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return',
          onPress: async () => {
            try {
              const response = await transactionAPI.returnItem(transactionId);
              if (response.success) {
                Alert.alert('Success', 'Item returned successfully!');
                loadTransactions();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to return item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const canReturn = item.status === 'approved';

    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{item.item.name}</Text>
            <Text className="text-sm text-gray-500 mt-1">{item.item.category}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${statusColor}`}>
            <Ionicons name={statusIcon as any} size={14} />
            <Text className={`text-xs font-medium capitalize`}>{item.status}</Text>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-500">
            Requested: {new Date(item.requestDate).toLocaleDateString()}
          </Text>
          {item.returnDate && (
            <Text className="text-xs text-gray-500 mt-1">
              Returned: {new Date(item.returnDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {canReturn && (
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-lg mt-3"
            onPress={() => handleReturnItem(item._id)}
          >
            <Text className="text-white font-medium text-center">Return Item</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadTransactions} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="list-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">No transactions yet</Text>
            <Text className="text-gray-400 text-sm mt-2">Request items from the Inventory tab</Text>
          </View>
        }
      />
    </View>
  );
}

