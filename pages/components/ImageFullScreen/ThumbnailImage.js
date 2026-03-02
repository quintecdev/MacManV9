import React, { useState, useEffect } from 'react';
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    Modal,
    View,
    ActivityIndicator,
    Dimensions,
    TouchableWithoutFeedback,
    Text,
    Platform
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * @module ImageFullScreen
 * @created 2024-06-01
 * @author vibin
 * 
 * ThumbnailImage Component
 * @param {string} imageUrl - The URL or URI of the image to display
 * @param {boolean} disableOnPress - Disable the onPress functionality (default: true)
 * @param {number} width - Width of the thumbnail (default: 100)
 * @param {number} height - Height of the thumbnail (default: 100)
 * @param {number} marginEnd - Margin on the end side (default: 5)
 * @param {any} defaultImage - Default image to show when image fails to load
 * @param {function} onPress - Custom onPress handler (overrides default navigation)
 * @param {object} style - Custom style for the image
 * @param {object} containerStyle - Custom style for the TouchableOpacity container
 */

const ThumbnailImage = ({
    imageUrl,
    disableOnPress = true,
    width = 100,
    height = 100,
    marginEnd = 5,
    defaultImage = require('../../../assets/placeholders/no_image.png'),
    onPress,
    style,
    containerStyle
}) => {
    const [imageError, setImageError] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [previewImageError, setPreviewImageError] = useState(false);
    const [imageKey, setImageKey] = useState(0);

    // Clear image cache and reset states when modal closes to free memory
    useEffect(() => {
        if (!modalVisible) {
            // Delay cleanup to ensure smooth modal close animation
            const cleanupTimer = setTimeout(() => {
                console.log('Cleaning up image memory...');
                setImageKey(prev => prev + 1); // Force unmount/remount of Image
                setPreviewLoading(true); // Reset loading state
                setPreviewImageError(false); // Reset error state
            }, 300);
            
            return () => clearTimeout(cleanupTimer);
        }
    }, [modalVisible]);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (!disableOnPress) {
            console.log('Opening modal with imageUrl:', imageUrl);
            setModalVisible(true);
            setPreviewLoading(true);
            setPreviewImageError(false);
        }
    };

    const closeModal = () => {
        console.log('Closing modal and cleaning memory...');
        setModalVisible(false);
    };

    console.log('Rendering ThumbnailImage with imageUrl:', imageUrl);

    return (
        <>
            <TouchableOpacity
                onPress={handlePress}
                disabled={disableOnPress}
                style={containerStyle}
                activeOpacity={0.7}
            >
                <View style={[{ width, height, marginEnd }, style]}>
                    {loading && (
                        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
                            <ActivityIndicator size="small" color="#999999" />
                        </View>
                    )}
                    <ImageBackground
                        key={imageUrl}
                        style={{ width: '100%', height: '100%' }}
                        source={imageError || !imageUrl ? defaultImage : { uri: imageUrl }}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => {
                            setImageError(true);
                            setLoading(false);
                        }}
                        resizeMode="cover"
                    />
                </View>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        onPress={closeModal}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    <TouchableWithoutFeedback onPress={closeModal}>
                        <View style={styles.modalBackground} />
                    </TouchableWithoutFeedback>

                    <View style={styles.imageContainer}>
                        {previewLoading && !previewImageError && modalVisible && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#ffffff" />
                                <Text style={styles.loadingText}>Loading...</Text>
                            </View>
                        )}

                        {!previewImageError && imageUrl && modalVisible ? (
                            <Image
                                key={`modal-image-${imageKey}`}
                                source={{ 
                                    uri: imageUrl,
                                    cache: 'reload'
                                }}
                                style={styles.fullImage}
                                resizeMode="contain"
                                resizeMethod="resize" 
                                onLoadStart={() => {
                                    console.log('Image loading started');
                                    setPreviewLoading(true);
                                }}
                                onLoad={() => {
                                    console.log('Image loaded successfully');
                                    setPreviewLoading(false);
                                }}
                                onLoadEnd={() => {
                                    console.log('Image load ended');
                                    setPreviewLoading(false);
                                }}
                                onError={(error) => {
                                    console.log('Image load error:', error.nativeEvent?.error || 'Unknown error');
                                    console.log('Failed URL:', imageUrl);
                                    setPreviewLoading(false);
                                    setPreviewImageError(true);
                                }}
                            />
                        ) : null}
                        
                        {previewImageError && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Failed to load image</Text>
                                <Text style={styles.smallErrorText}>Memory issue - Image too large</Text>
                                <Text style={styles.urlText} numberOfLines={2}>{imageUrl}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 999,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    fullImage: {
        width: SCREEN_WIDTH * 0.95,
        height: SCREEN_HEIGHT * 0.85,
        maxWidth: 1200, 
        maxHeight: 1200,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingText: {
        color: '#ffffff',
        fontSize: 16,
        marginTop: 10,
    },
    errorContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    smallErrorText: {
        color: '#ffcccc',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
    },
    urlText: {
        color: '#999999',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default ThumbnailImage;
