package com.abdelwahab.CampusCard.service;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.url}")
    private String minioUrl;

    /**
     * Ensure bucket exists, create if it doesn't
     */
    public void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );
            
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build()
                );
                log.info("Created bucket: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Error checking/creating bucket: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize MinIO bucket", e);
        }
    }

    /**
     * Upload profile photo for user
     * Path: uploads/{userId}/profile_photo.{ext}
     */
    public String uploadProfilePhoto(Integer userId, MultipartFile file) {
        validateImageFile(file);
        
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String objectName = String.format("%d/profile_photo.%s", userId, fileExtension);
        
        return uploadFile(file, objectName);
    }

    /**
     * Upload national ID scan for user
     * Path: uploads/{userId}/national_id_scan.{ext}
     */
    public String uploadNationalIdScan(Integer userId, MultipartFile file) {
        validateImageFile(file);
        
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String objectName = String.format("%d/national_id_scan.%s", userId, fileExtension);
        
        return uploadFile(file, objectName);
    }

    /**
     * Upload file to MinIO
     */
    private String uploadFile(MultipartFile file, String objectName) {
        try {
            ensureBucketExists();
            
            InputStream inputStream = file.getInputStream();
            
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            
            String fileUrl = String.format("%s/%s/%s", minioUrl, bucketName, objectName);
            log.info("File uploaded successfully: {}", fileUrl);
            
            return fileUrl;
            
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file to MinIO", e);
        }
    }

    /**
     * Delete file from MinIO
     */
    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("File deleted successfully: {}", objectName);
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage());
            throw new RuntimeException("Failed to delete file from MinIO", e);
        }
    }

    /**
     * Validate that the file is an image
     */
    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        // Validate file size (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new RuntimeException("File size exceeds 10MB limit");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File must be an image");
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg"; // default extension
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Extract object name from full URL
     * Example: http://localhost:9000/uploads/1/profile_photo.jpg -> 1/profile_photo.jpg
     */
    public String extractObjectName(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }
        
        // Remove the base URL and bucket name
        String prefix = String.format("%s/%s/", minioUrl, bucketName);
        if (fileUrl.startsWith(prefix)) {
            return fileUrl.substring(prefix.length());
        }
        
        return null;
    }
}
