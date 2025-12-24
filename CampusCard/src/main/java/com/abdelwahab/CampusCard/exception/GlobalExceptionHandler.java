package com.abdelwahab.CampusCard.exception;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for the application.
 * 
 * This class uses @RestControllerAdvice to handle exceptions across all controllers
 * in a centralized manner, providing consistent error responses to clients.
 * 
 * Purpose:
 * - Catches validation errors from @Valid annotations on controller method parameters
 * - Transforms Spring's validation exceptions into user-friendly error messages
 * - Returns proper HTTP status codes (400 Bad Request) for validation failures
 * 
 * Without this handler, validation errors would result in 403 Forbidden or default
 * Spring error pages, which are not appropriate for a REST API.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors when @Valid annotation fails on request bodies.
     * 
     * When a client sends invalid data (e.g., invalid phone number, email format, etc.),
     * Spring's Bean Validation throws MethodArgumentNotValidException. This method
     * catches that exception and returns a clean error response.
     * 
     * Example scenarios:
     * - Invalid phone number format: "phone: Phone number must be between 10 and 20 digits"
     * - Invalid LinkedIn URL: "linkedin: Invalid LinkedIn URL"
     * - Invalid visibility value: "visibility: Visibility must be PUBLIC or PRIVATE"
     * 
     * @param ex The exception containing all validation errors from the request
     * @return ResponseEntity with 400 status and map containing field-level error messages
     * 
     * Response format: {"message": "field1: error message, field2: error message"}
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        // Extract all field errors from the binding result
        // Each error contains the field name and the validation message
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        
        // Return 400 Bad Request with the error message
        // Map.of() creates an immutable map with the error message
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", errorMessage));
    }
}
