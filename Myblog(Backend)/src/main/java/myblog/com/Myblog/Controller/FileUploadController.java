package myblog.com.Myblog.Controller;

import lombok.RequiredArgsConstructor;
import myblog.com.Myblog.Service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    // This endpoint only accepts multipart/form-data requests
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, Principal principal) {
        // Ensure the user is authenticated before allowing an upload
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        String fileUrl = fileStorageService.storeFile(file);
        
        // Return the URL in a JSON object
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }
}