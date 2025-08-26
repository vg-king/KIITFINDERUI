import api from '@/api/axios';

// Test function to debug API requests
export const testFoundAPI = async (itemId: number, message: string) => {
  console.log('=== API Test Starting ===');
  console.log('Testing itemId:', itemId, 'message:', message);
  
  // Test 1: Check if the item exists first
  try {
    console.log('Testing item existence...');
    const itemResponse = await api.get(`/items/${itemId}`);
    console.log('Item exists:', itemResponse.data);
  } catch (error: any) {
    console.error('Item not found:', error.response?.status, error.response?.data);
    return;
  }
  
  // Test 2: Try the most likely Spring Boot pattern
  const testRequests = [
    { itemId: itemId, foundLocation: message },
    { itemId: itemId, details: message },
    { itemId: itemId, description: message },
    { itemId: itemId, message: message },
    { itemId: itemId, location: message },
    { itemId: itemId, foundDetails: message },
    { itemId: itemId, foundMessage: message },
    { id: itemId, foundLocation: message },
    { id: itemId, message: message }
  ];
  
  for (let i = 0; i < testRequests.length; i++) {
    try {
      console.log(`Testing format ${i + 1}:`, testRequests[i]);
      const response = await api.post('/found/mark', testRequests[i]);
      console.log(`SUCCESS with format ${i + 1}!`, response.data);
      return testRequests[i];
    } catch (error: any) {
      console.log(`Format ${i + 1} failed:`, error.response?.status, error.response?.data);
    }
  }
  
  console.log('=== All formats failed ===');
};
