package com.abdelwahab.CampusCard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.abdelwahab.CampusCard.model.User;

public interface UserRepository extends JpaRepository<User, Integer>{
    User findByEmail(String email);
    User findByNationalId(String nationalId);
    
    // Admin dashboard queries
    List<User> findByStatus(User.Status status);
    Long countByStatus(User.Status status);
    Long countByRole(User.Role role);
    Long countByEmailVerified(Boolean emailVerified);
}
