import React, { useState } from 'react';
import { uploadProfilePicture, deleteProfilePicture } from '../services/profileService';

const ProfilePictureUpload = ({ userId, currentPic, onUpload, onDelete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      const result = await uploadProfilePicture(file);
      if (onUpload) onUpload(result.file_path);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPic || !currentPic.includes('/uploads/')) return;
    
    try {
      setIsDeleting(true);
      await deleteProfilePicture();
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      alert('Failed to delete profile picture');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
        <img
          src={currentPic || '/default-avatar.png'}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm">Uploading...</div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 text-center text-sm">
          {isUploading ? 'Uploading...' : 'Change Picture'}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        
        {currentPic && currentPic.includes('/uploads/') && (
          <button
            onClick={handleDelete}
            disabled={isDeleting || isUploading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 text-sm"
          >
            {isDeleting ? 'Deleting...' : 'Remove Picture'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
