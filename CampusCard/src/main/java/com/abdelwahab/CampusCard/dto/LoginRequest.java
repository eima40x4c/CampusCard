package com.abdelwahab.CampusCard.dto;

import jakarta.validation.constraints.NotBlank;

public record  LoginRequest (

    @NotBlank(message = "Identifier is required")
    String identifier,

    @NotBlank(message = "password is required")
    String password
) {};
