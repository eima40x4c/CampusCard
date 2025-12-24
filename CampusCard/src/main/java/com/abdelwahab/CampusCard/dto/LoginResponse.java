package com.abdelwahab.CampusCard.dto;

public record LoginResponse(
    String token,
    Long id,
    String email,
    String role,
    String status,
    String message
) {}

