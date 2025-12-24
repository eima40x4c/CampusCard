package com.abdelwahab.CampusCard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.abdelwahab.CampusCard.repository.UserRepository;
import com.abdelwahab.CampusCard.security.JwtAuthenticationFilter;
import com.abdelwahab.CampusCard.security.JwtService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService, userRepository);
    }

    /**
     * Configures the security filter chain for HTTP requests.
     * This is the main security configuration for the application.
     * 
     * @param http - HttpSecurity object used to configure web-based security
     * @return SecurityFilterChain - the built security filter chain
     * @throws Exception if configuration fails
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*"); // Allow all origins (for development)
        configuration.addAllowedMethod("*"); // Allow all HTTP methods
        configuration.addAllowedHeader("*"); // Allow all headers
        configuration.setAllowCredentials(true); // Allow credentials (cookies, auth headers)
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF (Cross-Site Request Forgery) protection
            // Safe for stateless REST APIs since we're not using cookies/sessions
            // CSRF protection is mainly needed for browser-based form submissions
            .csrf(csrf -> csrf.disable())
            
            // Disable HTTP Basic authentication prompt
            // We're using custom authentication (JWT tokens), not basic auth
            .httpBasic(httpBasic -> httpBasic.disable())
            
            // Disable form login
            // We're using REST API with JSON, not HTML forms
            .formLogin(form -> form.disable())
            
            // Configure session management to be STATELESS
            // This means the server won't create or use HTTP sessions
            // Each request must contain all authentication info (e.g., JWT token)
            // Lambda syntax: session -> session.method() is equivalent to:
            // sessionManagement(new Customizer<SessionManagementConfigurer>() {
            //     public void customize(SessionManagementConfigurer session) {
            //         session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
            //     }
            // })
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configure authorization rules for HTTP requests
            // Lambda parameter 'auth' is an AuthorizeHttpRequestsConfigurer
            .authorizeHttpRequests(auth -> auth
                // Allow public access to /api/signup and /api/login endpoints without authentication
                // .requestMatchers() - specifies which URLs this rule applies to
                // .permitAll() - allows anyone to access without credentials
                .requestMatchers("/api/signup", "/api/login").permitAll()
                
                // Allow public access to public API endpoints (faculties, departments)
                .requestMatchers("/api/public/**").permitAll()
                
                // Allow public access to profile endpoints (visibility is checked in service layer)
                // GET /api/profile/{userId} - visibility is enforced in ProfileService
                .requestMatchers("/api/profile/**").permitAll()
                
                // Admin endpoints - require ADMIN role
                // Only users with ROLE_ADMIN can access /api/admin/**
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // All other requests require authentication
                // .anyRequest() - matches all URLs not covered by previous rules
                // .authenticated() - requires user to be authenticated (logged in)
                .anyRequest().authenticated()
            );
        

        // register JWT filter
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        // Build and return the configured SecurityFilterChain
        // This chain will be applied to all incoming HTTP requests
        return http.build();
    }
}
