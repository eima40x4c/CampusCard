package com.abdelwahab.CampusCard.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.UpdateTimestamp;

import com.abdelwahab.CampusCard.converter.VisibilityConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "profiles")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(optional = false) // optinal = false is equivalent to NOT NULL
    @JoinColumn(
        name = "user_id",
        referencedColumnName = "id",
        unique = true,
        nullable = false
    )
    private User user;

    @Column(name = "profile_photo", length = 255)
    private String profilePhoto;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String linkedin;

    @Column(length = 255)
    private String github;

    @Column(columnDefinition = "TEXT")
    private String interests;

    @Column(nullable = false)
    @Builder.Default
    @Convert(converter = VisibilityConverter.class)
    private Visibility visibility = Visibility.PUBLIC;

    @UpdateTimestamp
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    
    public enum Visibility {
        PUBLIC("public"),
        STUDENTS_ONLY("students_only"),
        PRIVATE("private");

        private final String value;

        Visibility(String value) {
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
    
        
}
