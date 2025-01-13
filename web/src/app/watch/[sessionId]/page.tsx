import { Metadata } from 'next';

interface SessionData {
    id: string;
    videoUrl: string;
    createdAt: string;
    participants: string[];
}

interface Props {
    params: {
        sessionId: string;
    };
}

export const metadata: Metadata = {
    title: 'Watch Together - Session',
    description: 'Watch videos together with friends',
};

async function getSession(sessionId: string): Promise<SessionData | null> {
    // Skip if the sessionId is the default route parameter
    if (sessionId === '[sessionId]' || sessionId === '%5BsessionId%5D') {
        return null;
    }

    // Decode the sessionId if it's URL encoded
    const decodedSessionId = decodeURIComponent(sessionId);
    
    try {
        const url = `http://backend:5000/api/sessions/${decodedSessionId}`;
        const response = await fetch(url, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Session not found');
            }
            throw new Error('Failed to fetch session data');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error?.message || 'Failed to fetch session data');
        }
        
        return data.session;
    } catch (error) {
        return null;
    }
}

export default async function SessionPage({ params }: Props) {
    const session = await getSession(params.sessionId);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">Session not found or an error occurred.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Session Details</h1>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Session ID:</label>
                        <p className="mt-1 text-sm text-gray-900">{session.id}</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Video URL:</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <p className="text-sm text-gray-900 truncate flex-1">{session.videoUrl}</p>
                            <a
                                href={session.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Watch Video
                            </a>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Created At:</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {new Date(session.createdAt).toLocaleString('en-US')}
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Participants:</label>
                        {session.participants.length > 0 ? (
                            <ul className="mt-1 text-sm text-gray-900">
                                {session.participants.map((participant, index) => (
                                    <li key={index}>{participant}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-1 text-sm text-gray-500 italic">No participants yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 