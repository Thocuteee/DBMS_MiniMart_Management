package com.sieuthi.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/nhan-vien").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/nhan-vien/**", "/api/v1/nhan-vien").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/nhan-vien/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/nhan-vien/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/khach-hang/dang-ky").hasAnyRole("ADMIN", "THU_NGAN", "NHAN_VIEN")
                .requestMatchers(HttpMethod.GET, "/api/v1/khach-hang/**", "/api/v1/khach-hang").hasAnyRole("ADMIN", "THU_NGAN", "NHAN_VIEN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/khach-hang/**").hasAnyRole("ADMIN", "THU_NGAN", "NHAN_VIEN", "KHACH_HANG")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/khach-hang/**").hasAnyRole("ADMIN", "THU_NGAN", "NHAN_VIEN")
                .requestMatchers(HttpMethod.POST, "/api/v1/san-pham/**", "/api/v1/danh-muc/**", "/api/v1/nha-cung-cap/**", "/api/v1/nhap-kho/**", "/api/v1/ton-kho/dieu-chuyen").hasAnyRole("ADMIN", "THU_KHO")
                .requestMatchers(HttpMethod.PUT, "/api/v1/san-pham/**", "/api/v1/danh-muc/**", "/api/v1/nha-cung-cap/**").hasAnyRole("ADMIN", "THU_KHO")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/san-pham/**", "/api/v1/danh-muc/**", "/api/v1/nha-cung-cap/**").hasAnyRole("ADMIN", "THU_KHO")
                .requestMatchers(HttpMethod.GET, "/api/v1/san-pham/**", "/api/v1/danh-muc/**", "/api/v1/nha-cung-cap/**", "/api/v1/nhap-kho/**", "/api/v1/ton-kho/**").authenticated()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Update in production
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
