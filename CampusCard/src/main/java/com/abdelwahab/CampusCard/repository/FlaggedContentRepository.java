package com.abdelwahab.CampusCard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.abdelwahab.CampusCard.model.FlaggedContent;
import com.abdelwahab.CampusCard.model.User;

import java.util.List;

public interface FlaggedContentRepository extends JpaRepository<FlaggedContent, Integer> {
    List<FlaggedContent> findByUser(User user);
    List<FlaggedContent> findByUserIdOrderByFlaggedAtDesc(Integer userId);
    List<FlaggedContent> findAllByOrderByFlaggedAtDesc();
}
