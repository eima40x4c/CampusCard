package com.abdelwahab.CampusCard.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.abdelwahab.CampusCard.dto.SignUpRequest;
import com.abdelwahab.CampusCard.dto.SignUpResponse;
import com.abdelwahab.CampusCard.model.Department;
import com.abdelwahab.CampusCard.model.Faculty;
import com.abdelwahab.CampusCard.model.Profile;
import com.abdelwahab.CampusCard.model.User;
import com.abdelwahab.CampusCard.repository.DepartmentRepository;
import com.abdelwahab.CampusCard.repository.FacultyRepository;
import com.abdelwahab.CampusCard.repository.ProfileRepository;
import com.abdelwahab.CampusCard.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SignUpService {
    
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final MinioService minioService;

    @Transactional
    public SignUpResponse registerUser(SignUpRequest request) {
        // Validation is handled by @Valid annotation in controller

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email already registered");
        }

        // Check if national ID already exists
        if (userRepository.findByNationalId(request.getNationalId()) != null) {
            throw new RuntimeException("National ID already registered");
        }

        // Validate faculty exists
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
            .orElseThrow(() -> new RuntimeException("Faculty not found"));

        // Validate department exists and belongs to the faculty
        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));
        
        if (!department.getFaculty().getId().equals(faculty.getId())) {
            throw new RuntimeException("Department does not belong to the selected faculty");
        }

        // Validate year is within faculty's year range
        if (request.getYear() < 1 || request.getYear() > faculty.getYearsNumbers()) {
            throw new RuntimeException("Invalid year for the selected faculty");
        }

        // Create new user with temporary national ID scan placeholder
        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .birthDate(request.getDateOfBirth())
            .nationalId(request.getNationalId())
            .nationalIdScan("temp") // Temporary placeholder
            .year(request.getYear())
            .faculty(faculty)
            .department(department)
            .build();

        User savedUser = userRepository.save(user);

        // Upload national ID scan to MinIO using the saved user's ID
        String scanUrl = minioService.uploadNationalIdScan(savedUser.getId(), request.getNationalIdScan());
        savedUser.setNationalIdScan(scanUrl);
        userRepository.save(savedUser);

        // Create default profile for the user
        Profile profile = Profile.builder()
            .user(savedUser)
            .visibility(Profile.Visibility.PUBLIC)
            .build();
        profileRepository.save(profile);

        return SignUpResponse.builder()
            .id(savedUser.getId())
            .email(savedUser.getEmail())
            .status(savedUser.getStatus().name())
            .message("User registered successfully. Awaiting admin approval.")
            .build();
    }
}
