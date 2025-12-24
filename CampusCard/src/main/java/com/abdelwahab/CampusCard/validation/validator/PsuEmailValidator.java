package com.abdelwahab.CampusCard.validation.validator;

import com.abdelwahab.CampusCard.validation.annotation.PsuEmail;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PsuEmailValidator implements ConstraintValidator<PsuEmail, String> {
    
    private static final String DOMAIN = "@eng.psu.edu.eg";

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isBlank()) return false;
        return email.toLowerCase().endsWith(DOMAIN);
    }
}
