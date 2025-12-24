package com.abdelwahab.CampusCard.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.abdelwahab.CampusCard.dto.LoginRequest;
import com.abdelwahab.CampusCard.dto.LoginResponse;
import com.abdelwahab.CampusCard.model.User;
import com.abdelwahab.CampusCard.repository.UserRepository;
import com.abdelwahab.CampusCard.security.JwtService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse login(LoginRequest request) {

        String identifier = request.identifier();
        User user;

        // Check if identifier is email format, otherwise treat as national ID
        if(identifier.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            // Use instance method (userRepository) not class (UserRepository)
            user = userRepository.findByEmail(request.identifier());
            if (user == null) {
                throw new RuntimeException("User with this email not found");
            }
        } else {
            // Use instance method (userRepository) not class (UserRepository)
            user = userRepository.findByNationalId(request.identifier());
            if (user == null) {
                throw new RuntimeException("User with this national ID not found");
            }
        }

        // Verify password matches
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Note: PENDING and REJECTED users can login, but their accounts will be private
        // Access control will be handled at the feature level based on status

        // Generate JWT token
        String token = jwtService.generateToken(
            user.getEmail(),
            user.getId().longValue(),
            user.getRole().name()
        );

        // Return response with correct parameter order: token, id, email, role, status, message
        return new LoginResponse(
            token,
            user.getId().longValue(), 
            user.getEmail(),
            user.getRole().getValue(),
            user.getStatus().name(),
            "Login successful"
        );
    }
}
