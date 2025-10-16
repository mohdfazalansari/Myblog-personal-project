package myblog.com.Myblog.Service;

import lombok.RequiredArgsConstructor;
import myblog.com.Myblog.DTOs.RegisterRequest;
import myblog.com.Myblog.Entity.Role;
import myblog.com.Myblog.Entity.User;
import myblog.com.Myblog.Exception.UserAlreadyExistsException;
import myblog.com.Myblog.Repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * This method is required by the UserDetailsService interface and is used by Spring Security
     * to load a user by their username (in our case, the email) during authentication.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    /**
     * Creates and saves a new user to the database during registration.
     * @param request The registration request DTO containing user details.
     * @return The saved User entity.
     */
    public User registerUser(RegisterRequest request) {
                // CHECK IF USER ALREADY EXISTS
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists.");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // CRITICAL: Always encode the password before saving!
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(Role.ROLE_USER)); // Assign a default role
        
        return userRepository.save(user);
    }
}
