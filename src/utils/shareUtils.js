import { Share } from 'react-native';

export const sharePost = async (title, description) => {
    try {
        await Share.share({
            message: `${title}\n\n${description || ''}`,
        });
    } catch (error) {
        console.error('Share error:', error);
    }
};
