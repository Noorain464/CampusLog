import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6">
      <View className="py-12">
        <Text className="text-3xl font-bold text-blue-600 mb-2 text-center">Create Account</Text>
        <Text className="text-gray-600 mb-8 text-center">Sign up for CampusLog</Text>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">Role</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg border-2 ${role === 'student' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                }`}
              onPress={() => setRole('student')}
            >
              <Text className={`text-center font-medium ${role === 'student' ? 'text-blue-600' : 'text-gray-600'}`}>
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg border-2 ${role === 'admin' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                }`}
              onPress={() => setRole('admin')}
            >
              <Text className={`text-center font-medium ${role === 'admin' ? 'text-blue-600' : 'text-gray-600'}`}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-4 mb-4"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-center text-blue-600">
            Already have an account? <Text className="font-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

