package com.abdelwahab.CampusCard.model;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.abdelwahab.CampusCard.converter.RoleConverter;
import com.abdelwahab.CampusCard.converter.StatusConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="users")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(unique=true, nullable=false)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(name="first_name", nullable=false, length=50)
    private String firstName;

    @Column(name="last_name", nullable=false, length=50)
    private String lastName;

    @Column(name="birth_date")
    private java.time.LocalDate birthDate;

    @Column(name="national_id", unique=true, nullable=false, length=50)
    private String nationalId;

    @Column(name="national_id_scan", nullable=false)
    private String nationalIdScan;

    @Column(nullable=false, length=20)
    @Builder.Default
    @Convert(converter = RoleConverter.class)
    private Role role = Role.STUDENT;

    @Column(nullable=false, length=20)
    @Builder.Default
    @Convert(converter = StatusConverter.class)
    private Status status = Status.PENDING;

    @Column(name="email_verified", nullable=false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name="email_verification_token")
    private String emailVerificationToken;

    @Column(name="email_verification_sent_at")
    private LocalDateTime emailVerificationSentAt;

    @Column(name="rejection_reason")
    private String rejectionReason;

    @Column(nullable = false)
    private Integer year;

    @ManyToOne(optional=false)
    @JoinColumn(name="faculty_id", nullable=false)
    private Faculty faculty;

    @ManyToOne(optional=false)
    @JoinColumn(name="department_id", nullable=false)
    private Department department;

    @CreationTimestamp
    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        STUDENT("student"),
        ADMIN("admin");

        private final String value;

        Role(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public enum Status {
        PENDING("pending"),
        APPROVED("approved"),
        REJECTED("rejected");

        private final String value;

        Status(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
}
