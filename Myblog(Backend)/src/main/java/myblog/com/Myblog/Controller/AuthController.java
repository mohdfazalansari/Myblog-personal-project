package myblog.com.Myblog.Controller;

import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import myblog.com.Myblog.DTOs.AuthResponse;
import myblog.com.Myblog.DTOs.LoginRequest;
import myblog.com.Myblog.DTOs.RegisterRequest;
import myblog.com.Myblog.Entity.User;
import myblog.com.Myblog.Service.JwtService;
import myblog.com.Myblog.Service.UserService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        final UserDetails userDetails = userService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(new HashMap<>(), userDetails);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}