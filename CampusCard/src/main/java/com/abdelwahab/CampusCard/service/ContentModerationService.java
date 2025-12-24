package com.abdelwahab.CampusCard.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.abdelwahab.CampusCard.model.BannedWord;
import com.abdelwahab.CampusCard.model.FlaggedContent;
import com.abdelwahab.CampusCard.model.User;
import com.abdelwahab.CampusCard.repository.BannedWordRepository;
import com.abdelwahab.CampusCard.repository.FlaggedContentRepository;
import com.abdelwahab.CampusCard.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentModerationService {
    
    private final BannedWordRepository bannedWordRepository;
    private final FlaggedContentRepository flaggedContentRepository;
    private final UserRepository userRepository;

    /**
     * Check if text contains any banned words
     * @param text The text to check
     * @return List of banned words found in the text (empty if none found)
     */
    public List<String> checkForBannedWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return List.of();
        }

        String lowerText = text.toLowerCase();
        List<BannedWord> allBannedWords = bannedWordRepository.findAll();
        
        return allBannedWords.stream()
                .map(BannedWord::getWord)
                .filter(word -> lowerText.contains(word.toLowerCase()))
                .collect(Collectors.toList());
    }

    /**
     * Check if text contains any banned words (boolean result)
     * @param text The text to check
     * @return true if banned words are found, false otherwise
     */
    public boolean containsBannedWords(String text) {
        return !checkForBannedWords(text).isEmpty();
    }

    /**
     * Validate multiple text fields for banned words
     * @param fields Map of field names to text values
     * @return Map of field names to lists of banned words found
     */
    public java.util.Map<String, List<String>> validateFields(java.util.Map<String, String> fields) {
        java.util.Map<String, List<String>> violations = new java.util.HashMap<>();
        
        for (java.util.Map.Entry<String, String> entry : fields.entrySet()) {
            List<String> bannedWords = checkForBannedWords(entry.getValue());
            if (!bannedWords.isEmpty()) {
                violations.put(entry.getKey(), bannedWords);
            }
        }
        
        return violations;
    }

    /**
     * Log a content moderation violation for admin review
     * @param userId The user ID who attempted to post the content
     * @param fieldName The field name where the violation occurred
     * @param content The content that was flagged
     * @param bannedWords The banned words found
     */
    public void logViolation(Integer userId, String fieldName, String content, List<String> bannedWords) {
        log.warn("Content Moderation Violation - User ID: {}, Field: {}, Banned Words: {}, Content Preview: {}",
                userId, fieldName, bannedWords, 
                content != null && content.length() > 50 ? content.substring(0, 50) + "..." : content);
        
        // Save to flagged_content table for admin review
        try {
            User user = userRepository.findById(userId)
                    .orElse(null);
            
            if (user != null && content != null) {
                String flaggedMessage = String.format(
                    "[Field: %s] Banned words detected: %s | Content: %s",
                    fieldName,
                    String.join(", ", bannedWords),
                    content.length() > 500 ? content.substring(0, 500) + "..." : content
                );
                
                FlaggedContent flaggedContent = FlaggedContent.builder()
                        .user(user)
                        .content(flaggedMessage)
                        .build();
                
                flaggedContentRepository.save(flaggedContent);
            }
        } catch (Exception e) {
            log.error("Failed to save flagged content: {}", e.getMessage());
        }
    }
}

