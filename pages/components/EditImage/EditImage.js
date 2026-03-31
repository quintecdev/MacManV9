import PhotoEditor from '@thienmd/react-native-image-editor';
import RNGRP from 'react-native-get-real-path';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

/**
 * Saves a file to the device gallery (Pictures directory) and triggers a media scan.
 * @param {string} sourcePath - Absolute file path of the image to save
 * @returns {Promise<string>} - The gallery file path
 */
const saveToGallery = async (sourcePath) => {
    try {
        const fileName = sourcePath.split('/').pop() || `edited_${Date.now()}.jpg`;
        const destDir = Platform.OS === 'android'
            ? `${RNFS.ExternalStorageDirectoryPath}/Pictures/MacMan`
            : RNFS.LibraryDirectoryPath;

        // Ensure directory exists
        const dirExists = await RNFS.exists(destDir);
        if (!dirExists) {
            await RNFS.mkdir(destDir);
        }

        const destPath = `${destDir}/${fileName}`;
        await RNFS.copyFile(sourcePath, destPath);

        // Trigger media scanner on Android so the image shows up in gallery
        if (Platform.OS === 'android') {
            await RNFS.scanFile(destPath);
        }

        console.log('Image saved to gallery:', destPath);
        return destPath;
    } catch (error) {
        console.warn('Failed to save image to gallery:', error);
        // Don't throw — saving to gallery is best-effort, the edited image still works
        return null;
    }
};

/**
 * Opens the native photo editor for the given image.
 * Returns a Promise that resolves with { uri, base64 } of the edited image,
 * or null if the user cancels. Also saves the edited image to the device gallery.
 *
 * @param {string} imageUri - The URI of the image (content://, file://, or absolute path)
 * @param {object} [options] - Optional overrides
 * @param {string[]} [options.hiddenControls] - Controls to hide: 'text','clear','draw','save','share','sticker','crop'
 * @param {string[]} [options.stickers] - Array of sticker image names
 * @returns {Promise<{uri: string, base64: string, path: string, galleryPath: string|null}|null>}
 */
const EditImage = async (imageUri, options = {}) => {
    // Resolve content:// URIs to real file paths
    let filePath = imageUri;
    if (imageUri.startsWith('content://')) {
        filePath = await RNGRP.getRealPathFromURI(imageUri);
    } else if (imageUri.startsWith('file://')) {
        filePath = imageUri.replace('file://', '');
    }

    return new Promise((resolve) => {
        PhotoEditor.Edit({
            path: filePath,
            hiddenControls: options.hiddenControls || ['save', 'sticker'],
            stickers: options.stickers || [],
            languages: {
                doneTitle: 'Done',
                saveTitle: 'Save',
                clearAllTitle: 'Clear all',
                cameraTitle: 'Camera',
                galleryTitle: 'Gallery',
                uploadDialogTitle: 'Upload Image',
                uploadPickerTitle: 'Select Picture',
                directoryCreateFail: 'Failed to create directory',
                accessMediaPermissionsMsg: 'To attach photos, we need to access media on your device',
                continueTxt: 'Continue',
                notNow: 'NOT NOW',
                mediaAccessDeniedMsg: 'You denied storage access, no photos will be added.',
                saveImageSucceed: 'Image saved',
                eraserTitle: 'Eraser',
            },
            onDone: async (editedImagePath) => {
                try {
                    const uri = editedImagePath.startsWith('file://')
                        ? editedImagePath
                        : `file://${editedImagePath}`;

                    // Only save to gallery if not already in gallery
                    // let galleryPath = null;
                    // if (!editedImagePath.includes('/Pictures/MacMan/')) {
                         await saveToGallery(editedImagePath);
                    // } else {
                    //     galleryPath = editedImagePath;
                    // }
                    // Only convert to base64 if needed for upload
                    let base64 = null;
                    if (options.needBase64) {
                        base64 = await RNFS.readFile(editedImagePath, 'base64');
                    }
                    resolve({ uri, base64, path: editedImagePath });
                } catch (error) {
                    console.error('EditImage onDone error:', error);
                    resolve(null);
                }
            },
            
            onCancel: () => {
                resolve(null);
            },
        });
    });
};

export default EditImage;