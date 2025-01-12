import axios from 'axios';
import { SessionResponse } from '@/types/session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getSession = async (sessionId: string): Promise<SessionResponse> => {
    try {
        const response = await axios.get<SessionResponse>(`${API_BASE_URL}/api/sessions/${sessionId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch session'
            };
        }
        return {
            success: false,
            message: 'An unexpected error occurred'
        };
    }
}; 