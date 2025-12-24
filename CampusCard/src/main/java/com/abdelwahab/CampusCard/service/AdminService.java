package com.abdelwahab.CampusCard.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.abdelwahab.CampusCard.dto.AdminDashboardStats;
import com.abdelwahab.CampusCard.dto.BannedWordResponse;
import com.abdelwahab.CampusCard.dto.FlaggedContentResponse;
import com.abdelwahab.CampusCard.dto.UserApprovalResponse;
import com.abdelwahab.CampusCard.model.BannedWord;
import com.abdelwahab.CampusCard.model.FlaggedContent;
import com.abdelwahab.CampusCard.model.Profile;
import com.abdelwahab.CampusCard.model.User;
import com.abdelwahab.CampusCard.repository.BannedWordRepository;
import com.abdelwahab.CampusCard.repository.FlaggedContentRepository;
import com.abdelwahab.CampusCard.repository.ProfileRepository;
import com.abdelwahab.CampusCard.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service for admin operations including user approval workflow.
 * 
 * Admins can:
 * - View all pending user registrations
 * - Approve/reject users after verifying email and comparing photos
 * - View system statistics
 * - Send email verification requests
 */
@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final BannedWordRepository bannedWordRepository;
    private final FlaggedContentRepository flaggedContentRepository;
    
    /**
     * Get all users pending approval.
     * Includes email verification status and photo URLs for comparison.
     */
    public List<UserApprovalResponse> getPendingApprovals() {
        List<User> pendingUsers = userRepository.findByStatus(User.Status.PENDING);
        return pendingUsers.stream()
                .map(this::buildUserApprovalResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all users (for bulk management).
     */
    public List<UserApprovalResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::buildUserApprovalResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific user's details for approval review.
     */
    public UserApprovalResponse getUserForApproval(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildUserApprovalResponse(user);
    }
    
    /**
     * Approve a user after verifying email and photo match.
     * 
     * @param userId User to approve
     * @param adminId Admin making the decision
     */
    @Transactional
    public UserApprovalResponse approveUser(Integer userId, Integer adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getStatus() != User.Status.PENDING) {
            throw new RuntimeException("User is not in pending status");
        }
        
        // Check if email is verified
        if (!user.getEmailVerified()) {
            throw new RuntimeException("Cannot approve user with unverified email. Please verify email first.");
        }
        
        user.setStatus(User.Status.APPROVED);
        user.setRejectionReason(null); // Clear any previous rejection reason
        User savedUser = userRepository.save(user);
        
        return buildUserApprovalResponse(savedUser);
    }
    
    /**
     * Reject a user with optional reason.
     * 
     * @param userId User to reject
     * @param adminId Admin making the decision
     * @param reason Optional rejection reason
     */
    @Transactional
    public UserApprovalResponse rejectUser(Integer userId, Integer adminId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getStatus() != User.Status.PENDING) {
            throw new RuntimeException("User is not in pending status");
        }
        
        user.setStatus(User.Status.REJECTED);
        user.setRejectionReason(reason);
        User savedUser = userRepository.save(user);
        
        return buildUserApprovalResponse(savedUser);
    }
    
    /**
     * Send email verification token to user.
     * 
     * Generates a unique token and sends it to the user's email.
     * Token is valid for 24 hours.
     * 
     * @param userId User to send verification to
     * @return Verification token (returned for testing mode)
     */
    @Transactional
    public String sendEmailVerification(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        
        // Generate verification token
        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationSentAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Send email with verification link
        try {
            emailService.sendVerificationEmail(user.getEmail(), userId, token);
        } catch (Exception e) {
            // If email fails in production, log but still return token for testing
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
        
        return token;
    }
    
    /**
     * Verify user's email with token.
     * 
     * @param userId User ID
     * @param token Verification token
     */
    @Transactional
    public void verifyEmail(Integer userId, String token) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        
        if (user.getEmailVerificationToken() == null || !user.getEmailVerificationToken().equals(token)) {
            throw new RuntimeException("Invalid verification token");
        }
        
        // Check if token is expired (24 hours)
        if (user.getEmailVerificationSentAt() != null && 
            user.getEmailVerificationSentAt().plusHours(24).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }
        
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null); // Clear token after verification
        userRepository.save(user);
    }
    
    /**
     * Get dashboard statistics for admin overview.
     */
    public AdminDashboardStats getDashboardStats() {
        return AdminDashboardStats.builder()
                .totalUsers(userRepository.count())
                .pendingApprovals(userRepository.countByStatus(User.Status.PENDING))
                .approvedUsers(userRepository.countByStatus(User.Status.APPROVED))
                .rejectedUsers(userRepository.countByStatus(User.Status.REJECTED))
                .studentsCount(userRepository.countByRole(User.Role.STUDENT))
                .adminsCount(userRepository.countByRole(User.Role.ADMIN))
                .verifiedEmails(userRepository.countByEmailVerified(true))
                .unverifiedEmails(userRepository.countByEmailVerified(false))
                .build();
    }
    
    /**
     * Build UserApprovalResponse from User entity.
     */
    private UserApprovalResponse buildUserApprovalResponse(User user) {
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String registrationDate = user.getCreatedAt() != null ? 
                user.getCreatedAt().format(formatter) : null;
        
        return UserApprovalResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .emailVerified(user.getEmailVerified())
                .nationalId(user.getNationalId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthDate(user.getBirthDate())
                .status(user.getStatus().getValue())
                .role(user.getRole().getValue())
                .year(user.getYear())
                .faculty(user.getFaculty().getName())
                .department(user.getDepartment().getName())
                .profilePhotoUrl(profile != null ? profile.getProfilePhoto() : null)
                .nationalIdScanUrl(user.getNationalIdScan())
                .registrationDate(registrationDate)
                .build();
    }

    /**
     * Get all banned words for content moderation.
     */
    public List<BannedWordResponse> getAllBannedWords() {
        List<BannedWord> words = bannedWordRepository.findAllByOrderByWordAsc();
        return words.stream()
                .map(word -> BannedWordResponse.builder()
                        .id(word.getId())
                        .word(word.getWord())
                        .addedAt(word.getAddedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Add a new banned word.
     */
    @Transactional
    public BannedWordResponse addBannedWord(String word) {
        if (word == null || word.trim().isEmpty()) {
            throw new RuntimeException("Word cannot be empty");
        }
        
        String normalizedWord = word.trim().toLowerCase();
        
        // Check if word already exists
        BannedWord existing = bannedWordRepository.findByWord(normalizedWord);
        if (existing != null) {
            throw new RuntimeException("Word already exists in banned list");
        }
        
        BannedWord bannedWord = BannedWord.builder()
                .word(normalizedWord)
                .build();
        
        BannedWord saved = bannedWordRepository.save(bannedWord);
        
        return BannedWordResponse.builder()
                .id(saved.getId())
                .word(saved.getWord())
                .addedAt(saved.getAddedAt())
                .build();
    }

    /**
     * Delete a banned word.
     */
    @Transactional
    public void deleteBannedWord(Integer wordId) {
        BannedWord word = bannedWordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("Banned word not found"));
        bannedWordRepository.delete(word);
    }

    /**
     * Get all flagged content for admin review.
     */
    public List<FlaggedContentResponse> getFlaggedContent() {
        List<FlaggedContent> content = flaggedContentRepository.findAllByOrderByFlaggedAtDesc();
        return content.stream()
                .map(fc -> FlaggedContentResponse.builder()
                        .id(fc.getId())
                        .userId(fc.getUser().getId())
                        .userEmail(fc.getUser().getEmail())
                        .userName(fc.getUser().getFirstName() + " " + fc.getUser().getLastName())
                        .content(fc.getContent())
                        .flaggedAt(fc.getFlaggedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Change a user's role (e.g., promote student to admin or demote admin to student).
     * 
     * @param userId User whose role is being changed
     * @param newRole New role (STUDENT or ADMIN)
     * @param adminId Admin making the change
     * @return Updated user response
     */
    @Transactional
    public UserApprovalResponse changeUserRole(Integer userId, String newRole, Integer adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent admin from changing their own role
        if (userId.equals(adminId)) {
            throw new RuntimeException("Cannot change your own role");
        }
        
        // Validate role
        User.Role role;
        try {
            role = User.Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Must be STUDENT or ADMIN");
        }
        
        // Update role
        user.setRole(role);
        User savedUser = userRepository.save(user);
        
        return buildUserApprovalResponse(savedUser);
    }
}
