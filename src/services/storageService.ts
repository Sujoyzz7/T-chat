import { supabase } from '../lib/supabase';

export const storageService = {
    // Upload avatar
    async uploadAvatar(file: File, userId: string) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `user_avatars/${fileName}`;

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // Upload chat media
    async uploadChatMedia(
        file: File,
        chatId: string,
        type: 'images' | 'videos' | 'audio' | 'files' | 'voice-messages'
    ) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${chatId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${type}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('chat-media')
            .upload(filePath, file, {
                cacheControl: '3600',
            });

        if (error) throw error;

        // For private bucket, we need to get a signed URL
        const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('chat-media')
            .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

        if (urlError) throw urlError;

        return {
            url: signedUrlData.signedUrl,
            path: filePath,
            size: file.size,
            name: file.name,
        };
    },

    // Delete file
    async deleteFile(bucket: 'avatars' | 'chat-media', filePath: string) {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) throw error;
    },

    // Validate file
    validateFile(file: File, type: 'image' | 'video' | 'audio' | 'file') {
        const maxSizes = {
            image: 10 * 1024 * 1024, // 10MB
            video: 100 * 1024 * 1024, // 100MB
            audio: 50 * 1024 * 1024, // 50MB
            file: 50 * 1024 * 1024, // 50MB
        };

        const allowedTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            video: ['video/mp4', 'video/webm', 'video/quicktime'],
            audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
            file: [], // Allow all file types
        };

        if (file.size > maxSizes[type]) {
            throw new Error(`File size exceeds ${maxSizes[type] / (1024 * 1024)}MB limit`);
        }

        if (allowedTypes[type].length > 0 && !allowedTypes[type].includes(file.type)) {
            throw new Error(`File type ${file.type} is not allowed`);
        }

        return true;
    },
};
