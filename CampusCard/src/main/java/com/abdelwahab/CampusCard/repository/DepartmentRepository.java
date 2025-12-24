package com.abdelwahab.CampusCard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.abdelwahab.CampusCard.model.Department;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
    List<Department> findByFacultyId(Integer facultyId);
    Department findByNameAndFacultyId(String name, Integer facultyId);
}
