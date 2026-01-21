import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await authAPI.updatePushToken(token);
        console.log("Push Token Updated:", token);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-blue-600 mb-2 text-center">CampusLog</Text>
      <Text className="text-gray-600 mb-8 text-center">Sign in to your account</Text>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        className="bg-blue-600 rounded-lg py-4 mb-4"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold text-lg">Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="text-center text-blue-600">
          Don't have an account? <Text className="font-semibold">Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

