// api/send-sms.js - Full Production Version
import twilio from 'twilio';
import { createClient } from '@vercel/kv';

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Initialize Redis client
const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

// Rate limiting helper - simplified for Vercel KV
async function checkRateLimit(key, limit = 5, windowMs = 60000) {
    try {
        const now = Date.now();
        const requests = await kv.get(key) || [];
        const windowStart = now - windowMs;
        
        // Filter recent requests
        const recentRequests = requests.filter(timestamp => timestamp > windowStart);
        
        if (recentRequests.length >= limit) {
            return false; // Rate limit exceeded
        }
        
        // Add current request and keep only recent ones
        recentRequests.push(now);
        await kv.set(key, recentRequests);
        await kv.expire(key, Math.ceil(windowMs / 1000));
        
        return true; // Request allowed
    } catch (error) {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error
    }
}

// Get all active subscribers
async function getAllSubscribers() {
    try {
        const subscriberKeys = await kv.keys('subscriber:*');
        if (!subscriberKeys || subscriberKeys.length === 0) {
            return [];
        }

        const subscribers = [];
        for (const key of subscriberKeys) {
            const userId = await kv.get(key);
            if (userId) {
                const user = await kv.get(`user:${userId}`);
                if (user && user.status === 'active') {
                    subscribers.push(user);
                }
            }
        }

        return subscribers;
    } catch (error) {
        console.error('Error getting subscribers:', error);
        return [];
    }
}

// Send SMS to single recipient with better phone validation
async function sendSingleSMS(phone, message, fromNumber) {
    try {
        // Extra phone validation
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Validate phone number length and format
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            throw new Error(`Invalid phone number length: ${cleanPhone.length} digits`);
        }
        
        // Ensure proper formatting
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
            if (cleanPhone.length === 10) {
                formattedPhone = `+1${cleanPhone}`;
            } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
                formattedPhone = `+${cleanPhone}`;
            } else {
                formattedPhone = `+${cleanPhone}`;
            }
        }
        
        console.log(`🔄 Attempting SMS to ${formattedPhone} (original: ${phone})`);
        
        const result = await twilioClient.messages.create({
            body: message,
            from: fromNumber,
            to: formattedPhone
        });

        console.log(`✅ SMS sent successfully to ${formattedPhone}, SID: ${result.sid}`);

        return {
            success: true,
            messageId: result.sid,
            phone: formattedPhone,
            status: result.status
        };
    } catch (error) {
        console.error(`❌ Failed to send SMS to ${phone}:`, error.message);
        return {
            success: false,
            phone: phone,
            error: error.message,
            errorCode: error.code
        };
    }
}

// Send SMS with retry logic
async function sendSMSWithRetry(phone, message, fromNumber, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await sendSingleSMS(phone, message, fromNumber);
        
        if (result.success) {
            return result;
        }
        
        // Don't retry for certain error codes
        if (result.errorCode && ['21211', '21614', '21408'].includes(result.errorCode)) {
            break; // Invalid number, don't retry
        }
        
        if (attempt < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
    
    return {
        success: false,
        phone: phone,
        error: 'Failed after retries'
    };
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED',
            message: 'Only POST method is allowed'
        });
    }

    try {
        // Check environment variables
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            return res.status(500).json({
                success: false,
                error: 'CONFIGURATION_ERROR',
                message: 'Twilio configuration is missing'
            });
        }

        const { message, testMode = false, specificPhone } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_MESSAGE',
                message: 'SMS message is required'
            });
        }

        // Rate limiting (prevent spam)
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const rateLimitKey = `sms_rate_limit:${clientIP}`;
        
        const rateLimitOk = await checkRateLimit(rateLimitKey, 3, 300000); // 3 requests per 5 minutes
        if (!rateLimitOk) {
            return res.status(429).json({
                success: false,
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many SMS requests. Please wait before trying again.'
            });
        }

        // Log the SMS sending attempt
        console.log(`📱 SMS Send Request:`, {
            testMode,
            specificPhone: specificPhone ? '***' + specificPhone.slice(-4) : null,
            messageLength: message.length,
            timestamp: new Date().toISOString()
        });

        let recipients = [];
        
        if (specificPhone) {
            // Send to specific phone number (for testing)
            recipients = [{ phone: specificPhone, name: 'Test User' }];
        } else {
            // Send to all subscribers
            const subscribers = await getAllSubscribers();
            recipients = subscribers.map(sub => ({
                phone: sub.phone,
                name: sub.name,
                id: sub.id
            }));
        }

        if (recipients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'NO_RECIPIENTS',
                message: 'No subscribers found to send SMS to'
            });
        }

        console.log(`📤 Sending SMS to ${recipients.length} recipient(s)...`);

        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        const results = [];
        let successCount = 0;
        let failureCount = 0;

        // Send SMS in batches to avoid overwhelming Twilio
        const batchSize = 5;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (recipient) => {
                const personalizedMessage = message.replace(/\{name\}/g, recipient.name || 'Friend');
                
                if (testMode) {
                    // Simulate SMS sending in test mode
                    console.log(`🧪 TEST MODE - Would send to ${recipient.phone}: ${personalizedMessage.substring(0, 50)}...`);
                    return {
                        success: true,
                        phone: recipient.phone,
                        messageId: `test_${Date.now()}_${Math.random()}`,
                        status: 'test_sent'
                    };
                } else {
                    // Actually send SMS
                    return await sendSMSWithRetry(recipient.phone, personalizedMessage, fromNumber);
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Update counters
            batchResults.forEach(result => {
                if (result.success) {
                    successCount++;
                } else {
                    failureCount++;
                }
            });

            // Small delay between batches to respect rate limits
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Update notification counters for successful sends
        if (!testMode && successCount > 0) {
            for (const result of results) {
                if (result.success && !specificPhone) {
                    const user = recipients.find(r => r.phone === result.phone);
                    if (user && user.id) {
                        try {
                            const userData = await kv.get(`user:${user.id}`);
                            if (userData) {
                                userData.notificationsSent = (userData.notificationsSent || 0) + 1;
                                userData.lastNotificationSent = new Date().toISOString();
                                await kv.set(`user:${user.id}`, userData);
                            }
                        } catch (error) {
                            console.error(`Failed to update notification count for user ${user.id}:`, error);
                        }
                    }
                }
            }
        }

        // Log summary
        console.log(`✅ SMS Campaign Complete:`, {
            totalRecipients: recipients.length,
            successful: successCount,
            failed: failureCount,
            testMode,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: `SMS sent successfully to ${successCount} recipient(s)`,
            data: {
                totalSent: successCount,
                totalFailed: failureCount,
                totalRecipients: recipients.length,
                testMode,
                results: results.map(r => ({
                    phone: r.phone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1***$4'), // Mask phone numbers
                    success: r.success,
                    status: r.status || (r.success ? 'sent' : 'failed'),
                    error: r.error
                })),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ SMS API Error:', error);
        
        return res.status(500).json({
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send SMS. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}