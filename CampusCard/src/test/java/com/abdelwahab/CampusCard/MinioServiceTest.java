package com.abdelwahab.CampusCard;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import com.abdelwahab.CampusCard.service.MinioService;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;

@ExtendWith(MockitoExtension.class)
public class MinioServiceTest {

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private MinioService minioService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(minioService, "bucketName", "uploads");
        ReflectionTestUtils.setField(minioService, "minioUrl", "http://localhost:9000");
    }

    @Test
    void shouldCreateBucketIfNotExists() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(false);

        minioService.ensureBucketExists();

        verify(minioClient).bucketExists(any(BucketExistsArgs.class));
        verify(minioClient).makeBucket(any(MakeBucketArgs.class));
    }

    @Test
    void shouldNotCreateBucketIfExists() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        minioService.ensureBucketExists();

        verify(minioClient).bucketExists(any(BucketExistsArgs.class));
        verify(minioClient, never()).makeBucket(any(MakeBucketArgs.class));
    }

    @Test
    void shouldUploadProfilePhotoSuccessfully() throws Exception {
        Integer userId = 1;
        byte[] content = "fake image content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.jpg",
                "image/jpeg",
                content
        );

        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        String url = minioService.uploadProfilePhoto(userId, file);

        assertNotNull(url);
        assertTrue(url.contains("/uploads/1/profile_photo.jpg"));
        verify(minioClient).putObject(any(PutObjectArgs.class));
    }

    @Test
    void shouldUploadNationalIdScanSuccessfully() throws Exception {
        Integer userId = 2;
        byte[] content = "fake id scan content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "id_scan.png",
                "image/png",
                content
        );

        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        String url = minioService.uploadNationalIdScan(userId, file);

        assertNotNull(url);
        assertTrue(url.contains("/uploads/2/national_id_scan.png"));
        verify(minioClient).putObject(any(PutObjectArgs.class));
    }

    @Test
    void shouldFailToUploadEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        Exception exception = assertThrows(RuntimeException.class, () -> {
            minioService.uploadProfilePhoto(1, emptyFile);
        });

        assertTrue(exception.getMessage().contains("empty"));
    }

    @Test
    void shouldFailToUploadNonImageFile() {
        MockMultipartFile textFile = new MockMultipartFile(
                "file",
                "document.txt",
                "text/plain",
                "some text".getBytes()
        );

        Exception exception = assertThrows(RuntimeException.class, () -> {
            minioService.uploadProfilePhoto(1, textFile);
        });

        assertTrue(exception.getMessage().contains("image"));
    }

    @Test
    void shouldFailToUploadFileTooLarge() {
        byte[] largeContent = new byte[11 * 1024 * 1024]; // 11MB
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeContent
        );

        Exception exception = assertThrows(RuntimeException.class, () -> {
            minioService.uploadProfilePhoto(1, largeFile);
        });

        assertTrue(exception.getMessage().contains("10MB"));
    }

    @Test
    void shouldDeleteFileSuccessfully() throws Exception {
        String objectName = "1/profile_photo.jpg";

        minioService.deleteFile(objectName);

        verify(minioClient).removeObject(any(RemoveObjectArgs.class));
    }

    @Test
    void shouldExtractObjectNameFromUrl() {
        String fileUrl = "http://localhost:9000/uploads/1/profile_photo.jpg";

        String objectName = minioService.extractObjectName(fileUrl);

        assertEquals("1/profile_photo.jpg", objectName);
    }

    @Test
    void shouldReturnNullForInvalidUrl() {
        String invalidUrl = "http://example.com/some/path/file.jpg";

        String objectName = minioService.extractObjectName(invalidUrl);

        assertNull(objectName);
    }

    @Test
    void shouldReturnNullForEmptyUrl() {
        String objectName = minioService.extractObjectName("");
        assertNull(objectName);

        objectName = minioService.extractObjectName(null);
        assertNull(objectName);
    }

    @Test
    void shouldHandleFileWithDifferentExtensions() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        // Test PNG
        MockMultipartFile pngFile = new MockMultipartFile(
                "file", "test.png", "image/png", "content".getBytes()
        );
        String pngUrl = minioService.uploadProfilePhoto(1, pngFile);
        assertTrue(pngUrl.contains(".png"));

        // Test JPEG
        MockMultipartFile jpegFile = new MockMultipartFile(
                "file", "test.jpeg", "image/jpeg", "content".getBytes()
        );
        String jpegUrl = minioService.uploadProfilePhoto(2, jpegFile);
        assertTrue(jpegUrl.contains(".jpeg"));

        // Test JPG
        MockMultipartFile jpgFile = new MockMultipartFile(
                "file", "test.jpg", "image/jpg", "content".getBytes()
        );
        String jpgUrl = minioService.uploadProfilePhoto(3, jpgFile);
        assertTrue(jpgUrl.contains(".jpg"));
    }

    @Test
    void shouldUseUserIdInFilePath() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", "content".getBytes()
        );

        // Test with different user IDs
        String url1 = minioService.uploadProfilePhoto(1, file);
        assertTrue(url1.contains("/1/profile_photo"));

        String url2 = minioService.uploadProfilePhoto(123, file);
        assertTrue(url2.contains("/123/profile_photo"));

        String url3 = minioService.uploadNationalIdScan(456, file);
        assertTrue(url3.contains("/456/national_id_scan"));
    }
}
