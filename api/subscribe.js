// api/subscribe.js - Full Production Version
import { createClient } from '@vercel/kv';

// Initialize Redis client
const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

// Validation helpers
function validatePhoneNumber(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

function validateEmail(email) {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatPhoneNumber(phone) {
    // Remove all non-digits and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If it's a US number without country code, add +1
    if (cleanPhone.length === 10) {
        return `+1${cleanPhone}`;
    }
    
    // If it already has country code but no +, add it
    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        return `+${cleanPhone}`;
    }
    
    // If it already starts with +, return as is
    if (phone.startsWith('+')) {
        return phone.replace(/\D/g, '').replace(/^/, '+');
    }
    
    return `+${cleanPhone}`;
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 🧹 DATABASE RESET ENDPOINT (temporary for testing)
        if (req.method === 'DELETE' && req.query.reset === 'confirm') {
            try {
                console.log('🧹 Starting database cleanup...');
                
                // Get all keys
                const allKeys = await kv.keys('*');
                let deletedCount = 0;
                
                if (allKeys && allKeys.length > 0) {
                    for (const key of allKeys) {
                        await kv.del(key);
                        deletedCount++;
                    }
                }
                
                console.log(`✅ Database cleaned: ${deletedCount} keys deleted`);
                
                return res.status(200).json({
                    success: true,
                    message: `Database reset complete! Deleted ${deletedCount} keys.`,
                    deletedKeys: allKeys?.slice(0, 10), // Show first 10 for confirmation
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('❌ Reset failed:', error);
                return res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        }

        if (req.method === 'POST') {
            // Handle new subscription
            const { name, phone, email, timestamp, userAgent, referrer, source } = req.body;

            // Validation
            if (!name || !phone) {
                return res.status(400).json({
                    success: false,
                    error: 'MISSING_REQUIRED_FIELDS',
                    message: 'Name and phone number are required'
                });
            }

            if (!validatePhoneNumber(phone)) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_PHONE',
                    message: 'Please enter a valid phone number'
                });
            }

            if (!validateEmail(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_EMAIL',
                    message: 'Please enter a valid email address'
                });
            }

            // Format phone number
            const formattedPhone = formatPhoneNumber(phone);

            // Check if phone number already exists
            const existingUser = await kv.get(`phone:${formattedPhone}`);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'DUPLICATE_PHONE',
                    message: 'This phone number is already registered for notifications!'
                });
            }

            // Create user object
            const user = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: name.trim(),
                phone: formattedPhone,
                email: email ? email.trim().toLowerCase() : '',
                timestamp: timestamp || new Date().toISOString(),
                userAgent: userAgent || '',
                referrer: referrer || '',
                source: source || 'signup_form',
                status: 'active',
                createdAt: new Date().toISOString(),
                notificationsSent: 0
            };

            // Store user data
            await kv.set(`phone:${formattedPhone}`, user);
            await kv.set(`user:${user.id}`, user);

            // Add to users list (using a different approach)
            await kv.set(`subscriber:${user.id}`, user.id);

            // Update total count (using keys pattern)
            const subscriberKeys = await kv.keys('subscriber:*');
            const totalCount = subscriberKeys ? subscriberKeys.length : 1;

            console.log(`✅ New subscriber added: ${name} (${formattedPhone}) - Total: ${totalCount}`);

            return res.status(200).json({
                success: true,
                message: 'Successfully registered for birthday notifications!',
                data: {
                    userId: user.id,
                    name: user.name,
                    phone: formattedPhone,
                    totalSubscribers: totalCount,
                    registeredAt: user.timestamp
                }
            });

        } else if (req.method === 'GET') {
            // Get subscriber statistics
            try {
                const subscriberKeys = await kv.keys('subscriber:*');
                const totalCount = subscriberKeys ? subscriberKeys.length : 0;
                
                return res.status(200).json({
                    success: true,
                    data: {
                        totalSubscribers: totalCount,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.error('Error getting subscriber count:', error);
                return res.status(200).json({
                    success: true,
                    data: {
                        totalSubscribers: 0,
                        timestamp: new Date().toISOString()
                    }
                });
            }

        } else {
            return res.status(405).json({
                success: false,
                error: 'METHOD_NOT_ALLOWED',
                message: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Subscribe API Error:', error);
        
        return res.status(500).json({
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}