package com.abdelwahab.CampusCard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.abdelwahab.CampusCard.dto.LoginRequest;
import com.abdelwahab.CampusCard.dto.LoginResponse;
import com.abdelwahab.CampusCard.service.LoginService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequestMapping("api/login")
@RequiredArgsConstructor
public class LoginController {
    
    private final LoginService loginService;

    @PostMapping
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for identifier: {}", request.identifier());
        try {
            LoginResponse response = loginService.login(request);
            log.info("Login successful for: {}", request.identifier());
            return ResponseEntity.ok(response); // 200
        } catch (RuntimeException e) {
            log.error("Login failed for {}: {}", request.identifier(), e.getMessage());
            LoginResponse error = new LoginResponse(
                "ERROR",
                null, e.getMessage(),
                null,
                null,
                null
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error); // 401
        }
    }
    
}
