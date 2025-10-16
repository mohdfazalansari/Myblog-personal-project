package myblog.com.Myblog.Config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Collections;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * This method configures how Spring serves static resources like images.
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("classpath:/static/uploads/");
    }

    /**
     * --- THIS IS THE FINAL FIX ---
     * This bean creates a global CORS filter that is registered at the highest
     * precedence. This ensures it runs before Spring Security's filters and
     * correctly applies a permissive CORS policy to ALL incoming requests.
     */
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (important for your API calls with JWT)
        config.setAllowCredentials(true);
        
        // Allow requests from your frontend's origin
        config.setAllowedOrigins(List.of("http://127.0.0.1:5500", "http://localhost:5500"));
        
        // Allow all necessary HTTP methods
        config.setAllowedMethods(Collections.singletonList("*")); // Allow all methods
        
        // Allow all headers
        config.setAllowedHeaders(Collections.singletonList("*")); // Allow all headers
        
        source.registerCorsConfiguration("/**", config);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        // Set the order to the highest precedence
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        
        return bean;
    }
}