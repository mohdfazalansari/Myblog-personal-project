package myblog.com.Myblog.Config;

import myblog.com.Myblog.Security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF as we use stateless JWTs
                .csrf(AbstractHttpConfigurer::disable)

                // ** IMPORTANT: We disable Spring Security's built-in CORS handling
                // because we are using a more powerful global filter (in WebConfig). **
                .cors(AbstractHttpConfigurer::disable)

                // Define authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints that do not require a token
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll() // Allow image viewing
                        .requestMatchers(HttpMethod.POST, "/api/categories").authenticated()

                        // All other requests must be authenticated
                        .anyRequest().authenticated()
                )

                // Use stateless session management
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}