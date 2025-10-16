package myblog.com.Myblog.JwtProperties; // Or any appropriate package

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Component
@ConfigurationProperties(prefix = "app.jwt")
@Data // From Lombok, for getters and setters
public class JwtProperties {
    private String secret;
    private long expirationMs;
}