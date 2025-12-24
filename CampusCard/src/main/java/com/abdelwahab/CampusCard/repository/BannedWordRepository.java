package com.abdelwahab.CampusCard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.abdelwahab.CampusCard.model.BannedWord;

import java.util.List;

public interface BannedWordRepository extends JpaRepository<BannedWord, Integer> {
    BannedWord findByWord(String word);
    List<BannedWord> findAllByOrderByWordAsc();
}
