package com.abdelwahab.CampusCard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.abdelwahab.CampusCard.model.Faculty;

public interface FacultyRepository extends JpaRepository<Faculty, Integer> {
    Faculty findByName(String name);
}