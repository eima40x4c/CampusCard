package com.abdelwahab.CampusCard.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.abdelwahab.CampusCard.model.Department;
import com.abdelwahab.CampusCard.model.Faculty;
import com.abdelwahab.CampusCard.model.Profile;
import com.abdelwahab.CampusCard.model.User;
import com.abdelwahab.CampusCard.repository.DepartmentRepository;
import com.abdelwahab.CampusCard.repository.FacultyRepository;
import com.abdelwahab.CampusCard.repository.ProfileRepository;
import com.abdelwahab.CampusCard.repository.UserRepository;

@Configuration
public class AdminUserInitializer {
    @Bean
    public CommandLineRunner createAdminUser(UserRepository userRepository,
                                             ProfileRepository profileRepository,
                                             FacultyRepository facultyRepository,
                                             DepartmentRepository departmentRepository) {
        return args -> {
            String adminEmail = "Mohamed170408@eng.psu.edu.eg";
            if (userRepository.findByEmail(adminEmail) == null) {
                Faculty faculty = facultyRepository.findById(1).orElse(null);
                Department department = departmentRepository.findById(4).orElse(null);
                if (faculty != null && department != null) {
                    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                    String rawPassword = "123456789";
                    String hashedPassword = encoder.encode(rawPassword);
                    User admin = User.builder()
                        .email(adminEmail)
                        .password(hashedPassword)
                        .firstName("Mohamed")
                        .lastName("Ahmed")
                        .birthDate(java.time.LocalDate.of(2000, 3, 13))
                        .nationalId("30303130300275")
                        .nationalIdScan("/home/mohamed/Pictures/myphotos/fared.jpeg")
                        .role(User.Role.ADMIN)
                        .status(User.Status.APPROVED)
                        .emailVerified(true)
                        .year(5)
                        .faculty(faculty)
                        .department(department)
                        .build();
                    admin = userRepository.save(admin);
                    Profile profile = Profile.builder()
                        .user(admin)
                        .profilePhoto("/home/mohamed/Pictures/myphotos/Mohamed.jpeg")
                        .bio("System Administrator")
                        .visibility(Profile.Visibility.PRIVATE)
                        .build();
                    profileRepository.save(profile);
                }
            }
        };
    }
}
