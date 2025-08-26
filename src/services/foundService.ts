import api from '@/api/axios';
import { authService } from './authService';

// Updated to match backend FoundResponse exactly
export interface FoundReport {
  id: number;
  itemId: number;
  itemTitle: string;
  finderName: string;
  ownerName: string;
  finderId: number;
  ownerId: number;
  finderConfirmed: boolean;
  ownerConfirmed: boolean;
  finderConfirmedAt?: string;
  ownerConfirmedAt?: string;
  createdAt: string;
  finderMessage: string;
  bothConfirmed: boolean;
}

// Matches backend FoundRequest exactly
export interface MarkFoundRequest {
  itemId: number; // Will be converted to Long by backend
  message: string; // Corresponds to backend String message field
}

// Updated to match backend FoundResponse for pending confirmations
export interface PendingConfirmation {
  id: number;
  itemId: number;
  itemTitle: string;
  finderName: string;
  ownerName: string;
  finderId: number;
  ownerId: number;
  finderConfirmed: boolean;
  ownerConfirmed: boolean;
  finderConfirmedAt?: string;
  ownerConfirmedAt?: string;
  createdAt: string;
  finderMessage: string;
  bothConfirmed: boolean;
  // Additional frontend fields
  createdAtFormatted?: string;
}

export const foundService = {
  // Mark an item as found
  async markItemFound(request: MarkFoundRequest): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      console.log('Making API call to mark item found:', request);
      
      // The backend expects exactly: { itemId: Long, message: String }
      // Based on your Java DTO: FoundRequest(Long itemId, String message)
      const requestBody = {
        itemId: request.itemId, // Should be a number, backend will handle Long conversion
        message: request.message
      };
      
      console.log('Sending request body:', requestBody);
      const response = await api.post('/found/mark', requestBody);
      console.log('Success! API response:', response.data);
      
    } catch (error: any) {
      console.error('API call failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url,
        sentData: error.config?.data
      });
      
      // Handle specific error cases based on your backend service logic
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error;
        
        if (errorMessage) {
          // Map backend error messages to user-friendly messages
          if (errorMessage.includes('Item not Found')) {
            throw new Error('This item no longer exists or has been removed.');
          } else if (errorMessage.includes('cannot mark your item as found')) {
            throw new Error('You cannot report your own item as found.');
          } else if (errorMessage.includes('already marked this item as found')) {
            throw new Error('You have already reported this item as found.');
          } else {
            throw new Error(errorMessage);
          }
        } else {
          throw new Error('Invalid request. Please check your input and try again.');
        }
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      } else if (error.response?.status === 404) {
        throw new Error('The requested resource was not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (!error.response) {
        // Network error
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to mark item as found');
    }
  },

  // Get pending confirmations for current user (items they own that others found)
  async getPendingConfirmations(): Promise<PendingConfirmation[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.get('/found/pending-confirmation');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending confirmations');
    }
  },

  // Confirm that a found report is valid
  async confirmFound(foundId: number): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      await api.post(`/found/confirm/${foundId}`, {});
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm found item');
    }
  },

  // Get all found reports for a specific item (admin or item owner)
  async getFoundReports(itemId: number): Promise<FoundReport[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await api.get(`/found/reports/${itemId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch found reports');
    }
  }
};