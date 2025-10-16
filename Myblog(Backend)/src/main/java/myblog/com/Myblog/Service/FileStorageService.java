package myblog.com.Myblog.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // Define the location where files will be stored
    private final Path uploadDir = Paths.get("src/main/resources/static/uploads");

    public FileStorageService() {
        try {
            // Create the directory if it doesn't exist
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        // Generate a unique filename to prevent overwriting
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        try {
            Path targetLocation = this.uploadDir.resolve(uniqueFileName);
            
            // Copy the file to the target location
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // Return the public-facing path to the file
            return "/uploads/" + uniqueFileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + uniqueFileName, e);
        }
    }
}