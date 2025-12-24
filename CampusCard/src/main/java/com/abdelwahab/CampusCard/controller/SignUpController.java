package com.abdelwahab.CampusCard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.abdelwahab.CampusCard.dto.SignUpRequest;
import com.abdelwahab.CampusCard.dto.SignUpResponse;
import com.abdelwahab.CampusCard.service.SignUpService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/signup")
@RequiredArgsConstructor
public class SignUpController {
    
    private final SignUpService signUpService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SignUpResponse> createNewUser(@Valid @ModelAttribute SignUpRequest request) {
        try {
            SignUpResponse signUpResponse = signUpService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(signUpResponse); // 201
        } catch (RuntimeException e) {
            SignUpResponse errorResponse = SignUpResponse.builder()
                .status("ERROR")
                .message(e.getMessage())
                .build();
            return ResponseEntity.badRequest().body(errorResponse); // 400
        }
    }
    
}

